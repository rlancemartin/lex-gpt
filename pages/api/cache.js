// in memory cache for QA
const cache = require('memory-cache');
module.exports = {
  get: (key) => cache[key],
  set: (key, value) => { cache[key] = value; },
};