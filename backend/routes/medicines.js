const express = require('express');
const Medicine = require('../models/Medicine');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/medicines
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page=1, limit=60, category, search, prescriptionRequired, sort='name' } = req.query;
    const skip = (parseInt(page)-1)*parseInt(limit);
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (prescriptionRequired !== undefined) filter.prescriptionRequired = prescriptionRequired === 'true';
    if (search) filter.$text = { $search: search };
    const sortMap = { name:{name:1}, price_asc:{price:1}, price_desc:{price:-1}, rating:{rating:-1} };
    const [medicines, total] = await Promise.all([
      Medicine.find(filter).sort(sortMap[sort]||{name:1}).skip(skip).limit(parseInt(limit)),
      Medicine.countDocuments(filter)
    ]);
    res.json({ medicines, pagination: { currentPage:parseInt(page), totalPages:Math.ceil(total/parseInt(limit)), totalItems:total } });
  } catch(err) { res.status(500).json({ message:'Server error' }); }
});

// GET /api/medicines/categories
router.get('/categories', async (req, res) => {
  try {
    const counts = await Medicine.aggregate([
      { $match:{ isActive:true } },
      { $group:{ _id:'$category', count:{ $sum:1 } } },
      { $sort:{ _id:1 } }
    ]);
    res.json({ categories: counts });
  } catch(err) { res.status(500).json({ message:'Server error' }); }
});

// GET /api/medicines/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message:'Medicine not found' });
    res.json({ medicine });
  } catch(err) { res.status(500).json({ message:'Server error' }); }
});

module.exports = router;
