const mongoose = require('mongoose');

const labTestBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  labTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: true
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  patientPhone: {
    type: String,
    required: true
  },
  labLocation: {
    type: String,
    default: 'PulseAppoint Diagnostics – Main Center'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'sample_collected', 'report_ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment: {
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    method: { type: String, default: 'razorpay' },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date
  }
}, { timestamps: true });

labTestBookingSchema.index({ userId: 1, createdAt: -1 });
labTestBookingSchema.index({ labTestId: 1 });
labTestBookingSchema.index({ bookingStatus: 1 });
labTestBookingSchema.index({ bookingDate: 1 });

module.exports = mongoose.model('LabTestBooking', labTestBookingSchema);
