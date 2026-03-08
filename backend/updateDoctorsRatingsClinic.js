/**
 * updateDoctorsRatingsClinic.js
 * Patches all seeded doctors with realistic ratings + clinic addresses.
 * Run once with: node updateDoctorsRatingsClinic.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const updates = [
  { email: 'dr.rajesh.sharma@pulse.com',   rating: { average: 4.8, count: 312 }, clinic: { name: 'Sharma Heart Clinic', street: '102, Pali Hill', area: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' } },
  { email: 'dr.meena.iyer@pulse.com',       rating: { average: 4.6, count: 198 }, clinic: { name: 'MedCare Cardiology', street: '25, Nungambakkam High Road', area: 'Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600034' } },
  { email: 'dr.priya.patel@pulse.com',      rating: { average: 4.9, count: 421 }, clinic: { name: 'Little Stars Pediatric Clinic', street: '45, 1st Cross, Indiranagar', area: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038' } },
  { email: 'dr.suresh.nair@pulse.com',      rating: { average: 4.7, count: 286 }, clinic: { name: 'Nair Child Care Centre', street: '8, MG Road', area: 'Ernakulam', city: 'Kochi', state: 'Kerala', pincode: '682016' } },
  { email: 'dr.ananya.reddy@pulse.com',     rating: { average: 4.5, count: 173 }, clinic: { name: 'Skin Glow Dermatology', street: '77, Road No. 1, Banjarahills', area: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' } },
  { email: 'dr.vikram.mehta@pulse.com',     rating: { average: 4.7, count: 244 }, clinic: { name: 'Mehta Skin & Hair Clinic', street: '12, FC Road', area: 'Shivajinagar', city: 'Pune', state: 'Maharashtra', pincode: '411005' } },
  { email: 'dr.amit.kumar@pulse.com',       rating: { average: 4.9, count: 389 }, clinic: { name: 'Kumar Ortho & Spine Centre', street: '33, Safdarjung Enclave', area: 'Safdarjung', city: 'New Delhi', state: 'Delhi', pincode: '110029' } },
  { email: 'dr.deepa.krishnan@pulse.com',   rating: { average: 4.4, count: 152 }, clinic: { name: 'Krishnan Bone & Joint Clinic', street: '5, Avanashi Road', area: 'Peelamedu', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641004' } },
  { email: 'dr.sanjay.verma@pulse.com',     rating: { average: 4.6, count: 267 }, clinic: { name: 'BrainCare Neurology Clinic', street: '14, Hazratganj', area: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' } },
  { email: 'dr.kavitha.sundaram@pulse.com', rating: { average: 4.8, count: 311 }, clinic: { name: 'NeuroCare Clinic', street: '22, Residency Road', area: 'Richmond Town', city: 'Bangalore', state: 'Karnataka', pincode: '560025' } },
  { email: 'dr.ramesh.gupta@pulse.com',     rating: { average: 4.5, count: 532 }, clinic: { name: 'Gupta Family Clinic', street: '3, Tonk Road', area: 'C-Scheme', city: 'Jaipur', state: 'Rajasthan', pincode: '302001' } },
  { email: 'dr.lakshmi.rao@pulse.com',      rating: { average: 4.3, count: 89  }, clinic: { name: 'Rao Medical Centre', street: '56, MVP Colony', area: 'MVP Colony', city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530017' } },
  { email: 'dr.sunita.deshmukh@pulse.com',  rating: { average: 4.8, count: 376 }, clinic: { name: 'Deshmukh Women & Child Clinic', street: '9, Sitabuldi', area: 'Sitabuldi', city: 'Nagpur', state: 'Maharashtra', pincode: '440012' } },
  { email: 'dr.fatima.khan@pulse.com',      rating: { average: 4.6, count: 187 }, clinic: { name: 'Khan Maternity & Health', street: '18, New Market', area: 'New Market', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462003' } },
  { email: 'dr.arjun.bhat@pulse.com',       rating: { average: 4.7, count: 203 }, clinic: { name: 'MindWell Psychiatry Centre', street: '30, Koramangala 5th Block', area: 'Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560095' } },
  { email: 'dr.neha.saxena@pulse.com',      rating: { average: 4.4, count: 118 }, clinic: { name: 'Saxena Mind Health Clinic', street: '68, Lajpat Nagar II', area: 'Lajpat Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110024' } },
  { email: 'dr.ravi.shankar@pulse.com',     rating: { average: 4.9, count: 447 }, clinic: { name: 'Shankar Eye Foundation', street: '4, Nungambakkam High Road', area: 'Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600034' } },
  { email: 'dr.pooja.aggarwal@pulse.com',   rating: { average: 4.2, count: 64  }, clinic: { name: 'Aggarwal Eye Care', street: '7, Sector 17', area: 'Sector 17', city: 'Chandigarh', state: 'Punjab', pincode: '160017' } },
  { email: 'dr.manoj.tiwari@pulse.com',     rating: { average: 4.6, count: 219 }, clinic: { name: 'Tiwari ENT & Allergy Centre', street: '21, Fraser Road', area: 'Fraser Road', city: 'Patna', state: 'Bihar', pincode: '800001' } },
  { email: 'dr.divya.menon@pulse.com',      rating: { average: 4.5, count: 161 }, clinic: { name: 'Menon ENT Specialty Clinic', street: '6, MG Road', area: 'Thampanoor', city: 'Trivandrum', state: 'Kerala', pincode: '695001' } },
  { email: 'dr.ashok.joshi@pulse.com',      rating: { average: 4.7, count: 293 }, clinic: { name: 'Joshi GI & Liver Centre', street: '48, CG Road', area: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' } },
  { email: 'dr.swati.banerjee@pulse.com',   rating: { average: 4.5, count: 178 }, clinic: { name: 'Banerjee Digestive Health', street: '12, Park Street', area: 'Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' } },
  { email: 'dr.anil.kapoor@pulse.com',      rating: { average: 4.6, count: 234 }, clinic: { name: 'Kapoor Lung & Respiratory Clinic', street: '62, Parel Village', area: 'Parel', city: 'Mumbai', state: 'Maharashtra', pincode: '400012' } },
  { email: 'dr.revathi.pillai@pulse.com',   rating: { average: 4.4, count: 142 }, clinic: { name: 'Pillai Respiratory Centre', street: '35, Rajajinagar 2nd Block', area: 'Rajajinagar', city: 'Bangalore', state: 'Karnataka', pincode: '560010' } },
  { email: 'dr.nikhil.sinha@pulse.com',     rating: { average: 4.7, count: 258 }, clinic: { name: 'Sinha Urology & Stone Clinic', street: '18, Gariahat Road', area: 'Gariahat', city: 'Kolkata', state: 'West Bengal', pincode: '700019' } },
  { email: 'dr.geeta.malhotra@pulse.com',   rating: { average: 4.3, count: 97  }, clinic: { name: 'Malhotra Urology Clinic', street: '11, West Patel Nagar', area: 'Patel Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110008' } },
  { email: 'dr.prakash.chandra@pulse.com',  rating: { average: 4.8, count: 341 }, clinic: { name: 'Chandra Diabetes & Hormone Centre', street: '99, Jubilee Hills Road 36', area: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' } },
  { email: 'dr.ishita.roy@pulse.com',       rating: { average: 4.3, count: 76  }, clinic: { name: 'Roy Hormone & Diabetes Clinic', street: '5, GS Road', area: 'Dispur', city: 'Guwahati', state: 'Assam', pincode: '781006' } },
  { email: 'dr.rohit.sethi@pulse.com',      rating: { average: 4.6, count: 289 }, clinic: { name: 'Sethi Dental Studio', street: '14, Sector 22-B', area: 'Sector 22', city: 'Chandigarh', state: 'Punjab', pincode: '160022' } },
  { email: 'dr.shruti.das@pulse.com',       rating: { average: 4.2, count: 53  }, clinic: { name: 'Das Smile Dental Clinic', street: '2, Janpath', area: 'Unit 3', city: 'Bhubaneswar', state: 'Odisha', pincode: '751001' } },
  { email: 'dr.vivek.mishra@pulse.com',     rating: { average: 4.9, count: 412 }, clinic: { name: 'Mishra Cancer Care Centre', street: 'Dr. E. Borges Road', area: 'Parel', city: 'Mumbai', state: 'Maharashtra', pincode: '400012' } },
  { email: 'dr.kiran.kulkarni@pulse.com',   rating: { average: 4.7, count: 198 }, clinic: { name: 'Kulkarni Joint & Immune Clinic', street: '40, Law College Road', area: 'Erandwane', city: 'Pune', state: 'Maharashtra', pincode: '411004' } },
  { email: 'dr.harish.mohan@pulse.com',     rating: { average: 4.8, count: 322 }, clinic: { name: 'Mohan Kidney Care Centre', street: '3, Anna Salai', area: 'Teynampet', city: 'Chennai', state: 'Tamil Nadu', pincode: '600018' } },
  { email: 'dr.shalini.thakur@pulse.com',   rating: { average: 4.5, count: 143 }, clinic: { name: 'Thakur Internal Medicine Clinic', street: '25, The Mall Road', area: 'The Mall', city: 'Shimla', state: 'Himachal Pradesh', pincode: '171001' } },
  { email: 'dr.joseph.thomas@pulse.com',    rating: { average: 4.7, count: 498 }, clinic: { name: 'Thomas Family Health Centre', street: '5, Marine Drive', area: 'Ernakulam', city: 'Kochi', state: 'Kerala', pincode: '682011' } },
  { email: 'dr.arun.singh@pulse.com',       rating: { average: 4.6, count: 187 }, clinic: { name: 'Singh Emergency & Trauma Care', street: '7, DDU Hospital Road', area: 'Hari Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110064' } },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-appointment');
    console.log('✅ Connected to MongoDB');

    let updated = 0;
    for (const u of updates) {
      const user = await User.findOne({ email: u.email }).select('_id');
      if (!user) { console.warn(`⚠️  User not found: ${u.email}`); continue; }

      const result = await Doctor.updateOne(
        { userId: user._id },
        {
          $set: {
            'rating.average': u.rating.average,
            'rating.count': u.rating.count,
            clinicAddress: u.clinic,
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated: ${u.email} → rating ${u.rating.average} (${u.rating.count} reviews)`);
        updated++;
      } else {
        console.warn(`⚠️  No doctor doc found for: ${u.email}`);
      }
    }

    console.log(`\n🎉 Done! Updated ${updated}/${updates.length} doctors.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
