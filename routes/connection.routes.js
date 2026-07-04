const express = require('express');
const router = express.Router();
const Connection = require('../models/connection.model');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all connections
router.get('/', async (req, res) => {
  try {
    const connections = await Connection.find({});
    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return res.status(500).json({ message: 'Error fetching connections.' });
  }
});

// Get connection by sourceId
router.get('/source/:sourceId', async (req, res) => {
  try {
    const connections = await Connection.find({ sourceId: Number(req.params.sourceId) });
    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching connections by source:', error);
    return res.status(500).json({ message: 'Error fetching connections by source.' });
  }
});

// Get connection by targetId
router.get('/target/:targetId', async (req, res) => {
  try {
    const connections = await Connection.find({ targetId: Number(req.params.targetId) });
    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching connections by target:', error);
    return res.status(500).json({ message: 'Error fetching connections by target.' });
  }
});

// Get connections by sourceId and targetId query params
router.get('/nodes', async (req, res) => {
  try {
    const { sourceId, targetId } = req.query;
    if (!sourceId || !targetId) {
      return res.status(400).json({ message: 'sourceId and targetId query params are required.' });
    }
    const connections = await Connection.find({
      sourceId: Number(sourceId),
      targetId: Number(targetId)
    });
    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching connections between nodes:', error);
    return res.status(500).json({ message: 'Error fetching connections between nodes.' });
  }
});

// Get connection by id
router.get('/:id', async (req, res) => {
  try {
    const connection = await Connection.findOne({ id: Number(req.params.id) });
    if (!connection) return res.status(404).json({ message: 'Connection not found.' });
    return res.status(200).json(connection);
  } catch (error) {
    console.error('Error fetching connection:', error);
    return res.status(500).json({ message: 'Error fetching connection.' });
  }
});

// Create connection
router.post('/', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const { sourceId, targetId, transportationType, distance, travelTime, costPerUnit, status } = req.body;
    const newConnection = new Connection({
      sourceId,
      targetId,
      transportationType,
      distance,
      travelTime,
      costPerUnit,
      status
    });
    await newConnection.save();
    return res.status(200).json(newConnection);
  } catch (error) {
    console.error('Error creating connection:', error);
    return res.status(500).json({ message: 'Error creating connection.' });
  }
});

// Update connection
router.put('/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const connectionId = Number(req.params.id);
    const { sourceId, targetId, transportationType, distance, travelTime, costPerUnit, status } = req.body;

    const connection = await Connection.findOne({ id: connectionId });
    if (!connection) return res.status(404).json({ message: 'Connection not found.' });

    if (sourceId !== undefined) connection.sourceId = sourceId;
    if (targetId !== undefined) connection.targetId = targetId;
    if (transportationType !== undefined) connection.transportationType = transportationType;
    if (distance !== undefined) connection.distance = distance;
    if (travelTime !== undefined) connection.travelTime = travelTime;
    if (costPerUnit !== undefined) connection.costPerUnit = costPerUnit;
    if (status !== undefined) connection.status = status;

    await connection.save();
    return res.status(200).json(connection);
  } catch (error) {
    console.error('Error updating connection:', error);
    return res.status(500).json({ message: 'Error updating connection.' });
  }
});

// Delete connection
router.delete('/:id', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const connectionId = Number(req.params.id);
    const result = await Connection.deleteOne({ id: connectionId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Connection not found.' });
    return res.status(200).send();
  } catch (error) {
    console.error('Error deleting connection:', error);
    return res.status(500).json({ message: 'Error deleting connection.' });
  }
});

module.exports = router;
