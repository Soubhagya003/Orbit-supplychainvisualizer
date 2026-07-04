const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Error fetching products.' });
  }
});

// Get product by SKU
router.get('/sku/:sku', async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by SKU:', error);
    return res.status(500).json({ message: 'Error fetching product by SKU.' });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Error fetching product.' });
  }
});

// Create product
router.post('/', authMiddleware, requireRole(['ROLE_USER', 'ROLE_ADMIN']), async (req, res) => {
  try {
    const { name, description, unitPrice, weight, sku, status } = req.body;
    const newProduct = new Product({
      name,
      description,
      unitPrice,
      weight,
      sku,
      status
    });
    await newProduct.save();
    return res.status(200).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Error creating product.' });
  }
});

module.exports = router;
