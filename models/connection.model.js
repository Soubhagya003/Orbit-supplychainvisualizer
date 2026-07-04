const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const ConnectionSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  sourceId: { type: Number, required: true, ref: 'Node' },
  targetId: { type: Number, required: true, ref: 'Node' },
  transportationType: { type: String },
  distance: { type: Number },
  travelTime: { type: Number },
  costPerUnit: { type: Number },
  status: { type: String, default: 'active' }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

ConnectionSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue('Connection');
  }
  next();
});

module.exports = mongoose.model('Connection', ConnectionSchema);
