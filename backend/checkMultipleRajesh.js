require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('./models/User');
  const Doctor = require('./models/Doctor');
  const Appointment = require('./models/Appointment');

  // Find all users named Rajesh who are doctors
  const users = await User.find({ firstName: /rajesh/i, role: 'doctor' });
  
  console.log(`Found ${users.length} doctors with first name 'Rajesh'`);
  console.log('--------------------------------------------------');

  for (const user of users) {
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`User ID: ${user._id}`);
    
    const doctor = await Doctor.findOne({ userId: user._id });
    if (doctor) {
      console.log(`Doctor ID: ${doctor._id}`);
      console.log(`Specialization: ${doctor.specialization}`);
      console.log(`Active: ${doctor.isActive}, Verified: ${doctor.isVerified}`);
      
      const count = await Appointment.countDocuments({ doctorId: doctor._id });
      console.log(`Total appointments: ${count}`);
    } else {
      console.log('NO DOCTOR PROFILE FOUND FOR THIS USER');
    }
    console.log('--------------------------------------------------');
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
