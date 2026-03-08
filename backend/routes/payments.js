const express = require('express');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const { verifyToken, requirePatient } = require('../middleware/auth');

const router = express.Router();

// Helper: get Razorpay instance lazily (so missing keys don't crash on startup)
let _razorpay = null;
function getRazorpay() {
  if (_razorpay) return _razorpay;
  const Razorpay = require('razorpay');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
  }
  _razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return _razorpay;
}

// ─────────────────────────────────────────────────────────
// POST /api/payments/create-order
// Creates a Razorpay order for an appointment.
// Falls back to "free" confirmation when keys are not set.
// ─────────────────────────────────────────────────────────
router.post('/create-order', verifyToken, requirePatient, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'consultationFee');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.payment?.status === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    const feeInRupees = appointment.doctorId?.consultationFee || appointment.payment?.amount || 0;

    // ── No keys configured → free-mode fallback ──
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      appointment.payment = {
        ...appointment.payment,
        status: 'paid',
        method: 'free',
        transactionId: `free_${Date.now()}`,
        paidAt: new Date(),
      };
      if (appointment.status === 'pending') appointment.status = 'confirmed';
      await appointment.save();

      return res.json({
        mode: 'free',
        message: 'Appointment confirmed (Razorpay keys not configured — free mode)',
        order: {
          id: `free_order_${appointmentId}`,
          amount: feeInRupees,
          currency: 'INR',
        },
      });
    }

    // ── Real Razorpay order ──
    const razorpay = getRazorpay();
    const amountPaise = Math.round(feeInRupees * 100); // Razorpay expects paise

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `appt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId.toString(),
        patientId: req.user._id.toString(),
      },
    });

    // Persist razorpay order id on appointment
    appointment.payment = {
      ...appointment.payment,
      razorpayOrderId: order.id,
      amount: feeInRupees,
      status: 'pending',
    };
    await appointment.save();

    res.json({
      mode: 'razorpay',
      order: {
        id: order.id,
        amount: order.amount,       // in paise
        currency: order.currency,
        receipt: order.receipt,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Server error while creating order' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/payments/verify
// Verifies the Razorpay signature after successful payment.
// ─────────────────────────────────────────────────────────
router.post('/verify', verifyToken, requirePatient, async (req, res) => {
  try {
    const {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If already paid (e.g. free mode), just return success
    if (appointment.payment?.status === 'paid') {
      return res.json({
        message: 'Payment already verified',
        payment: appointment.payment,
        appointment: { id: appointment._id, status: appointment.status },
      });
    }

    // Verify Razorpay signature
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Razorpay secret not configured' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed: invalid signature' });
    }

    // Mark payment as completed
    appointment.payment = {
      ...appointment.payment,
      status: 'paid',
      method: 'razorpay',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      transactionId: razorpay_payment_id,
      paidAt: new Date(),
    };
    if (appointment.status === 'pending') appointment.status = 'confirmed';
    await appointment.save();

    res.json({
      message: 'Payment verified successfully',
      payment: {
        status: appointment.payment.status,
        amount: appointment.payment.amount,
        transactionId: appointment.payment.transactionId,
        paidAt: appointment.payment.paidAt,
      },
      appointment: {
        id: appointment._id,
        status: appointment.status,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message || 'Server error while verifying payment' });
  }
});

module.exports = router;
