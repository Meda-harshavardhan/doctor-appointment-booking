const express = require('express');
const crypto = require('crypto');
const LabTest = require('../models/LabTest');
const LabTestBooking = require('../models/LabTestBooking');
const { verifyToken, requirePatient } = require('../middleware/auth');

const router = express.Router();

// ── helper: require admin role ──────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// ── helper: lazy Razorpay init ──────────────────────────────────────────
let _razorpay = null;
function getRazorpay() {
  if (_razorpay) return _razorpay;
  const Razorpay = require('razorpay');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  _razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return _razorpay;
}

// ════════════════════════════════════════════════════════════
// PUBLIC — Browse lab tests
// ════════════════════════════════════════════════════════════

// GET /api/lab-tests
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [tests, total] = await Promise.all([
      LabTest.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      LabTest.countDocuments(filter)
    ]);
    res.json({ tests, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lab-tests/categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await LabTest.distinct('category', { isActive: true });
    res.json({ categories: cats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lab-tests/:id
router.get('/:id', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test || !test.isActive) return res.status(404).json({ message: 'Lab test not found' });
    res.json({ test });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════
// PATIENT — Bookings
// ════════════════════════════════════════════════════════════

// POST /api/lab-tests/:id/book  — create booking & razorpay order
router.post('/:id/book', verifyToken, requirePatient, async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test || !test.isActive) return res.status(404).json({ message: 'Lab test not found' });

    const { bookingDate, timeSlot, patientName, patientAge, patientPhone, labLocation, notes } = req.body;
    if (!bookingDate || !timeSlot || !patientName || !patientAge || !patientPhone) {
      return res.status(400).json({ message: 'All patient details are required' });
    }

    // Create booking
    const booking = await LabTestBooking.create({
      userId: req.user._id,
      labTestId: test._id,
      bookingDate: new Date(bookingDate),
      timeSlot,
      patientName,
      patientAge: Number(patientAge),
      patientPhone,
      labLocation: labLocation || 'PulseAppoint Diagnostics – Main Center',
      notes,
      payment: { amount: test.price, status: 'pending' }
    });

    // Try Razorpay order
    const razorpay = getRazorpay();
    if (!razorpay) {
      // Free mode
      booking.payment.status = 'paid';
      booking.payment.method = 'free';
      booking.payment.transactionId = `free_${Date.now()}`;
      booking.payment.paidAt = new Date();
      booking.bookingStatus = 'confirmed';
      await booking.save();
      return res.status(201).json({ mode: 'free', booking });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(test.price * 100),
      currency: 'INR',
      receipt: `lab_${booking._id}`,
      notes: { bookingId: booking._id.toString() }
    });

    booking.payment.razorpayOrderId = order.id;
    await booking.save();

    res.status(201).json({
      mode: 'razorpay',
      booking: { _id: booking._id },
      order: { id: order.id, amount: order.amount, currency: order.currency },
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Lab test booking error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/lab-tests/bookings/:bookingId/verify
router.post('/bookings/:bookingId/verify', verifyToken, requirePatient, async (req, res) => {
  try {
    const booking = await LabTestBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    if (booking.payment?.status === 'paid') return res.json({ message: 'Already paid', booking });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ message: 'Razorpay not configured' });

    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSig !== razorpay_signature) return res.status(400).json({ message: 'Invalid payment signature' });

    booking.payment.status = 'paid';
    booking.payment.method = 'razorpay';
    booking.payment.razorpayPaymentId = razorpay_payment_id;
    booking.payment.razorpaySignature = razorpay_signature;
    booking.payment.transactionId = razorpay_payment_id;
    booking.payment.paidAt = new Date();
    booking.bookingStatus = 'confirmed';
    await booking.save();

    res.json({ message: 'Payment verified', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lab-tests/my/bookings — patient's own bookings
router.get('/my/bookings', verifyToken, requirePatient, async (req, res) => {
  try {
    const bookings = await LabTestBooking.find({ userId: req.user._id })
      .populate('labTestId', 'name category price imageUrl duration')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════
// ADMIN — Manage lab tests & view all bookings
// ════════════════════════════════════════════════════════════

// POST /api/lab-tests/admin/tests
router.post('/admin/tests', verifyToken, requireAdmin, async (req, res) => {
  try {
    const test = await LabTest.create(req.body);
    res.status(201).json({ message: 'Lab test created', test });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/lab-tests/admin/tests/:id
router.put('/admin/tests/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ message: 'Lab test not found' });
    res.json({ message: 'Lab test updated', test });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/lab-tests/admin/tests/:id
router.delete('/admin/tests/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!test) return res.status(404).json({ message: 'Lab test not found' });
    res.json({ message: 'Lab test deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lab-tests/admin/bookings
router.get('/admin/bookings', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { bookingStatus: status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      LabTestBooking.find(filter)
        .populate('userId', 'firstName lastName email phone')
        .populate('labTestId', 'name category price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LabTestBooking.countDocuments(filter)
    ]);
    res.json({ bookings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/lab-tests/admin/bookings/:id/status
router.patch('/admin/bookings/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { bookingStatus } = req.body;
    const booking = await LabTestBooking.findByIdAndUpdate(
      req.params.id, { bookingStatus }, { new: true }
    ).populate('userId', 'firstName lastName email').populate('labTestId', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking status updated', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: seed default tests if none exist ─────────────────────────────
// POST /api/lab-tests/admin/seed
router.post('/admin/seed', verifyToken, requireAdmin, async (req, res) => {
  try {
    const count = await LabTest.countDocuments();
    if (count > 0) return res.json({ message: `${count} tests already exist. Skipped seeding.` });

    const defaults = [
      {
        name: 'Complete Blood Count (CBC)',
        category: 'Blood Test',
        description: 'A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders, including anaemia, infection, and leukaemia.',
        preparationInstructions: 'Fasting for 8–12 hours before the test is recommended. Drink water freely.',
        price: 349,
        duration: '15–30 minutes',
        performedBy: 'Certified Haematology Technician',
        imageUrl: 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=600&auto=format&fit=crop',
        tags: ['blood', 'haemoglobin', 'WBC', 'RBC', 'routine']
      },
      {
        name: 'Lipid Profile',
        category: 'Blood Test',
        description: 'Measures cholesterol levels and triglycerides to assess cardiovascular risk. Includes HDL, LDL, VLDL, and total cholesterol.',
        preparationInstructions: 'Fast for 9–12 hours before sample collection. Avoid alcohol 24 hours before.',
        price: 499,
        duration: '20–30 minutes',
        performedBy: 'Certified Lab Technician',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&auto=format&fit=crop',
        tags: ['cholesterol', 'heart', 'cardiovascular', 'lipid']
      },
      {
        name: 'Thyroid Function Test (TFT)',
        category: 'Hormonal',
        description: 'Evaluates how well your thyroid gland is working. Measures TSH, T3, and T4 levels to diagnose hyperthyroidism or hypothyroidism.',
        preparationInstructions: 'No fasting required. Inform the doctor of any thyroid medications.',
        price: 599,
        duration: '20–30 minutes',
        performedBy: 'Endocrinology Lab Technician',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop',
        tags: ['thyroid', 'TSH', 'T3', 'T4', 'hormones']
      },
      {
        name: 'Blood Glucose (Diabetes) Test',
        category: 'Blood Test',
        description: 'Measures blood sugar levels to screen for and diagnose diabetes and pre-diabetes (HbA1c + Fasting Glucose).',
        preparationInstructions: 'Fast for 8–10 hours before the test. Any type of food or beverage other than water should be avoided.',
        price: 299,
        duration: '15–20 minutes',
        performedBy: 'Certified Lab Technician',
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop',
        tags: ['diabetes', 'glucose', 'HbA1c', 'sugar', 'fasting']
      },
      {
        name: 'Chest X-Ray',
        category: 'Imaging',
        description: 'A chest X-ray produces images of the heart, lungs, blood vessels, airways, and the bones of the chest and spine. Used to detect pneumonia, heart enlargement, and more.',
        preparationInstructions: 'Remove jewellery and metal accessories before the procedure. Wear comfortable clothing.',
        price: 450,
        duration: '10–15 minutes',
        performedBy: 'Radiologist & X-Ray Technician',
        imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop',
        tags: ['xray', 'chest', 'lungs', 'imaging', 'radiology']
      },
      {
        name: 'MRI Brain Scan',
        category: 'Imaging',
        description: 'A magnetic resonance imaging (MRI) scan of the brain to detect tumours, strokes, bleeding, damage from injury, and other problems.',
        preparationInstructions: 'Inform the technician of any metal implants. Remove all metal objects. You may be asked to avoid eating 4 hours before.',
        price: 4999,
        duration: '45–90 minutes',
        performedBy: 'Radiologist & MRI Technician',
        imageUrl: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&auto=format&fit=crop',
        tags: ['MRI', 'brain', 'imaging', 'neurological']
      },
      {
        name: 'Urine Routine & Microscopy',
        category: 'Urine Test',
        description: 'A complete urine examination to detect urinary tract infections (UTIs), kidney disease, diabetes, and other conditions.',
        preparationInstructions: 'Collect a mid-stream urine sample in the sterile container provided. Clean the genital area before sample collection.',
        price: 199,
        duration: '10–15 minutes',
        performedBy: 'Certified Lab Technician',
        imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop',
        tags: ['urine', 'UTI', 'kidney', 'routine']
      },
      {
        name: 'CT Scan – Abdomen',
        category: 'Imaging',
        description: 'A computed tomography (CT) scan of the abdomen provides detailed images of internal organs like the liver, kidneys, and intestines for diagnosing abdominal pain, masses, and more.',
        preparationInstructions: 'Fast for 4–6 hours before the scan. You may be given a contrast dye; inform the doctor of any allergies.',
        price: 3999,
        duration: '30–45 minutes',
        performedBy: 'Radiologist & CT Technician',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&auto=format&fit=crop',
        tags: ['CT', 'abdomen', 'imaging', 'scan']
      }
    ];

    await LabTest.insertMany(defaults);
    res.json({ message: `Seeded ${defaults.length} default lab tests.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
