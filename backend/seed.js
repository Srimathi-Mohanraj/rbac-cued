
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('./models/Role');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Role.deleteMany({});
  await User.deleteMany({});


  const roles = ['Super Admin','Admin','Cashier','CEO','Manager','Accountant',];
await Promise.all(roles.map(name => Role.create({ name, permissions: [] })));

  const adminRole = await Role.create({
    name: 'admin',
    permissions: ['create:role','read:role','assign:role','create:post','read:post','delete:post']
  });

  const editorRole = await Role.create({
    name: 'editor',
    permissions: ['create:post','read:post']
  });

  const hashed = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: hashed, roles: [adminRole._id] });

  console.log('Seed done. Admin credentials: admin@example.com / admin123');
  process.exit(0);
})();
