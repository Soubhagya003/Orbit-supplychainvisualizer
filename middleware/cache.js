const redis = require('../config/redis');

const cache = (keyPrefix, ttl = 60) => {
    return async (req, res, next) => {
        try {
            const key = `${keyPrefix}:${req.originalUrl}`;

            const cachedData = await redis.get(key);

            if (cachedData) {
                console.log("Cache Hit");
                return res.json(JSON.parse(cachedData));
            }

            console.log("Cache Miss");

            const originalJson = res.json.bind(res);

            res.json = async (body) => {
                await redis.set(
                    key,
                    JSON.stringify(body),
                    "EX",
                    ttl
                );

                return originalJson(body);
            };

            next();
        } catch (err) {
            console.error(err);
            next();
        }
    };
};

module.exports = cache;