const nodes = [
  { id: 1, name: 'Shanghai Factory', type: 'factory', latitude: 31.2304, longitude: 121.4737, capacity: 50000, status: 'active' },
  { id: 2, name: 'Shenzhen Factory', type: 'factory', latitude: 22.5431, longitude: 114.0579, capacity: 40000, status: 'active' },
  { id: 3, name: 'Los Angeles Warehouse', type: 'warehouse', latitude: 33.9425, longitude: -118.2551, capacity: 30000, status: 'active' },
  { id: 4, name: 'Chicago Distribution Center', type: 'warehouse', latitude: 41.8781, longitude: -87.6298, capacity: 25000, status: 'active' },
  { id: 5, name: 'New York Warehouse', type: 'warehouse', latitude: 40.7128, longitude: -74.0060, capacity: 20000, status: 'active' },
  { id: 6, name: 'Miami Store', type: 'store', latitude: 25.7617, longitude: -80.1918, capacity: 5000, status: 'active' },
  { id: 7, name: 'Dallas Store', type: 'store', latitude: 32.7767, longitude: -96.7970, capacity: 4500, status: 'active' },
  { id: 8, name: 'Seattle Store', type: 'store', latitude: 47.6062, longitude: -122.3321, capacity: 4000, status: 'active' },
  { id: 9, name: 'London Warehouse', type: 'warehouse', latitude: 51.5074, longitude: -0.1278, capacity: 22000, status: 'active' },
  { id: 10, name: 'Tokyo Distribution Center', type: 'warehouse', latitude: 35.6762, longitude: 139.6503, capacity: 18000, status: 'active' },
  { id: 11, name: 'Mumbai Factory', type: 'factory', latitude: 19.0760, longitude: 72.8777, capacity: 35000, status: 'active' },
  { id: 12, name: 'Sao Paulo Store', type: 'store', latitude: -23.5505, longitude: -46.6333, capacity: 6000, status: 'active' }
];

