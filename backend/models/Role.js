
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  
  permissions: [{ type: String }],
});

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
module.exports = Role;
