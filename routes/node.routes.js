const express = require('express');
const router = express.Router();
const Node = require('../models/node.model');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all nodes
router.get('/', async (req, res) => {
  try {
    const nodes = await Node.find({});
    return res.status(200).json(nodes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
    return res.status(500).json({ message: 'Error fetching nodes.' });
  }
});

// Get node by type
router.get('/type/:type', async (req, res) => {
  try {
    const nodes = await Node.find({ type: req.params.type });
    return res.status(200).json(nodes);
  } catch (error) {
    console.error('Error fetching nodes by type:', error);
    return res.status(500).json({ message: 'Error fetching nodes by type.' });
  }
});

// Get node by status
router.get('/status/:status', async (req, res) => {
  try {
    const nodes = await Node.find({ status: req.params.status });
    return res.status(200).json(nodes);
  } catch (error) {
    console.error('Error fetching nodes by status:', error);
    return res.status(500).json({ message: 'Error fetching nodes by status.' });
  }
});

// Get node by id
router.get('/:id', async (req, res) => {
  try {
    const node = await Node.findOne({ id: Number(req.params.id) });
    if (!node) return res.status(404).json({ message: 'Node not found.' });
    return res.status(200).json(node);
  } catch (error) {
    console.error('Error fetching node:', error);
    return res.status(500).json({ message: 'Error fetching node.' });
  }
});

// Create node
router.post('/', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const { name, type, latitude, longitude, capacity, status } = req.body;
    const newNode = new Node({ name, type, latitude, longitude, capacity, status });
    await newNode.save();
    return res.status(200).json(newNode);
  } catch (error) {
    console.error('Error creating node:', error);
    return res.status(500).json({ message: 'Error creating node.' });
  }
});

// Update node
router.put('/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const nodeId = Number(req.params.id);
    const { name, type, latitude, longitude, capacity, status } = req.body;

    const node = await Node.findOne({ id: nodeId });
    if (!node) return res.status(404).json({ message: 'Node not found.' });

    if (name !== undefined) node.name = name;
    if (type !== undefined) node.type = type;
    if (latitude !== undefined) node.latitude = latitude;
    if (longitude !== undefined) node.longitude = longitude;
    if (capacity !== undefined) node.capacity = capacity;
    if (status !== undefined) node.status = status;

    await node.save();
    return res.status(200).json(node);
  } catch (error) {
    console.error('Error updating node:', error);
    return res.status(500).json({ message: 'Error updating node.' });
  }
});

// Delete node
router.delete('/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const nodeId = Number(req.params.id);
    const result = await Node.deleteOne({ id: nodeId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Node not found.' });
    return res.status(200).send();
  } catch (error) {
    console.error('Error deleting node:', error);
    return res.status(500).json({ message: 'Error deleting node.' });
  }
});

module.exports = router;
