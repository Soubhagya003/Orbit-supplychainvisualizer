const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes

    max: 5,                   // 100 requests/IP

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        message: "Too many requests. Please try again later."
    },

    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args)
    })
});

module.exports = limiter;