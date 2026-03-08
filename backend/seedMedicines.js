require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('./models/Medicine');

const pharmacies = [
  { name: 'Apollo Pharmacy',   distance: '0.8 km', address: '12 MG Road, Near City Mall', rating: 4.5 },
  { name: 'MedPlus',           distance: '1.2 km', address: '45 Jubilee Hills Road No. 36', rating: 4.3 },
  { name: 'Netmeds Store',     distance: '1.8 km', address: '7 Banjara Hills, Main Road', rating: 4.4 },
  { name: 'City Care Pharmacy',distance: '0.5 km', address: 'Ground Floor, City Centre', rating: 4.1 },
  { name: 'Local Medical Store',distance: '0.3 km',address: 'Corner of Main Bazaar Street', rating: 3.9 },
];

const medicines = [
  // ── FEVER & PAIN RELIEF ──────────────────────────────────────────────────
  {
    name:'Paracetamol', brandName:'Crocin', category:'Fever & Pain Relief',
    description:'Used to relieve mild to moderate pain and reduce fever. Effective for headaches, toothache, backache and cold symptoms.',
    dosageForm:'Tablet', strength:'500 mg', manufacturer:'GSK Pharma', price:15, discountPercent:0,
    rating:4.7, reviewCount:12450, stockStatus:'In Stock',
    usageInstructions:'Take 1–2 tablets every 4–6 hours. Do not exceed 8 tablets in 24 hours.',
    sideEffects:['Nausea (rare)','Skin rash (allergic reaction)'],
    warnings:['Do not exceed recommended dose','Avoid alcohol','Consult doctor if fever persists more than 3 days'],
    storageInstructions:'Store below 25°C in a dry place', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2],pharmacies[3]],
    tags:['fever','pain','headache'],imageUrl:'https://via.placeholder.com/300x200/4CAF50/white?text=Paracetamol'
  },
  {
    name:'Dolo 650', brandName:'Dolo', category:'Fever & Pain Relief',
    description:'Paracetamol 650 mg for higher fever and moderate pain. Preferred for fast relief of fever above 100°F.',
    dosageForm:'Tablet', strength:'650 mg', manufacturer:'Micro Labs', price:30, discountPercent:5,
    rating:4.8, reviewCount:18320, stockStatus:'In Stock',
    usageInstructions:'1 tablet every 6 hours. Max 4 tablets per day.',
    sideEffects:['Hepatotoxicity on overdose'],
    warnings:['Do not take with other paracetamol products','Liver disease patients must consult doctor'],
    storageInstructions:'Store in cool dry place', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['fever','pain'],imageUrl:'https://via.placeholder.com/300x200/4CAF50/white?text=Dolo+650'
  },
  {
    name:'Ibuprofen', brandName:'Brufen', category:'Fever & Pain Relief',
    description:'NSAID for pain, fever, and inflammation. Effective for arthritis, menstrual cramps, and dental pain.',
    dosageForm:'Tablet', strength:'400 mg', manufacturer:'Abbott', price:45, discountPercent:10,
    rating:4.5, reviewCount:7820, stockStatus:'In Stock',
    usageInstructions:'Take with food 3 times a day.',
    sideEffects:['Stomach upset','Heartburn','Dizziness'],
    warnings:['Not for patients with kidney disease','Avoid in pregnancy 3rd trimester','Can cause stomach bleeding'],
    pregnancyWarning:'Avoid in third trimester', storageInstructions:'Store below 30°C',
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[2]],
    tags:['pain','inflammation','fever'],imageUrl:'https://via.placeholder.com/300x200/2196F3/white?text=Ibuprofen'
  },
  {
    name:'Diclofenac Sodium', brandName:'Voveran', category:'Fever & Pain Relief',
    description:'Prescription NSAID for moderate-to-severe pain, arthritis, and post-surgical pain.',
    dosageForm:'Tablet', strength:'50 mg', manufacturer:'Novartis', price:60, discountPercent:0,
    rating:4.4, reviewCount:5630, stockStatus:'In Stock',
    usageInstructions:'50 mg 2–3 times daily after food as directed.',
    sideEffects:['GI irritation','Headache','Elevated liver enzymes'],
    warnings:['Prescription required','Not for heart patients','Avoid long-term use'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['pain','arthritis'],imageUrl:'https://via.placeholder.com/300x200/FF5722/white?text=Diclofenac'
  },
  {
    name:'Aspirin', brandName:'Disprin', category:'Fever & Pain Relief',
    description:'Analgesic and blood thinner. Used for pain relief and to prevent heart attacks.',
    dosageForm:'Tablet', strength:'75 mg', manufacturer:'Reckitt', price:20, discountPercent:0,
    rating:4.3, reviewCount:4200, stockStatus:'In Stock',
    usageInstructions:'Dissolve in water before taking. 1–2 tablets as needed.',
    sideEffects:['GI bleeding','Tinnitus'],
    warnings:['Not for children under 12','Avoid with blood thinners'],
    ageRestriction:'Not for children under 12 years', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[1],pharmacies[3]],
    tags:['pain','blood thinner'],imageUrl:'https://via.placeholder.com/300x200/9C27B0/white?text=Aspirin'
  },

  // ── COLD & COUGH ────────────────────────────────────────────────────────
  {
    name:'Cetirizine', brandName:'Zyrtec', category:'Cold & Cough',
    description:'Antihistamine for allergic rhinitis, urticaria, and cold symptoms like runny nose and sneezing.',
    dosageForm:'Tablet', strength:'10 mg', manufacturer:'UCB Pharma', price:25, discountPercent:0,
    rating:4.6, reviewCount:9800, stockStatus:'In Stock',
    usageInstructions:'1 tablet once daily, preferably at bedtime.',
    sideEffects:['Drowsiness','Dry mouth','Dizziness'],
    warnings:['May cause drowsiness — avoid driving','Avoid alcohol'],
    storageInstructions:'Store below 30°C', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['allergy','cold','cough'],imageUrl:'https://via.placeholder.com/300x200/00BCD4/white?text=Cetirizine'
  },
  {
    name:'Benadryl Cough Syrup', brandName:'Benadryl', category:'Cold & Cough',
    description:'For dry and productive cough. Antihistamine + decongestant combination for cold relief.',
    dosageForm:'Syrup', strength:'100 ml', manufacturer:'Johnson & Johnson', price:95, discountPercent:5,
    rating:4.5, reviewCount:6700, stockStatus:'In Stock',
    usageInstructions:'Adults: 10 ml 3–4 times daily. Children (6–12): 5 ml.',
    sideEffects:['Drowsiness','Dry mouth'],
    warnings:['Do not take longer than 7 days','Avoid in children under 2'],
    ageRestriction:'Not for children under 2 years', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[3]],
    tags:['cough','cold'],imageUrl:'https://via.placeholder.com/300x200/FF9800/white?text=Benadryl'
  },
  {
    name:'Vicks VapoRub', brandName:'Vicks', category:'Cold & Cough',
    description:'Topical ointment for nasal congestion, cough, and minor aches from cold.',
    dosageForm:'Ointment', strength:'50 g', manufacturer:'P&G', price:75, discountPercent:0,
    rating:4.7, reviewCount:22100, stockStatus:'In Stock',
    usageInstructions:'Apply to chest, throat and back. Do not apply inside nostrils.',
    sideEffects:['Skin irritation (rare)'],
    warnings:['External use only','Keep away from eyes'],
    ageRestriction:'Not for infants under 2 years', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['cold','cough','congestion'],imageUrl:'https://via.placeholder.com/300x200/1565C0/white?text=Vicks'
  },
  {
    name:'ORS Sachet', brandName:'Electral', category:'Cold & Cough',
    description:'Oral Rehydration Salt for dehydration from diarrhoea, vomiting, fever and excessive sweating.',
    dosageForm:'Sachet', strength:'4.4 g', manufacturer:'FDC Ltd', price:12, discountPercent:0,
    rating:4.6, reviewCount:11200, stockStatus:'In Stock',
    usageInstructions:'Dissolve 1 sachet in 200 ml water. Drink frequently.',
    sideEffects:['None when taken correctly'],
    warnings:['Use freshly prepared solution only','Discard after 1 hour if unused'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2],pharmacies[3],pharmacies[4]],
    tags:['dehydration','diarrhoea','electrolytes'],imageUrl:'https://via.placeholder.com/300x200/4CAF50/white?text=ORS'
  },

  // ── ANTIBIOTICS ─────────────────────────────────────────────────────────
  {
    name:'Azithromycin', brandName:'Zithromax', category:'Antibiotics',
    description:'Macrolide antibiotic for bacterial infections including respiratory tract, skin and ENT infections.',
    dosageForm:'Tablet', strength:'500 mg', manufacturer:'Pfizer', price:120, discountPercent:0,
    rating:4.5, reviewCount:8340, stockStatus:'In Stock',
    usageInstructions:'500 mg once daily for 3 days as prescribed.',
    sideEffects:['Nausea','Diarrhoea','Abdominal pain'],
    warnings:['Complete full course','Do not skip doses','Not for self-medication'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['antibiotic','infection'],imageUrl:'https://via.placeholder.com/300x200/F44336/white?text=Azithromycin'
  },
  {
    name:'Amoxicillin', brandName:'Novamox', category:'Antibiotics',
    description:'Penicillin antibiotic for throat, ear, urinary and skin infections.',
    dosageForm:'Capsule', strength:'500 mg', manufacturer:'Cipla', price:85, discountPercent:0,
    rating:4.4, reviewCount:6720, stockStatus:'In Stock',
    usageInstructions:'500 mg 3 times daily for 5–7 days as prescribed.',
    sideEffects:['Diarrhoea','Rash','Nausea'],
    warnings:['Inform doctor about penicillin allergy','Complete full course'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[2]],
    tags:['antibiotic'],imageUrl:'https://via.placeholder.com/300x200/F44336/white?text=Amoxicillin'
  },
  {
    name:'Ciprofloxacin', brandName:'Ciplox', category:'Antibiotics',
    description:'Fluoroquinolone antibiotic for UTI, respiratory, GI and skin infections.',
    dosageForm:'Tablet', strength:'500 mg', manufacturer:'Cipla', price:95, discountPercent:0,
    rating:4.3, reviewCount:5400, stockStatus:'In Stock',
    usageInstructions:'500 mg twice daily for 7–14 days as prescribed.',
    sideEffects:['Nausea','Dizziness','Tendon problems'],
    warnings:['Avoid antacids','Stay hydrated','Not for children under 18'],
    ageRestriction:'Not for patients under 18 years', prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['antibiotic','UTI'],imageUrl:'https://via.placeholder.com/300x200/D32F2F/white?text=Ciprofloxacin'
  },

  // ── DIABETES MEDICINES ───────────────────────────────────────────────────
  {
    name:'Metformin', brandName:'Glycomet', category:'Diabetes Medicines',
    description:'First-line oral antidiabetic for Type 2 diabetes. Reduces hepatic glucose production.',
    dosageForm:'Tablet', strength:'500 mg', manufacturer:'USV Pharma', price:55, discountPercent:0,
    rating:4.6, reviewCount:14200, stockStatus:'In Stock',
    usageInstructions:'500–2000 mg daily with meals, as prescribed.',
    sideEffects:['Nausea','Diarrhoea','Stomach upset'],
    warnings:['Monitor kidney function regularly','Do not crush tablets','Avoid excess alcohol'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['diabetes','blood sugar'],imageUrl:'https://via.placeholder.com/300x200/3F51B5/white?text=Metformin'
  },
  {
    name:'Glimepiride', brandName:'Amaryl', category:'Diabetes Medicines',
    description:'Sulfonylurea drug to stimulate insulin release for Type 2 diabetes management.',
    dosageForm:'Tablet', strength:'2 mg', manufacturer:'Sanofi', price:180, discountPercent:5,
    rating:4.4, reviewCount:4300, stockStatus:'In Stock',
    usageInstructions:'Take with breakfast once daily as prescribed.',
    sideEffects:['Hypoglycaemia','Nausea','Dizziness'],
    warnings:['Monitor blood glucose','Do not skip meals after taking'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[3]],
    tags:['diabetes','insulin'],imageUrl:'https://via.placeholder.com/300x200/5C6BC0/white?text=Glimepiride'
  },
  {
    name:'Human Insulin Injection', brandName:'Huminsulin N', category:'Diabetes Medicines',
    description:'Insulin for Type 1 & Type 2 diabetes requiring insulin therapy.',
    dosageForm:'Injection', strength:'100 IU/ml', manufacturer:'Eli Lilly', price:340, discountPercent:0,
    rating:4.7, reviewCount:2100, stockStatus:'In Stock',
    usageInstructions:'As directed by diabetologist. Inject subcutaneously.',
    sideEffects:['Hypoglycaemia','Injection site reactions'],
    warnings:['Store in refrigerator 2–8°C','Prescription mandatory','Do not share needles'],
    storageInstructions:'Refrigerate 2–8°C. In-use vial at room temp for 28 days.',
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['diabetes','insulin','injection'],imageUrl:'https://via.placeholder.com/300x200/7986CB/white?text=Insulin'
  },
  {
    name:'Glucometer', brandName:'Accu-Chek Active', category:'Medical Devices',
    description:'Blood glucose monitoring device for diabetes management at home.',
    dosageForm:'Device', strength:'N/A', manufacturer:'Roche', price:1200, discountPercent:15,
    rating:4.7, reviewCount:8900, stockStatus:'In Stock',
    usageInstructions:'Follow device manual. Use lancet to prick finger, apply blood to test strip.',
    sideEffects:[],
    warnings:['Calibrate before first use','Do not use with expired strips'],
    storageInstructions:'Store at room temperature', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['diabetes','device','blood sugar'],imageUrl:'https://via.placeholder.com/300x200/263238/white?text=Glucometer'
  },

  // ── BLOOD PRESSURE ───────────────────────────────────────────────────────
  {
    name:'Amlodipine', brandName:'Norvasc / Amlokind', category:'Blood Pressure Medicines',
    description:'Calcium channel blocker for hypertension and angina. Relaxes blood vessels.',
    dosageForm:'Tablet', strength:'5 mg', manufacturer:'Pfizer / Mankind', price:75, discountPercent:0,
    rating:4.5, reviewCount:9200, stockStatus:'In Stock',
    usageInstructions:'5–10 mg once daily as prescribed.',
    sideEffects:['Ankle swelling','Headache','Flushing'],
    warnings:['Do not stop suddenly','Monitor BP regularly'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['BP','hypertension','heart'],imageUrl:'https://via.placeholder.com/300x200/E91E63/white?text=Amlodipine'
  },
  {
    name:'Telmisartan', brandName:'Telma', category:'Blood Pressure Medicines',
    description:'ARB for hypertension and heart failure. Blocks angiotensin receptors to lower BP.',
    dosageForm:'Tablet', strength:'40 mg', manufacturer:'Glenmark', price:130, discountPercent:10,
    rating:4.6, reviewCount:6700, stockStatus:'In Stock',
    usageInstructions:'40–80 mg once daily.',
    sideEffects:['Dizziness','Back pain','Hyperkalemia'],
    warnings:['Not in pregnancy','Monitor kidney function','Avoid potassium supplements'],
    pregnancyWarning:'Contraindicated in pregnancy', prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['BP','hypertension'],imageUrl:'https://via.placeholder.com/300x200/C2185B/white?text=Telmisartan'
  },
  {
    name:'BP Monitor', brandName:'Omron HEM-7120', category:'Medical Devices',
    description:'Digital upper arm blood pressure monitor for home use.',
    dosageForm:'Device', strength:'N/A', manufacturer:'Omron', price:2500, discountPercent:10,
    rating:4.7, reviewCount:5600, stockStatus:'In Stock',
    usageInstructions:'Rest 5 minutes before measuring. Use correct cuff size.',
    sideEffects:[],
    warnings:['Not a substitute for medical diagnosis'],
    storageInstructions:'Store in case away from moisture', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['BP','device','monitor'],imageUrl:'https://via.placeholder.com/300x200/37474F/white?text=BP+Monitor'
  },

  // ── HEART MEDICINES ──────────────────────────────────────────────────────
  {
    name:'Atorvastatin', brandName:'Lipitor / Atorva', category:'Heart Medicines',
    description:'Statin for lowering LDL cholesterol and preventing cardiovascular events.',
    dosageForm:'Tablet', strength:'10 mg', manufacturer:'Pfizer / Zydus', price:120, discountPercent:5,
    rating:4.6, reviewCount:8900, stockStatus:'In Stock',
    usageInstructions:'10–80 mg once daily in the evening.',
    sideEffects:['Muscle pain','Elevated liver enzymes','Nausea'],
    warnings:['Report unexplained muscle pain immediately','Avoid grapefruit juice'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['cholesterol','heart'],imageUrl:'https://via.placeholder.com/300x200/BF360C/white?text=Atorvastatin'
  },
  {
    name:'Clopidogrel', brandName:'Plavix', category:'Heart Medicines',
    description:'Antiplatelet agent to prevent blood clots after heart attack or stroke.',
    dosageForm:'Tablet', strength:'75 mg', manufacturer:'Sanofi', price:200, discountPercent:0,
    rating:4.5, reviewCount:4100, stockStatus:'In Stock',
    usageInstructions:'75 mg once daily as prescribed.',
    sideEffects:['Bleeding','Bruising','GI upset'],
    warnings:['Tell surgeon before any procedure','Avoid NSAIDs'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[2]],
    tags:['heart','blood clot','antiplatelet'],imageUrl:'https://via.placeholder.com/300x200/D84315/white?text=Clopidogrel'
  },

  // ── VITAMINS & SUPPLEMENTS ─────────────────────────────────────────────
  {
    name:'Vitamin D3', brandName:'Calcirol', category:'Vitamins & Supplements',
    description:'Vitamin D3 60000 IU sachets for vitamin D deficiency and bone health.',
    dosageForm:'Sachet', strength:'60000 IU', manufacturer:'Cadila', price:85, discountPercent:0,
    rating:4.6, reviewCount:12300, stockStatus:'In Stock',
    usageInstructions:'1 sachet dissolved in milk/water once weekly or as prescribed.',
    sideEffects:['Nausea on excess dose','Hypercalcemia on overdose'],
    warnings:['Do not exceed recommended dose','Monitor calcium levels'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['vitamin D','bone health','supplement'],imageUrl:'https://via.placeholder.com/300x200/FFC107/white?text=Vitamin+D3'
  },
  {
    name:'Vitamin B Complex', brandName:'Becosules', category:'Vitamins & Supplements',
    description:'B-complex vitamins for energy, nerve function, hair and skin health.',
    dosageForm:'Capsule', strength:'N/A', manufacturer:'Pfizer', price:160, discountPercent:10,
    rating:4.7, reviewCount:17800, stockStatus:'In Stock',
    usageInstructions:'1 capsule daily after meals.',
    sideEffects:['Urine discolouration (yellow/bright)'],
    warnings:['May colour urine — harmless'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2],pharmacies[3]],
    tags:['vitamin B','energy','supplement'],imageUrl:'https://via.placeholder.com/300x200/FF9800/white?text=Vitamin+B'
  },
  {
    name:'Zinc Tablet', brandName:'Zincovit', category:'Vitamins & Supplements',
    description:'Zinc supplement for immunity, wound healing, and reproductive health.',
    dosageForm:'Tablet', strength:'50 mg', manufacturer:'Alkem', price:120, discountPercent:5,
    rating:4.5, reviewCount:8700, stockStatus:'In Stock',
    usageInstructions:'1 tablet daily with food.',
    sideEffects:['Nausea','Stomach cramps on empty stomach'],
    warnings:['Avoid high dose over long term'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['zinc','immunity','supplement'],imageUrl:'https://via.placeholder.com/300x200/8BC34A/white?text=Zinc'
  },
  {
    name:'Vitamin C', brandName:'Limcee', category:'Vitamins & Supplements',
    description:'Chewable Vitamin C for immunity boost, antioxidant protection, and iron absorption.',
    dosageForm:'Tablet', strength:'500 mg', manufacturer:'Abbott', price:65, discountPercent:0,
    rating:4.7, reviewCount:15600, stockStatus:'In Stock',
    usageInstructions:'1 tablet chewed daily.',
    sideEffects:['Stomach upset at high doses'],
    warnings:['Excess can cause kidney stones in susceptible people'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['vitamin C','immunity','antioxidant'],imageUrl:'https://via.placeholder.com/300x200/FF5722/white?text=Vitamin+C'
  },
  {
    name:'Omega-3 Fish Oil', brandName:'Mega-3', category:'Vitamins & Supplements',
    description:'Omega-3 fatty acids for heart health, brain function, and joint flexibility.',
    dosageForm:'Capsule', strength:'1000 mg', manufacturer:'Himalaya', price:450, discountPercent:15,
    rating:4.5, reviewCount:6500, stockStatus:'In Stock',
    usageInstructions:'1–2 capsules daily with meals.',
    sideEffects:['Fishy aftertaste','Loose stools on high dose'],
    warnings:['Consult doctor if on blood thinners'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['omega3','heart','brain','supplement'],imageUrl:'https://via.placeholder.com/300x200/0097A7/white?text=Omega+3'
  },
  {
    name:'Iron + Folic Acid', brandName:'Ferrous Sulfate', category:'Vitamins & Supplements',
    description:'Iron and folic acid supplement for anaemia, pregnancy, and iron deficiency.',
    dosageForm:'Tablet', strength:'150 mg + 0.5 mg', manufacturer:'Alkem', price:45, discountPercent:0,
    rating:4.4, reviewCount:9200, stockStatus:'In Stock',
    usageInstructions:'1 tablet daily on empty stomach or with Vitamin C.',
    sideEffects:['Dark stools','Constipation','Nausea'],
    warnings:['Keep away from antacids by 2 hours'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['iron','anaemia','folic acid'],imageUrl:'https://via.placeholder.com/300x200/795548/white?text=Iron+Folic'
  },

  // ── DIGESTIVE HEALTH ─────────────────────────────────────────────────────
  {
    name:'Pantoprazole', brandName:'Pan-D', category:'Digestive Health',
    description:'Proton pump inhibitor for acidity, GERD, and peptic ulcers.',
    dosageForm:'Tablet', strength:'40 mg', manufacturer:'Alkem', price:95, discountPercent:0,
    rating:4.7, reviewCount:14500, stockStatus:'In Stock',
    usageInstructions:'40 mg once daily 30 min before breakfast.',
    sideEffects:['Headache','Diarrhoea','Nausea'],
    warnings:['Not for long-term use without doctor advice'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['acidity','GERD','stomach'],imageUrl:'https://via.placeholder.com/300x200/4CAF50/white?text=Pantoprazole'
  },
  {
    name:'Digene Antacid', brandName:'Digene', category:'Digestive Health',
    description:'Antacid gel for rapid relief of acidity, heartburn, gas, and indigestion.',
    dosageForm:'Gel', strength:'200 ml', manufacturer:'Abbott', price:115, discountPercent:0,
    rating:4.5, reviewCount:11200, stockStatus:'In Stock',
    usageInstructions:'2 teaspoons after meals and at bedtime.',
    sideEffects:['Constipation on prolonged use'],
    warnings:['Do not take within 2 hours of other medicines'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['acidity','antacid','digestion'],imageUrl:'https://via.placeholder.com/300x200/76FF03/white?text=Digene'
  },
  {
    name:'Loperamide', brandName:'Imodium', category:'Digestive Health',
    description:'Antidiarrhoeal medicine for acute and chronic diarrhoea.',
    dosageForm:'Tablet', strength:'2 mg', manufacturer:'Johnson & Johnson', price:55, discountPercent:0,
    rating:4.4, reviewCount:5600, stockStatus:'In Stock',
    usageInstructions:'2 mg after each loose stool. Max 16 mg/day.',
    sideEffects:['Constipation','Abdominal cramps'],
    warnings:['Do not use if fever + blood in stool','Not for children under 2'],
    ageRestriction:'Not for children under 2 years', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[3]],
    tags:['diarrhoea','digestive'],imageUrl:'https://via.placeholder.com/300x200/64DD17/white?text=Loperamide'
  },
  {
    name:'Omeprazole', brandName:'Omez', category:'Digestive Health',
    description:'PPI for ulcers, GERD, and Helicobacter pylori eradication.',
    dosageForm:'Capsule', strength:'20 mg', manufacturer:'Dr. Reddy\'s', price:70, discountPercent:5,
    rating:4.5, reviewCount:9800, stockStatus:'In Stock',
    usageInstructions:'20 mg once or twice daily before eating.',
    sideEffects:['Headache','Nausea','Flatulence'],
    warnings:['Not for long-term self-medication'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['acidity','ulcer','digestive'],imageUrl:'https://via.placeholder.com/300x200/558B2F/white?text=Omeprazole'
  },
  {
    name:'Domperidone', brandName:'Domstal', category:'Digestive Health',
    description:'Antiemetic for nausea, vomiting, and gastric motility disorders.',
    dosageForm:'Tablet', strength:'10 mg', manufacturer:'Torrent Pharma', price:40, discountPercent:0,
    rating:4.4, reviewCount:6700, stockStatus:'In Stock',
    usageInstructions:'10 mg 3 times daily before meals.',
    sideEffects:['Dry mouth','Headache'],
    warnings:['Not for long-term use','May interact with metoclopramide'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['nausea','vomiting','digestive'],imageUrl:'https://via.placeholder.com/300x200/33691E/white?text=Domperidone'
  },

  // ── SKIN CARE ────────────────────────────────────────────────────────────
  {
    name:'Clotrimazole Cream', brandName:'Canesten', category:'Skin Care',
    description:'Antifungal cream for ringworm, athlete\'s foot, and fungal skin infections.',
    dosageForm:'Cream', strength:'1%', manufacturer:'Bayer', price:85, discountPercent:0,
    rating:4.5, reviewCount:7800, stockStatus:'In Stock',
    usageInstructions:'Apply thin layer 2–3 times daily for 2–4 weeks.',
    sideEffects:['Burning sensation','Redness (temporary)'],
    warnings:['Avoid contact with eyes','External use only'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['antifungal','skin','ringworm'],imageUrl:'https://via.placeholder.com/300x200/FF80AB/white?text=Clotrimazole'
  },
  {
    name:'Calamine Lotion', brandName:'Lacto Calamine', category:'Skin Care',
    description:'Soothing lotion for sunburn, prickly heat, insect bites, and itching.',
    dosageForm:'Lotion', strength:'100 ml', manufacturer:'Piramal', price:110, discountPercent:5,
    rating:4.6, reviewCount:12300, stockStatus:'In Stock',
    usageInstructions:'Apply to affected area 3–4 times daily.',
    sideEffects:['Skin dryness on prolonged use'],
    warnings:['External use only'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['skin','itching','sunburn'],imageUrl:'https://via.placeholder.com/300x200/F8BBD0/white?text=Calamine'
  },
  {
    name:'Betamethasone Cream', brandName:'Betnovate', category:'Skin Care',
    description:'Topical corticosteroid for eczema, psoriasis, dermatitis and skin inflammation.',
    dosageForm:'Cream', strength:'0.1%', manufacturer:'GSK', price:95, discountPercent:0,
    rating:4.4, reviewCount:4300, stockStatus:'In Stock',
    usageInstructions:'Apply thinly once or twice daily.',
    sideEffects:['Skin thinning on prolonged use','Stretch marks'],
    warnings:['Do not use on face for long term','Prescription required'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['eczema','psoriasis','skin','steroid'],imageUrl:'https://via.placeholder.com/300x200/F48FB1/white?text=Betamethasone'
  },

  // ── EYE CARE ─────────────────────────────────────────────────────────────
  {
    name:'Ciprofloxacin Eye Drops', brandName:'Ciplox Eye Drops', category:'Eye Care',
    description:'Antibiotic eye drops for bacterial conjunctivitis and eye infections.',
    dosageForm:'Drops', strength:'0.3%', manufacturer:'Cipla', price:55, discountPercent:0,
    rating:4.5, reviewCount:4600, stockStatus:'In Stock',
    usageInstructions:'1–2 drops in affected eye every 4–6 hours.',
    sideEffects:['Temporary burning','Blurred vision after use'],
    warnings:['Do not touch dropper tip to eye','Do not use contact lenses during treatment'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['eye','infection','conjunctivitis'],imageUrl:'https://via.placeholder.com/300x200/81D4FA/white?text=Eye+Drops'
  },
  {
    name:'Lubricant Eye Drops', brandName:'Refresh Tears', category:'Eye Care',
    description:'Artificial tears for dry eye relief, screen fatigue, and contact lens discomfort.',
    dosageForm:'Drops', strength:'0.5% CMC', manufacturer:'Allergan', price:165, discountPercent:10,
    rating:4.7, reviewCount:9800, stockStatus:'In Stock',
    usageInstructions:'1–2 drops in each eye as needed up to 4 times daily.',
    sideEffects:['Temporary blurred vision'],
    warnings:['For single use vials — discard after opening'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['dry eye','eye drop','lubricant'],imageUrl:'https://via.placeholder.com/300x200/B3E5FC/white?text=Eye+Drops'
  },

  // ── ALLERGY ──────────────────────────────────────────────────────────────
  {
    name:'Montelukast', brandName:'Montair', category:'Allergy Medicines',
    description:'Leukotriene inhibitor for allergic rhinitis and asthma prevention.',
    dosageForm:'Tablet', strength:'10 mg', manufacturer:'Cipla', price:180, discountPercent:0,
    rating:4.6, reviewCount:7800, stockStatus:'In Stock',
    usageInstructions:'10 mg once daily at bedtime.',
    sideEffects:['Headache','Dizziness','Sleep disturbances'],
    warnings:['Not for acute asthma attacks','Inform doctor of mood changes'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['allergy','asthma','rhinitis'],imageUrl:'https://via.placeholder.com/300x200/AB47BC/white?text=Montelukast'
  },
  {
    name:'Levocetrizine', brandName:'Xyzal', category:'Allergy Medicines',
    description:'Second-gen antihistamine for hay fever, urticaria, allergic skin conditions.',
    dosageForm:'Tablet', strength:'5 mg', manufacturer:'UCB Pharma', price:90, discountPercent:10,
    rating:4.5, reviewCount:8200, stockStatus:'In Stock',
    usageInstructions:'5 mg once daily in the evening.',
    sideEffects:['Mild drowsiness','Dry mouth'],
    warnings:['Avoid driving if drowsy'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['allergy','antihistamine','urticaria'],imageUrl:'https://via.placeholder.com/300x200/CE93D8/white?text=Levocetrizine'
  },

  // ── RESPIRATORY ────────────────────────────────────────────────────────
  {
    name:'Salbutamol Inhaler', brandName:'Asthalin', category:'Respiratory Medicines',
    description:'Bronchodilator inhaler for acute asthma attacks and COPD relief.',
    dosageForm:'Inhaler', strength:'100 mcg/puff', manufacturer:'Cipla', price:150, discountPercent:0,
    rating:4.7, reviewCount:6700, stockStatus:'In Stock',
    usageInstructions:'1–2 puffs as needed. Shake well before use.',
    sideEffects:['Tremors','Palpitations','Headache'],
    warnings:['Not for daily regular use without consulting doctor','Overuse can worsen asthma'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['asthma','COPD','inhaler'],imageUrl:'https://via.placeholder.com/300x200/00ACC1/white?text=Inhaler'
  },
  {
    name:'Budesonide Inhaler', brandName:'Budecort', category:'Respiratory Medicines',
    description:'Corticosteroid inhaler for long-term asthma control and COPD management.',
    dosageForm:'Inhaler', strength:'200 mcg/dose', manufacturer:'Cipla', price:320, discountPercent:5,
    rating:4.6, reviewCount:4300, stockStatus:'In Stock',
    usageInstructions:'200–400 mcg twice daily. Rinse mouth after use.',
    sideEffects:['Oral thrush','Hoarse voice'],
    warnings:['Rinse mouth after each use','Not a rescue inhaler'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['asthma','COPD','steroid','inhaler'],imageUrl:'https://via.placeholder.com/300x200/006064/white?text=Budesonide'
  },

  // ── WOMEN'S HEALTH ────────────────────────────────────────────────────
  {
    name:'Folic Acid', brandName:'Folvite', category:"Women's Health",
    description:'Folic acid 5 mg for pregnancy, neural tube defect prevention, and megaloblastic anaemia.',
    dosageForm:'Tablet', strength:'5 mg', manufacturer:'Abbott', price:30, discountPercent:0,
    rating:4.7, reviewCount:14300, stockStatus:'In Stock',
    usageInstructions:'1 tablet daily as prescribed during pregnancy.',
    sideEffects:['Nausea (rare)'],
    warnings:['High dose needs prescription'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['pregnancy','folic acid','women'],imageUrl:'https://via.placeholder.com/300x200/F06292/white?text=Folic+Acid'
  },
  {
    name:'Mefenamic Acid', brandName:'Meftal-Spas', category:"Women's Health",
    description:'Antispasmodic for menstrual cramps, dysmenorrhoea, and abdominal pain.',
    dosageForm:'Tablet', strength:'250 mg', manufacturer:'Blue Cross', price:70, discountPercent:0,
    rating:4.5, reviewCount:8900, stockStatus:'In Stock',
    usageInstructions:'500 mg 3 times daily with food during menstruation.',
    sideEffects:['Nausea','GI upset','Dizziness'],
    warnings:['Take with food to reduce GI effects'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['periods','menstrual cramps','women'],imageUrl:'https://via.placeholder.com/300x200/EC407A/white?text=Mefenamic'
  },

  // ── MEN'S HEALTH ─────────────────────────────────────────────────────
  {
    name:'Finasteride', brandName:'Finpecia', category:"Men's Health",
    description:'5-alpha reductase inhibitor for male pattern baldness (androgenetic alopecia) and BPH.',
    dosageForm:'Tablet', strength:'1 mg', manufacturer:'Cipla', price:250, discountPercent:10,
    rating:4.3, reviewCount:5600, stockStatus:'In Stock',
    usageInstructions:'1 mg once daily. Results seen after 3–6 months.',
    sideEffects:['Decreased libido','Erectile dysfunction (rare)'],
    warnings:['Prescription required','Women should not handle crushed tablets','Regular monitoring required'],
    prescriptionRequired:true, prescriptionUploadRequired:true,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['hair loss','BPH','men'],imageUrl:'https://via.placeholder.com/300x200/1976D2/white?text=Finasteride'
  },

  // ── BABY CARE ────────────────────────────────────────────────────────
  {
    name:'Paracetamol Syrup', brandName:'Calpol', category:'Baby Care',
    description:'Paediatric paracetamol syrup for fever, teething pain, and post-vaccination fever in children.',
    dosageForm:'Syrup', strength:'120 mg/5ml', manufacturer:'GSK', price:55, discountPercent:0,
    rating:4.8, reviewCount:18700, stockStatus:'In Stock',
    usageInstructions:'As per weight: 10–15 mg/kg every 4–6 hours. Check dosing chart.',
    sideEffects:['Rash (rare allergy)'],
    warnings:['Do not exceed 5 doses in 24 hours','Consult doctor if under 2 months'],
    ageRestriction:'Not for infants under 2 months without doctor advice',
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2],pharmacies[3]],
    tags:['baby','fever','paediatric'],imageUrl:'https://via.placeholder.com/300x200/80DEEA/white?text=Calpol'
  },
  {
    name:'Gripe Water', brandName:'Woodward\'s', category:'Baby Care',
    description:'Herbal gripe water for infant colic, gas, and stomach discomfort.',
    dosageForm:'Syrup', strength:'130 ml', manufacturer:'Reckitt', price:75, discountPercent:0,
    rating:4.6, reviewCount:14500, stockStatus:'In Stock',
    usageInstructions:'2.5–5 ml after each feed or when needed.',
    sideEffects:['Rare allergic reaction'],
    warnings:['Not for infants under 1 month'],
    ageRestriction:'Not for infants under 1 month', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['colic','baby','infant'],imageUrl:'https://via.placeholder.com/300x200/B2EBF2/white?text=Gripe+Water'
  },
  {
    name:'D-drops Baby', brandName:'Aquaviron D3', category:'Baby Care',
    description:'Vitamin D3 drops for infants to prevent rickets and support bone development.',
    dosageForm:'Drops', strength:'400 IU/drop', manufacturer:'Pfizer', price:185, discountPercent:0,
    rating:4.7, reviewCount:7800, stockStatus:'In Stock',
    usageInstructions:'1 drop daily mixed in milk or formula.',
    sideEffects:['None at recommended dose'],
    warnings:['Do not exceed recommended dose'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['baby','vitamin D','infant'],imageUrl:'https://via.placeholder.com/300x200/E0F7FA/white?text=D+Drops'
  },

  // ── FIRST AID ────────────────────────────────────────────────────────
  {
    name:'Betadine Solution', brandName:'Betadine', category:'First Aid',
    description:'Povidone-iodine antiseptic for wound cleaning, minor cuts, and skin disinfection.',
    dosageForm:'Gel', strength:'10%', manufacturer:'Win-Medicare', price:95, discountPercent:0,
    rating:4.6, reviewCount:11200, stockStatus:'In Stock',
    usageInstructions:'Apply directly to wound or dilute 1:10 with water.',
    sideEffects:['Staining (brown colour)','Skin irritation (rare)'],
    warnings:['Do not use in deep puncture wounds without advice','Avoid in thyroid patients for large areas'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['antiseptic','wound','first aid'],imageUrl:'https://via.placeholder.com/300x200/FF6F00/white?text=Betadine'
  },
  {
    name:'Elastoplast Bandage', brandName:'Elastoplast', category:'First Aid',
    description:'Elastic adhesive bandage for wound dressing, sprains, and minor injuries.',
    dosageForm:'Strip', strength:'Various sizes', manufacturer:'BSN Medical', price:120, discountPercent:5,
    rating:4.5, reviewCount:6700, stockStatus:'In Stock',
    usageInstructions:'Apply firmly over wound or joint. Change every 1–2 days.',
    sideEffects:['Skin irritation under adhesive'],
    warnings:['Do not use on infected wounds'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['bandage','first aid','wound'],imageUrl:'https://via.placeholder.com/300x200/FFA726/white?text=Bandage'
  },
  {
    name:'Hand Sanitizer', brandName:'Dettol Sanitizer', category:'First Aid',
    description:'70% alcohol-based hand sanitizer for germ and virus elimination on hands.',
    dosageForm:'Gel', strength:'500 ml', manufacturer:'Reckitt', price:180, discountPercent:10,
    rating:4.6, reviewCount:22300, stockStatus:'In Stock',
    usageInstructions:'Apply 2–3 ml. Rub hands for 30 seconds until dry.',
    sideEffects:['Skin dryness on repeated use'],
    warnings:['Flammable — keep away from fire','Not for oral use'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[3],pharmacies[4]],
    tags:['sanitizer','hygiene','covid','hand wash'],imageUrl:'https://via.placeholder.com/300x200/B2DFDB/white?text=Sanitizer'
  },
  {
    name:'Surgical Face Mask', brandName:'3M', category:'First Aid',
    description:'3-ply surgical masks for protection from dust, pollen, bacteria, and viral aerosols.',
    dosageForm:'Device', strength:'Pack of 50', manufacturer:'3M India', price:350, discountPercent:15,
    rating:4.5, reviewCount:34500, stockStatus:'In Stock',
    usageInstructions:'Cover nose and mouth. Dispose after 8 hours or when damp.',
    sideEffects:[],
    warnings:['Single use only','Do not reuse'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2],pharmacies[3],pharmacies[4]],
    tags:['mask','covid','protection','hygiene'],imageUrl:'https://via.placeholder.com/300x200/546E7A/white?text=Face+Mask'
  },
  {
    name:'Digital Thermometer', brandName:'Dr. Morepen', category:'Medical Devices',
    description:'Digital oral/underarm thermometer for accurate temperature reading in seconds.',
    dosageForm:'Device', strength:'N/A', manufacturer:'Dr. Morepen', price:199, discountPercent:10,
    rating:4.6, reviewCount:18900, stockStatus:'In Stock',
    usageInstructions:'Place under tongue or armpit. Beep indicates reading.',
    sideEffects:[],
    warnings:['Wash with alcohol wipe between uses','Replace batteries regularly'],
    storageInstructions:'Store in case', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['thermometer','fever','device'],imageUrl:'https://via.placeholder.com/300x200/37474F/white?text=Thermometer'
  },
  {
    name:'Pulse Oximeter', brandName:'BPL Smart Oxy', category:'Medical Devices',
    description:'Fingertip pulse oximeter for SpO2 and heart rate monitoring at home.',
    dosageForm:'Device', strength:'N/A', manufacturer:'BPL Medical', price:1500, discountPercent:20,
    rating:4.6, reviewCount:14200, stockStatus:'In Stock',
    usageInstructions:'Insert finger fully. Wait 10 seconds for stable reading.',
    sideEffects:[],
    warnings:['Not for diagnostic use in critical care','Remove nail polish for accurate reading'],
    storageInstructions:'Store in case away from moisture', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['oximeter','oxygen','heart rate','device'],imageUrl:'https://via.placeholder.com/300x200/1A237E/white?text=Oximeter'
  },

  // ── AYURVEDIC & HERBAL ───────────────────────────────────────────────
  {
    name:'Ashwagandha', brandName:'Himalaya Ashvagandha', category:'Ayurvedic & Herbal',
    description:'Adaptogen herb for stress relief, energy, and overall vitality.',
    dosageForm:'Tablet', strength:'300 mg', manufacturer:'Himalaya', price:280, discountPercent:10,
    rating:4.6, reviewCount:22400, stockStatus:'In Stock',
    usageInstructions:'1–2 tablets twice daily with milk after meals.',
    sideEffects:['Mild GI upset','Drowsiness'],
    warnings:['Avoid in autoimmune conditions','Consult doctor in pregnancy'],
    pregnancyWarning:'Avoid during pregnancy', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2]],
    tags:['stress','energy','ayurvedic','adaptogen'],imageUrl:'https://via.placeholder.com/300x200/827717/white?text=Ashwagandha'
  },
  {
    name:'Triphala Churna', category:'Ayurvedic & Herbal',
    description:'Classical ayurvedic formulation for digestive health, constipation, and detox.',
    dosageForm:'Powder', strength:'500 g', manufacturer:'Patanjali', price:120, discountPercent:5,
    rating:4.5, reviewCount:16700, stockStatus:'In Stock',
    usageInstructions:'1 teaspoon with warm water at bedtime.',
    sideEffects:['Loose stools if overdosed'],
    warnings:['Reduce dose if loose stools occur'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[4]],
    tags:['constipation','ayurvedic','digestive','detox'],imageUrl:'https://via.placeholder.com/300x200/9E9D24/white?text=Triphala'
  },
  {
    name:'Tulsi Drops', brandName:'Himalaya Tulsi', category:'Ayurvedic & Herbal',
    description:'Holy Basil extract for immunity, respiratory health, and stress reduction.',
    dosageForm:'Drops', strength:'30 ml', manufacturer:'Himalaya', price:90, discountPercent:0,
    rating:4.5, reviewCount:12300, stockStatus:'In Stock',
    usageInstructions:'5–10 drops in water 2–3 times daily.',
    sideEffects:['Hypoglycaemia risk in diabetics'],
    warnings:['Monitor blood sugar in diabetics'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['immunity','ayurvedic','herbal','tulsi'],imageUrl:'https://via.placeholder.com/300x200/33691E/white?text=Tulsi'
  },

  // ── IMMUNITY BOOSTERS ────────────────────────────────────────────────
  {
    name:'Chyawanprash', brandName:'Dabur Chyawanprash', category:'Immunity Boosters',
    description:'Traditional Ayurvedic immunity booster with Amla, herbs, and spices.',
    dosageForm:'Gel', strength:'500 g', manufacturer:'Dabur', price:250, discountPercent:10,
    rating:4.7, reviewCount:28900, stockStatus:'In Stock',
    usageInstructions:'1–2 teaspoons with milk every morning.',
    sideEffects:['Excess may cause weight gain (sugar content)'],
    warnings:['Diabetics should consult doctor before use'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1],pharmacies[2],pharmacies[4]],
    tags:['immunity','ayurvedic','chyawanprash'],imageUrl:'https://via.placeholder.com/300x200/F57F17/white?text=Chyawanprash'
  },
  {
    name:'Giloy Tablets', brandName:'Patanjali Giloy Ghan Vati', category:'Immunity Boosters',
    description:'Giloy (Tinospora Cordifolia) for immune modulation, fever, and dengue support.',
    dosageForm:'Tablet', strength:'250 mg', manufacturer:'Patanjali', price:85, discountPercent:0,
    rating:4.5, reviewCount:9800, stockStatus:'In Stock',
    usageInstructions:'2 tablets twice daily with water after meals.',
    sideEffects:['None reported at normal dose'],
    warnings:['Do not use in autoimmune diseases','Consult in pregnancy'],
    pregnancyWarning:'Consult doctor before use', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['immunity','giloy','ayurvedic','dengue'],imageUrl:'https://via.placeholder.com/300x200/558B2F/white?text=Giloy'
  },

  // ── FITNESS & NUTRITION ─────────────────────────────────────────────
  {
    name:'Whey Protein', brandName:'Optimum Nutrition Gold Standard', category:'Fitness & Nutrition',
    description:'Whey protein supplement for muscle recovery, strength, and post-workout nutrition.',
    dosageForm:'Powder', strength:'1 kg', manufacturer:'Optimum Nutrition', price:3200, discountPercent:15,
    rating:4.7, reviewCount:18200, stockStatus:'In Stock',
    usageInstructions:'1 scoop (30 g) with 200 ml water or milk after workout.',
    sideEffects:['Bloating','Gas in lactose-intolerant individuals'],
    warnings:['Not a meal replacement for sick individuals','Kidney patients consult doctor'],
    prescriptionRequired:false, nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['protein','gym','fitness','muscle'],imageUrl:'https://via.placeholder.com/300x200/212121/white?text=Whey+Protein'
  },
  {
    name:'Creatine Monohydrate', brandName:'MuscleBlaze', category:'Fitness & Nutrition',
    description:'Creatine for enhanced athletic performance, strength, and muscle endurance.',
    dosageForm:'Powder', strength:'300 g', manufacturer:'MuscleBlaze', price:999, discountPercent:10,
    rating:4.5, reviewCount:8700, stockStatus:'In Stock',
    usageInstructions:'5 g per day with water. Loading phase: 20 g/day for 5 days.',
    sideEffects:['Water retention','Muscle cramps if under-hydrated'],
    warnings:['Stay well hydrated','Not for under 18'],
    ageRestriction:'Not recommended for under 18 years', prescriptionRequired:false,
    nearbyPharmacies:[pharmacies[0],pharmacies[1]],
    tags:['creatine','gym','fitness','strength'],imageUrl:'https://via.placeholder.com/300x200/424242/white?text=Creatine'
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS:15000, family:4 });
    console.log('Connected to MongoDB');
    await Medicine.deleteMany({});
    const result = await Medicine.insertMany(medicines);
    console.log(`✅ Seeded ${result.length} medicines successfully`);
    await mongoose.disconnect();
    process.exit(0);
  } catch(err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}
seed();
