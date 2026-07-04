const mongoose = require('mongoose');
const { Counter } = require('./models/counter.model');
const Node = require('./models/node.model');
const Product = require('./models/product.model');
const Connection = require('./models/connection.model');
const Inventory = require('./models/inventory.model');
const Shipment = require('./models/shipment.model');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');
const seedData = require('./seedData');

const seedDb = async () => {
  try {
    const nodeCount = await Node.countDocuments();
    if (nodeCount > 0) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding database...');

    // Clear everything first
    await Counter.deleteMany({});
    await Node.deleteMany({});
    await Product.deleteMany({});
    await Connection.deleteMany({});
    await Inventory.deleteMany({});
    await Shipment.deleteMany({});
    await User.deleteMany({});

    // Seed Nodes
    await Node.insertMany(seedData.nodes);
    await Counter.create({ _id: 'Node', seq: 12 });

    // Seed Products
    await Product.insertMany(seedData.products);
    await Counter.create({ _id: 'Product', seq: 10 });

    // Seed Connections
    await Connection.insertMany(seedData.connections);
    await Counter.create({ _id: 'Connection', seq: 12 });

    // Seed Inventory
    await Inventory.insertMany(seedData.inventory);
    await Counter.create({ _id: 'Inventory', seq: 30 });

    // Seed Shipments
    await Shipment.insertMany(seedData.shipments);
    await Counter.create({ _id: 'Shipment', seq: 8 });

    // Seed default users
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedGuestPassword = await bcrypt.hash('guest', 10);

    const defaultUsers = [
      { id: 1, username: 'user', email: 'user@example.com', password: hashedUserPassword, roles: ['ROLE_USER'] },
      { id: 2, username: 'admin', email: 'admin@example.com', password: hashedAdminPassword, roles: ['ROLE_ADMIN', 'ROLE_USER'] },
      { id: 3, username: 'guest', email: 'guest@example.com', password: hashedGuestPassword, roles: ['ROLE_USER'] }
    ];
    await User.insertMany(defaultUsers);
    await Counter.create({ _id: 'User', seq: 3 });

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDb;
