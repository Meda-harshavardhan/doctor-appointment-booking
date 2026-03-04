require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('./models/User');
  const Doctor = require('./models/Doctor');
  const Appointment = require('./models/Appointment');

  const users = await User.find({ firstName: /rajesh/i, role: 'doctor' });
  const results = [];

  for (const user of users) {
    const doctor = await Doctor.findOne({ userId: user._id });
    const count = doctor ? await Appointment.countDocuments({ doctorId: doctor._id }) : 0;
    
    results.push({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      userId: user._id.toString(),
      doctorId: doctor ? doctor._id.toString() : null,
      specialization: doctor ? doctor.specialization : null,
      isActive: doctor ? doctor.isActive : false,
      isVerified: doctor ? doctor.isVerified : false,
      appointmentCount: count
    });
  }

  fs.writeFileSync('rajesh_details.json', JSON.stringify(results, null, 2));
  await mongoose.disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