const products = [
  { id: 1, name: 'Laptop Pro 15"', description: 'High-performance laptop with 16GB RAM', unitPrice: 1299.99, weight: 2.1, sku: 'ELEC-LP15-001', status: 'active' },
  { id: 2, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', unitPrice: 29.99, weight: 0.1, sku: 'ELEC-WM-002', status: 'active' },
  { id: 3, name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI output', unitPrice: 49.99, weight: 0.15, sku: 'ELEC-HUB-003', status: 'active' },
  { id: 4, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with Cherry MX switches', unitPrice: 89.99, weight: 0.9, sku: 'ELEC-KB-004', status: 'active' },
  { id: 5, name: '27" Monitor', description: '4K IPS monitor with HDR support', unitPrice: 449.99, weight: 5.5, sku: 'ELEC-MON-005', status: 'active' },
  { id: 6, name: 'Webcam HD', description: '1080p webcam with built-in microphone', unitPrice: 59.99, weight: 0.2, sku: 'ELEC-WC-006', status: 'active' },
  { id: 7, name: 'Portable SSD 1TB', description: 'External SSD with USB 3.2 interface', unitPrice: 109.99, weight: 0.05, sku: 'STOR-SSD-007', status: 'active' },
  { id: 8, name: 'Noise-Canceling Headphones', description: 'Over-ear wireless headphones with ANC', unitPrice: 199.99, weight: 0.3, sku: 'AUDIO-HP-008', status: 'active' },
  { id: 9, name: 'Tablet 10"', description: '10-inch tablet with stylus support', unitPrice: 399.99, weight: 0.5, sku: 'ELEC-TAB-009', status: 'active' },
  { id: 10, name: 'Smartphone Case', description: 'Shockproof phone case, universal fit', unitPrice: 19.99, weight: 0.05, sku: 'ACC-CASE-010', status: 'active' }
];

const connections = [
  { id: 1, sourceId: 1, targetId: 3, transportationType: 'ship', distance: 10500, travelTime: 360, costPerUnit: 2.50, status: 'active' },
  { id: 2, sourceId: 2, targetId: 3, transportationType: 'ship', distance: 11200, travelTime: 384, costPerUnit: 2.75, status: 'active' },
  { id: 3, sourceId: 3, targetId: 4, transportationType: 'truck', distance: 2800, travelTime: 30, costPerUnit: 1.20, status: 'active' },
  { id: 4, sourceId: 3, targetId: 8, transportationType: 'truck', distance: 1800, travelTime: 20, costPerUnit: 1.00, status: 'active' },
  { id: 5, sourceId: 4, targetId: 5, transportationType: 'train', distance: 1270, travelTime: 18, costPerUnit: 0.80, status: 'active' },
  { id: 6, sourceId: 4, targetId: 7, transportationType: 'truck', distance: 1450, travelTime: 14, costPerUnit: 0.95, status: 'active' },
  { id: 7, sourceId: 5, targetId: 6, transportationType: 'truck', distance: 2050, travelTime: 20, costPerUnit: 1.10, status: 'active' },
  { id: 8, sourceId: 1, targetId: 10, transportationType: 'ship', distance: 1800, travelTime: 72, costPerUnit: 1.80, status: 'active' },
  { id: 9, sourceId: 1, targetId: 9, transportationType: 'ship', distance: 9500, travelTime: 480, costPerUnit: 3.00, status: 'active' },
  { id: 10, sourceId: 11, targetId: 9, transportationType: 'ship', distance: 7200, travelTime: 336, costPerUnit: 2.60, status: 'active' },
  { id: 11, sourceId: 9, targetId: 12, transportationType: 'ship', distance: 9400, travelTime: 408, costPerUnit: 3.20, status: 'active' },
  { id: 12, sourceId: 11, targetId: 3, transportationType: 'ship', distance: 14500, travelTime: 504, costPerUnit: 3.50, status: 'active' }
];

const inventory = [
  { id: 1, nodeId: 1, productId: 1, quantity: 5000, minThreshold: 1000, maxThreshold: 10000 },
  { id: 2, nodeId: 1, productId: 5, quantity: 3000, minThreshold: 500, maxThreshold: 6000 },
  { id: 3, nodeId: 1, productId: 9, quantity: 4000, minThreshold: 800, maxThreshold: 8000 },
  { id: 4, nodeId: 2, productId: 2, quantity: 15000, minThreshold: 3000, maxThreshold: 30000 },
  { id: 5, nodeId: 2, productId: 3, quantity: 10000, minThreshold: 2000, maxThreshold: 20000 },
  { id: 6, nodeId: 2, productId: 4, quantity: 8000, minThreshold: 1500, maxThreshold: 15000 },
  { id: 7, nodeId: 3, productId: 1, quantity: 2000, minThreshold: 500, maxThreshold: 5000 },
  { id: 8, nodeId: 3, productId: 2, quantity: 6000, minThreshold: 1000, maxThreshold: 12000 },
  { id: 9, nodeId: 3, productId: 5, quantity: 1500, minThreshold: 300, maxThreshold: 3000 },
  { id: 10, nodeId: 4, productId: 1, quantity: 800, minThreshold: 200, maxThreshold: 2000 },
  { id: 11, nodeId: 4, productId: 4, quantity: 2500, minThreshold: 500, maxThreshold: 5000 },
  { id: 12, nodeId: 4, productId: 7, quantity: 3000, minThreshold: 600, maxThreshold: 6000 },
  { id: 13, nodeId: 5, productId: 8, quantity: 1200, minThreshold: 200, maxThreshold: 2500 },
  { id: 14, nodeId: 5, productId: 6, quantity: 2000, minThreshold: 400, maxThreshold: 4000 },
  { id: 15, nodeId: 6, productId: 1, quantity: 150, minThreshold: 50, maxThreshold: 500 },
  { id: 16, nodeId: 6, productId: 10, quantity: 3000, minThreshold: 500, maxThreshold: 6000 },
  { id: 17, nodeId: 7, productId: 2, quantity: 800, minThreshold: 200, maxThreshold: 2000 },
  { id: 18, nodeId: 7, productId: 3, quantity: 600, minThreshold: 100, maxThreshold: 1500 },
  { id: 19, nodeId: 8, productId: 7, quantity: 400, minThreshold: 100, maxThreshold: 1000 },
  { id: 20, nodeId: 8, productId: 8, quantity: 300, minThreshold: 50, maxThreshold: 800 },
  { id: 21, nodeId: 9, productId: 1, quantity: 1000, minThreshold: 200, maxThreshold: 3000 },
  { id: 22, nodeId: 9, productId: 9, quantity: 800, minThreshold: 150, maxThreshold: 2000 },
  { id: 23, nodeId: 10, productId: 5, quantity: 600, minThreshold: 100, maxThreshold: 1500 },
  { id: 24, nodeId: 10, productId: 4, quantity: 1200, minThreshold: 250, maxThreshold: 3000 },
  { id: 25, nodeId: 11, productId: 2, quantity: 12000, minThreshold: 2000, maxThreshold: 25000 },
  { id: 26, nodeId: 11, productId: 6, quantity: 9000, minThreshold: 1500, maxThreshold: 18000 },
  { id: 27, nodeId: 11, productId: 10, quantity: 20000, minThreshold: 4000, maxThreshold: 40000 },
  { id: 28, nodeId: 12, productId: 1, quantity: 100, minThreshold: 30, maxThreshold: 300 },
  { id: 29, nodeId: 12, productId: 8, quantity: 200, minThreshold: 50, maxThreshold: 500 },
  { id: 30, nodeId: 12, productId: 10, quantity: 1500, minThreshold: 300, maxThreshold: 4000 }
];

const shipments = [
  { id: 1, sourceId: 1, destinationId: 3, status: 'delivered', departureDate: '2026-01-05', estimatedArrival: '2026-01-20', actualArrival: '2026-01-19', items: [{ productId: 1, quantity: 50 }] },
  { id: 2, sourceId: 2, destinationId: 3, status: 'in_transit', departureDate: '2026-02-01', estimatedArrival: '2026-02-17', actualArrival: null, items: [{ productId: 2, quantity: 100 }] },
  { id: 3, sourceId: 3, destinationId: 4, status: 'in_transit', departureDate: '2026-02-08', estimatedArrival: '2026-02-10', actualArrival: null, items: [{ productId: 1, quantity: 20 }] },
  { id: 4, sourceId: 4, destinationId: 5, status: 'pending', departureDate: '2026-02-15', estimatedArrival: '2026-02-16', actualArrival: null, items: [{ productId: 4, quantity: 50 }] },
  { id: 5, sourceId: 5, destinationId: 6, status: 'pending', departureDate: '2026-02-18', estimatedArrival: '2026-02-20', actualArrival: null, items: [{ productId: 8, quantity: 30 }] },
  { id: 6, sourceId: 1, destinationId: 10, status: 'delivered', departureDate: '2026-01-10', estimatedArrival: '2026-01-13', actualArrival: '2026-01-13', items: [{ productId: 5, quantity: 40 }] },
  { id: 7, sourceId: 11, destinationId: 9, status: 'in_transit', departureDate: '2026-01-28', estimatedArrival: '2026-02-11', actualArrival: null, items: [{ productId: 6, quantity: 80 }] },
  { id: 8, sourceId: 3, destinationId: 8, status: 'delayed', departureDate: '2026-02-03', estimatedArrival: '2026-02-04', actualArrival: null, items: [{ productId: 7, quantity: 10 }] }
];

module.exports = {
  nodes,
  products,
  connections,
  inventory,
  shipments
};
