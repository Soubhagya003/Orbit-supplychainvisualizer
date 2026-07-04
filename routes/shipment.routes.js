const express = require('express');
const router = express.Router();
const Shipment = require('../models/shipment.model');
const Node = require('../models/node.model');
const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Helper to enrich shipments with source/destination names and item product names
const enrichShipments = async (shipmentDocs) => {
  const nodes = await Node.find({});
  const products = await Product.find({});
  const nodeMap = new Map(nodes.map(n => [n.id, n.name]));
  const productMap = new Map(products.map(p => [p.id, p.name]));

  return shipmentDocs.map(shipment => {
    const items = (shipment.items || []).map(item => ({
      id: item._id, // or just item.id
      productId: item.productId,
      productName: productMap.get(item.productId) || 'Unknown Product',
      quantity: item.quantity
    }));

    return {
      id: shipment.id,
      sourceId: shipment.sourceId,
      sourceName: nodeMap.get(shipment.sourceId) || '',
      destinationId: shipment.destinationId,
      destinationName: nodeMap.get(shipment.destinationId) || '',
      status: shipment.status,
      departureDate: shipment.departureDate ? shipment.departureDate.toISOString().split('T')[0] : null,
      estimatedArrival: shipment.estimatedArrival ? shipment.estimatedArrival.toISOString().split('T')[0] : null,
      actualArrival: shipment.actualArrival ? shipment.actualArrival.toISOString() : null,
      items
    };
  });
};

// Adjust inventory helper
const adjustInventory = async (nodeId, productId, delta) => {
  let inventory = await Inventory.findOne({ nodeId, productId });
  if (!inventory) {
    inventory = new Inventory({
      nodeId,
      productId,
      quantity: 0
    });
  }
  inventory.quantity = (inventory.quantity || 0) + delta;
  await inventory.save();
};

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.find({});
    const enriched = await enrichShipments(shipments);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return res.status(500).json({ message: 'Error fetching shipments.' });
  }
});

// Get shipments by sourceId
router.get('/source/:sourceId', async (req, res) => {
  try {
    const sourceId = Number(req.params.sourceId);
    const shipments = await Shipment.find({ sourceId });
    const enriched = await enrichShipments(shipments);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching shipments by source:', error);
    return res.status(500).json({ message: 'Error fetching shipments by source.' });
  }
});

// Get shipments by destinationId
router.get('/destination/:destinationId', async (req, res) => {
  try {
    const destinationId = Number(req.params.destinationId);
    const shipments = await Shipment.find({ destinationId });
    const enriched = await enrichShipments(shipments);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching shipments by destination:', error);
    return res.status(500).json({ message: 'Error fetching shipments by destination.' });
  }
});

// Get shipments by status
router.get('/status/:status', async (req, res) => {
  try {
    const shipments = await Shipment.find({ status: req.params.status });
    const enriched = await enrichShipments(shipments);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching shipments by status:', error);
    return res.status(500).json({ message: 'Error fetching shipments by status.' });
  }
});

// Get shipments by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate, dateType } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate query params are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const typeField = dateType === 'actual' ? 'actualArrival' : (dateType === 'estimated' ? 'estimatedArrival' : 'departureDate');

    const filter = {};
    filter[typeField] = { $gte: start, $lte: end };

    const shipments = await Shipment.find(filter);
    const enriched = await enrichShipments(shipments);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching shipments by range:', error);
    return res.status(500).json({ message: 'Error fetching shipments by range.' });
  }
});

// Get shipment by id
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ id: Number(req.params.id) });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found.' });
    const enriched = await enrichShipments([shipment]);
    return res.status(200).json(enriched[0]);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return res.status(500).json({ message: 'Error fetching shipment.' });
  }
});

// Create shipment
router.post('/', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const { sourceId, destinationId, status, departureDate, estimatedArrival, actualArrival, items } = req.body;

    const source = await Node.findOne({ id: sourceId });
    const dest = await Node.findOne({ id: destinationId });

    if (!source || !dest) {
      return res.status(400).json({ message: 'Source or destination node not found.' });
    }

    const parsedItems = [];
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const product = await Product.findOne({ id: item.productId });
        if (product) {
          parsedItems.push({
            productId: item.productId,
            quantity: item.quantity
          });
          // Decrement source inventory
          await adjustInventory(sourceId, item.productId, -item.quantity);
        }
      }
    }

    const newShipment = new Shipment({
      sourceId,
      destinationId,
      status: status || 'pending',
      departureDate: departureDate ? new Date(departureDate) : null,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
      actualArrival: actualArrival ? new Date(actualArrival) : null,
      items: parsedItems
    });

    await newShipment.save();
    const enriched = await enrichShipments([newShipment]);
    return res.status(200).json(enriched[0]);
  } catch (error) {
    console.error('Error creating shipment:', error);
    return res.status(500).json({ message: 'Error creating shipment.' });
  }
});

// Update shipment
router.put('/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const shipmentId = Number(req.params.id);
    const { sourceId, destinationId, status, departureDate, estimatedArrival, actualArrival } = req.body;

    const shipment = await Shipment.findOne({ id: shipmentId });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found.' });

    if (sourceId !== undefined) shipment.sourceId = sourceId;
    if (destinationId !== undefined) shipment.destinationId = destinationId;
    if (status !== undefined) shipment.status = status;
    if (departureDate !== undefined) shipment.departureDate = departureDate ? new Date(departureDate) : null;
    if (estimatedArrival !== undefined) shipment.estimatedArrival = estimatedArrival ? new Date(estimatedArrival) : null;
    if (actualArrival !== undefined) shipment.actualArrival = actualArrival ? new Date(actualArrival) : null;

    await shipment.save();
    const enriched = await enrichShipments([shipment]);
    return res.status(200).json(enriched[0]);
  } catch (error) {
    console.error('Error updating shipment:', error);
    return res.status(500).json({ message: 'Error updating shipment.' });
  }
});

// Update shipment status
router.put('/status/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const shipmentId = Number(req.params.id);
    const { status } = req.body; // or req.query or direct payload

    const shipment = await Shipment.findOne({ id: shipmentId });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found.' });

    const previousStatus = shipment.status;
    shipment.status = status;

    if (status === 'delivered') {
      if (!shipment.actualArrival) {
        shipment.actualArrival = new Date();
      }

      if (previousStatus !== 'delivered') {
        // Increment destination inventory
        for (const item of shipment.items) {
          await adjustInventory(shipment.destinationId, item.productId, item.quantity);
        }
      }
    }

    await shipment.save();
    const enriched = await enrichShipments([shipment]);
    return res.status(200).json(enriched[0]);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return res.status(500).json({ message: 'Error updating shipment status.' });
  }
});

// Delete shipment
router.delete('/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const shipmentId = Number(req.params.id);
    const result = await Shipment.deleteOne({ id: shipmentId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Shipment not found.' });
    return res.status(200).send();
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return res.status(500).json({ message: 'Error deleting shipment.' });
  }
});

module.exports = router;
