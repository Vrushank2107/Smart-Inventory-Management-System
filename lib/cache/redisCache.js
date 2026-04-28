import { logger } from '../logging/logger';

class RedisCache {
  constructor() {
    this.client = null;
    this.connected = false;
    this.cache = new Map(); // Fallback in-memory cache
    this.init();
  }

  async init() {
    try {
      // Try to connect to Redis if available
      if (process.env.REDIS_URL) {
        // In a real implementation, you would use the 'redis' package
        // For now, we'll use the in-memory fallback
        logger.info('Redis URL configured, using in-memory fallback for demo');
      } else {
        logger.info('No Redis URL configured, using in-memory cache');
      }
      this.connected = true;
    } catch (error) {
      logger.warn('Redis connection failed, using in-memory cache', { error: error.message });
      this.connected = false;
    }
  }

  async get(key) {
    try {
      if (!this.connected) {
        return this.cache.get(key);
      }

      // Redis implementation would go here
      // For now, use in-memory cache
      const value = this.cache.get(key);
      
      if (value && value.expiry && Date.now() > value.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return value ? value.data : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async set(key, data, ttl = 300) { // Default TTL: 5 minutes
    try {
      if (!this.connected) {
        this.cache.set(key, { data, expiry: Date.now() + (ttl * 1000) });
        return true;
      }

      // Redis implementation would go here
      // For now, use in-memory cache
      this.cache.set(key, { data, expiry: Date.now() + (ttl * 1000) });
      
      logger.debug('Cache set successful', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.connected) {
        return this.cache.delete(key);
      }

      // Redis implementation would go here
      return this.cache.delete(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  async clear() {
    try {
      this.cache.clear();
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error', { error: error.message });
      return false;
    }
  }

  // Cleanup expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry && now > value.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      connected: this.connected,
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const redisCache = new RedisCache();

// Cleanup expired entries every 5 minutes
setInterval(() => redisCache.cleanup(), 5 * 60 * 1000);

export default redisCache;
