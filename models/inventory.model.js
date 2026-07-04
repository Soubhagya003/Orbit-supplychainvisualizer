const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const InventorySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  nodeId: { type: Number, required: true, ref: 'Node' },
  productId: { type: Number, required: true, ref: 'Product' },
  quantity: { type: Number, default: 0 },
  minThreshold: { type: Number },
  maxThreshold: { type: Number }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

InventorySchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue('Inventory');
  }
  next();
});

module.exports = mongoose.model('Inventory', InventorySchema);
