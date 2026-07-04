const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const NodeSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  capacity: { type: Number },
  status: { type: String, default: 'active' }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

NodeSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue('Node');
  }
  next();
});

module.exports = mongoose.model('Node', NodeSchema);
