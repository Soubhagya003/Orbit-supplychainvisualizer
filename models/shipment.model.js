const mongoose = require('mongoose');
const { getNextSequenceValue } = require('./counter.model');

const ShipmentItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true, ref: 'Product' },
  quantity: { type: Number, required: true }
});

const ShipmentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  sourceId: { type: Number, required: true, ref: 'Node' },
  destinationId: { type: Number, required: true, ref: 'Node' },
  status: { type: String, default: 'pending' },
  departureDate: { type: Date },
  estimatedArrival: { type: Date },
  actualArrival: { type: Date },
  items: [ShipmentItemSchema]
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

ShipmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue('Shipment');
  }
  next();
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
