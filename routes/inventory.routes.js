const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventory.model');
const Node = require('../models/node.model');
const Product = require('../models/product.model');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Helper to enrich inventory list with Node name and Product name
const enrichInventory = async (inventoryItems) => {
  const nodes = await Node.find({});
  const products = await Product.find({});
  const nodeMap = new Map(nodes.map(n => [n.id, n.name]));
  const productMap = new Map(products.map(p => [p.id, p.name]));

  return inventoryItems.map(item => {
    const quantity = item.quantity ?? 0;
    const min = item.minThreshold;
    const max = item.maxThreshold;

    let status = 'optimal';
    if (quantity <= 0) {
      status = 'critical';
    } else if (min !== undefined && min !== null && quantity <= min) {
      status = 'low';
    } else if (max !== undefined && max !== null && quantity >= max) {
      status = 'excess';
    }

    return {
      id: item.id,
      nodeId: item.nodeId,
      nodeName: nodeMap.get(item.nodeId) || '',
      productId: item.productId,
      productName: productMap.get(item.productId) || '',
      quantity,
      minThreshold: min,
      maxThreshold: max,
      status,
      updatedAt: item.updatedAt
    };
  });
};

// Get all inventory
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find({});
    const enriched = await enrichInventory(items);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ message: 'Error fetching inventory.' });
  }
});

// Get low stock inventory
router.get('/low-stock', async (req, res) => {
  try {
    // low stock: quantity <= minThreshold and minThreshold IS NOT NULL
    const items = await Inventory.find({
      $expr: {
        $and: [
          { $ne: ["$minThreshold", null] },
          { $lte: ["$quantity", "$minThreshold"] }
        ]
      }
    });
    const enriched = await enrichInventory(items);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching low stock inventory:', error);
    return res.status(500).json({ message: 'Error fetching low stock inventory.' });
  }
});

// Get inventory by node
router.get('/node/:nodeId', async (req, res) => {
  try {
    const nodeId = Number(req.params.nodeId);
    const items = await Inventory.find({ nodeId });
    const enriched = await enrichInventory(items);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching inventory by node:', error);
    return res.status(500).json({ message: 'Error fetching inventory by node.' });
  }
});

// Get inventory by product
router.get('/product/:productId', async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const items = await Inventory.find({ productId });
    const enriched = await enrichInventory(items);
    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching inventory by product:', error);
    return res.status(500).json({ message: 'Error fetching inventory by product.' });
  }
});

// Get inventory by id
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findOne({ id: Number(req.params.id) });
    if (!item) return res.status(404).json({ message: 'Inventory not found.' });
    const enriched = await enrichInventory([item]);
    return res.status(200).json(enriched[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return res.status(500).json({ message: 'Error fetching inventory item.' });
  }
});

// Create or update inventory
router.post('/', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const { nodeId, productId, quantity, minThreshold, maxThreshold } = req.body;

    const node = await Node.findOne({ id: nodeId });
    const product = await Product.findOne({ id: productId });

    if (!node || !product) {
      return res.status(400).json({ message: 'Node or Product not found.' });
    }

    let inventory = await Inventory.findOne({ nodeId, productId });

    if (inventory) {
      // Update existing
      inventory.quantity = quantity;
      if (minThreshold !== undefined) inventory.minThreshold = minThreshold;
      if (maxThreshold !== undefined) inventory.maxThreshold = maxThreshold;
    } else {
      // Create new
      inventory = new Inventory({
        nodeId,
        productId,
        quantity,
        minThreshold,
        maxThreshold
      });
    }

    await inventory.save();
    const enriched = await enrichInventory([inventory]);
    return res.status(200).json(enriched[0]);
  } catch (error) {
    console.error('Error updating inventory:', error);
    return res.status(500).json({ message: 'Error updating inventory.' });
  }
});

// Delete inventory
router.delete('/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const inventoryId = Number(req.params.id);
    const result = await Inventory.deleteOne({ id: inventoryId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Inventory not found.' });
    return res.status(200).send();
  } catch (error) {
    console.error('Error deleting inventory:', error);
    return res.status(500).json({ message: 'Error deleting inventory.' });
  }
});

module.exports = router;
