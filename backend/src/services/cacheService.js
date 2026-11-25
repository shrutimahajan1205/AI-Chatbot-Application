class CacheService {
  constructor(ttlMs = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  _getKey(prompt, category, botName) {
    return `${category}_${botName}_${prompt.trim().toLowerCase()}`;
  }

  get(prompt, category = "casual", botName = "Antigravity AI") {
    const key = this._getKey(prompt, category, botName);
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(prompt, category = "casual", botName = "Antigravity AI", data) {
    const key = this._getKey(prompt, category, botName);
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttlMs
    });
  }

  clear() {
    this.cache.clear();
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
