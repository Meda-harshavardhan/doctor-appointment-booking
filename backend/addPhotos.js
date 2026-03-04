require('dotenv').config();
const mongoose = require('mongoose');

async function addDoctorPhotos() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./models/User');

  // We'll use randomuser.me avatars for placeholders
  const malePhotos = [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/men/44.jpg',
    'https://randomuser.me/api/portraits/men/55.jpg',
    'https://randomuser.me/api/portraits/men/60.jpg'
  ];
  
  const femalePhotos = [
    'https://randomuser.me/api/portraits/med/women/44.jpg',
    'https://randomuser.me/api/portraits/med/women/65.jpg',
    'https://randomuser.me/api/portraits/med/women/68.jpg',
    'https://randomuser.me/api/portraits/med/women/72.jpg'
  ];

  const doctors = await User.find({ role: 'doctor' });
  let m = 0;
  let f = 0;

  for (const doc of doctors) {
    if (doc.gender === 'male' || !doc.gender) {
      doc.profileImage = malePhotos[m % malePhotos.length];
      m++;
    } else {
      doc.profileImage = femalePhotos[f % femalePhotos.length];
      f++;
    }
    await doc.save();
    console.log(`Updated photo for ${doc.firstName} ${doc.lastName} to ${doc.profileImage}`);
  }

  await mongoose.disconnect();
}

addDoctorPhotos().catch(e => {
  console.error(e);
  process.exit(1);
});
