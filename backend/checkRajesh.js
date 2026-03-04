require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('./models/User');
  const Doctor = require('./models/Doctor');

  // Find by first name Rajesh
  const user = await User.findOne({ firstName: /rajesh/i });
  if (!user) {
    console.log('No user named Rajesh found in DB');
    await mongoose.disconnect();
    return;
  }
  console.log('User found:', user.firstName, user.lastName, '| role:', user.role, '| active:', user.isActive);

  const doctor = await Doctor.findOne({ userId: user._id });
  if (!doctor) {
    console.log('No Doctor record found for this user!');
    await mongoose.disconnect();
    return;
  }

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const av = doctor.availability;
  console.log('Doctor record found:');
  console.log('  isVerified:', doctor.isVerified);
  console.log('  isActive:', doctor.isActive);
  console.log('  specialization:', doctor.specialization);
  days.forEach(day => {
    const d = av[day];
    if (d && d.isAvailable) {
      console.log(`  ${day}: ${d.startTime} - ${d.endTime}`);
    } else {
      console.log(`  ${day}: NOT available`);
    }
  });

  // Count appointments assigned to this doctor
  const Appointment = require('./models/Appointment');
  const count = await Appointment.countDocuments({ doctorId: doctor._id });
  console.log('  Total appointments in DB:', count);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
