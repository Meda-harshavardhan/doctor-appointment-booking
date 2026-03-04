require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./models/User');

  const email = 'dr.rajesh.sharma@example.com';
  const newPassword = 'Doctor@123';
  
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`User ${email} not found!`);
    await mongoose.disconnect();
    return;
  }

  // Set the PLAINTEXT password. The Mongoose pre-save hook will hash it ONCE.
  user.password = newPassword;
  await user.save();
  
  console.log(`Password for ${email} has been successfully reset properly this time!`);
  
  await mongoose.disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
