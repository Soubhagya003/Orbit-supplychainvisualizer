const express = require('express');
const router = express.Router();
const Shipment = require('../models/shipment.model');
const Node = require('../models/node.model');

const capitalize = (s) => {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const diffDays = (date1, date2) => {
  const timeDiff = new Date(date1) - new Date(date2);
  return timeDiff / (1000 * 60 * 60 * 24);
};

const round1 = (v) => Math.round(v * 10) / 10;

router.get('/summary', async (req, res) => {
  try {
    const allShipments = await Shipment.find({});
    const nodes = await Node.find({});
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const delivered = allShipments.filter(s => s.status && s.status.toLowerCase() === 'delivered');
    const delayed = allShipments.filter(s => s.status && s.status.toLowerCase() === 'delayed');

    // On-Time count: actualArrival <= estimatedArrival
    const onTimeCount = delivered.filter(s => {
      if (!s.actualArrival || !s.estimatedArrival) return false;
      const actual = new Date(s.actualArrival);
      const estimated = new Date(s.estimatedArrival);
      return actual <= estimated;
    }).length;

    const onTimeDeliveryRate = delivered.length === 0 ? 0 : round1((onTimeCount / delivered.length) * 100);

    // Avg Lead Time Days
    let totalLeadTimeDays = 0;
    let leadTimeCount = 0;
    delivered.forEach(s => {
      if (s.actualArrival && s.departureDate) {
        totalLeadTimeDays += diffDays(s.actualArrival, s.departureDate);
        leadTimeCount++;
      }
    });
    const avgLeadTimeDays = leadTimeCount === 0 ? 0 : round1(totalLeadTimeDays / leadTimeCount);

    // Exception rate
    const exceptionRate = allShipments.length === 0 ? 0 : round1((delayed.length / allShipments.length) * 100);

    // SLA by lane
    const laneMap = {};
    delivered.forEach(s => {
      const srcNode = nodeMap.get(s.sourceId);
      const dstNode = nodeMap.get(s.destinationId);
      if (!srcNode || !dstNode) return;

      const lane = `${srcNode.name} → ${dstNode.name}`;
      if (!laneMap[lane]) {
        laneMap[lane] = { total: 0, onTime: 0 };
      }
      laneMap[lane].total++;
      if (s.actualArrival && s.estimatedArrival && new Date(s.actualArrival) <= new Date(s.estimatedArrival)) {
        laneMap[lane].onTime++;
      }
    });

    const slaByLane = Object.entries(laneMap).map(([lane, data]) => {
      const rate = data.total === 0 ? 0 : round1((data.onTime / data.total) * 100);
      return { lane, slaRate: rate };
    });

    // Lead time by segment
    const segmentMap = {};
    delivered.forEach(s => {
      if (!s.departureDate || !s.estimatedArrival || !s.actualArrival) return;
      const srcNode = nodeMap.get(s.sourceId);
      const dstNode = nodeMap.get(s.destinationId);
      if (!srcNode || !dstNode) return;

      const segment = `${capitalize(srcNode.type)} → ${capitalize(dstNode.type)}`;
      if (!segmentMap[segment]) {
        segmentMap[segment] = [];
      }
      const target = diffDays(s.estimatedArrival, s.departureDate);
      const actual = diffDays(s.actualArrival, s.departureDate);
      segmentMap[segment].push({ target, actual });
    });

    const leadTimeBySegment = Object.entries(segmentMap).map(([segment, list]) => {
      const avgTarget = list.reduce((sum, item) => sum + item.target, 0) / list.length;
      const avgActual = list.reduce((sum, item) => sum + item.actual, 0) / list.length;
      const variance = avgActual - avgTarget;
      const varianceStr = (variance >= 0 ? '+' : '') + round1(variance).toFixed(1);

      return {
        segment,
        targetDays: round1(avgTarget),
        actualDays: round1(avgActual),
        variance: varianceStr
      };
    });

    return res.status(200).json({
      onTimeDeliveryRate,
      avgLeadTimeDays,
      exceptionRate,
      totalShipments: allShipments.length,
      deliveredShipments: delivered.length,
      slaByLane,
      leadTimeBySegment
    });
  } catch (error) {
    console.error('Error calculating analytics summary:', error);
    return res.status(500).json({ message: 'Error calculating analytics summary.' });
  }
});

module.exports = router;
