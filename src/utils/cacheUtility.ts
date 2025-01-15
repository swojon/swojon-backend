import { redis } from "@/redis";
const serializeData = (data) => {
  return JSON.stringify(data, (key, value) => {
    // Convert Date objects to ISO strings
    return value instanceof Date ? value.toISOString() : value;
  });
};

const deserializeData = (data) => {
  return JSON.parse(data, (key, value) => {
    // Convert ISO strings back to Date objects
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
      ? new Date(value)
      : value;
  });
};

export const getFromCache = async (key) => {
    const cachedData = await redis.get(key);
    return cachedData ? deserializeData(cachedData) : null;
  };
  
export const setToCache = async (key, data ) => {
    await redis.set(key, serializeData(data));
  };

export const invalidateCache = async (keyPattern) => {
    const keys = await redis.keys(keyPattern);
    for (const key of keys) {
      await redis.del(key);
    }
    console.log("Invalidated", keys)
  };

//   const invalidateCache = async (keyPattern) => {
//     let cursor = 0;
//     do {
//       // Scan for keys matching the pattern
//       const [nextCursor, keys] = await redisClient.scan(cursor, {
//         MATCH: keyPattern,
//         COUNT: 100, // Adjust count for batch size
//       });
  
//       cursor = nextCursor;
  
//       if (keys.length > 0) {
//         // Delete the matched keys
//         await Promise.all(keys.map((key) => redisClient.del(key)));
//       }
//     } while (cursor !== '0'); // Continue until cursor is 0
//   };
  