const mongoose = require('mongoose');

const nearbyPharmacySchema = new mongoose.Schema({
  name: String,
  distance: String,
  address: String,
  rating: Number
}, { _id: false });

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brandName: { type: String, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Fever & Pain Relief', 'Cold & Cough', 'Antibiotics', 'Diabetes Medicines',
      'Blood Pressure Medicines', 'Heart Medicines', 'Vitamins & Supplements',
      'Digestive Health', 'Skin Care', 'Eye Care', 'Allergy Medicines',
      'Respiratory Medicines', "Women's Health", "Men's Health", 'Baby Care',
      'First Aid', 'Medical Devices', 'Ayurvedic & Herbal', 'Immunity Boosters',
      'Fitness & Nutrition'
    ]
  },
  imageUrl: { type: String, default: '' },
  description: { type: String, required: true },
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Gel', 'Drops', 'Powder', 'Inhaler', 'Strip', 'Device', 'Lotion', 'Ointment', 'Sachet'],
    required: true
  },
  strength: String,
  manufacturer: String,
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  rating: { type: Number, default: 4.0, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  stockStatus: { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'], default: 'In Stock' },
  deliveryAvailable: { type: Boolean, default: true },
  nearbyPharmacies: [nearbyPharmacySchema],
  // Safety info
  usageInstructions: String,
  sideEffects: [String],
  warnings: [String],
  ageRestriction: String,
  pregnancyWarning: String,
  storageInstructions: String,
  // Prescription
  prescriptionRequired: { type: Boolean, default: false },
  prescriptionUploadRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String]
}, { timestamps: true });

medicineSchema.index({ name: 'text', brandName: 'text', description: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ prescriptionRequired: 1 });
medicineSchema.index({ price: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
