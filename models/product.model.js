const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const ProductSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  unitPrice: { type: Number, required: true },
  weight: { type: Number },
  sku: { type: String },
  status: { type: String, default: 'active' }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

ProductSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue('Product');
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
