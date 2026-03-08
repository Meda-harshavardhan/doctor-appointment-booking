const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Blood Tests', 'Urine Tests', 'Diabetes Tests', 'Thyroid Tests',
      'Liver Function Tests', 'Kidney Function Tests', 'Lipid Profile Tests',
      'Vitamin & Mineral Tests', 'Hormone Tests', 'Cardiac Tests',
      'Infection & Disease Tests', 'Cancer Screening Tests', 'Allergy Tests',
      'Pregnancy Tests', 'Genetic Tests', 'Imaging & Radiology', 'Health Packages', 'Other'
    ],
    default: 'Other'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  sampleType: {
    type: String,
    enum: ['Blood', 'Urine', 'Saliva', 'Stool', 'Swab', 'Tissue', 'Sputum', 'N/A', 'Multiple'],
    default: 'Blood'
  },
  preparationInstructions: {
    type: String,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters'],
    default: 'No special preparation required.'
  },
  estimatedReportTime: {
    type: String,
    default: '24 hours'
  },
  normalRange: {
    type: String,
    default: 'Refer to report'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  popularityFlag: {
    type: String,
    enum: ['Common', 'Advanced'],
    default: 'Common'
  },
  duration: {
    type: String,
    default: '15-30 minutes'
  },
  performedBy: {
    type: String,
    default: 'Certified Lab Technician'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isPackage: {
    type: Boolean,
    default: false
  },
  packageTests: [String],
  recommendedAgeGroup: String,
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, { timestamps: true });

labTestSchema.index({ name: 'text', description: 'text' });
labTestSchema.index({ category: 1 });
labTestSchema.index({ isActive: 1 });
labTestSchema.index({ popularityFlag: 1 });
labTestSchema.index({ isPackage: 1 });

module.exports = mongoose.model('LabTest', labTestSchema);
