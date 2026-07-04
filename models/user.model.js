const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  roles: { type: [String], default: ['ROLE_USER'] }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

UserSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue('User');
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
