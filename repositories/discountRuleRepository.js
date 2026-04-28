import { prisma } from "@/lib/prisma";
import { redisCache } from "@/lib/cache/redisCache";
import { logger } from "@/lib/logging/logger";

const CACHE_KEY = 'active_discount_rules';
const CACHE_TTL = 300; // 5 minutes

// Mock discount rules for production when database is not configured
const MOCK_DISCOUNT_RULES = [
  {
    id: "1",
    name: "Festival Discount",
    type: "FESTIVAL",
    priority: 1,
    isActive: true,
    combinable: true,
    config: { discountPercent: 10, minPurchase: 0 }
  },
  {
    id: "2",
    name: "Silver Membership",
    type: "MEMBERSHIP",
    priority: 2,
    isActive: true,
    combinable: true,
    config: { discountPercent: 5, userType: "SILVER" }
  },
  {
    id: "3",
    name: "Gold Membership",
    type: "MEMBERSHIP",
    priority: 3,
    isActive: true,
    combinable: true,
    config: { discountPercent: 10, userType: "GOLD" }
  },
  {
    id: "4",
    name: "Bulk Purchase",
    type: "MIN_PURCHASE",
    priority: 1,
    isActive: true,
    combinable: true,
    config: { discountPercent: 15, minPurchase: 5000 }
  }
];

export async function getActiveDiscountRules() {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured, using mock discount rules');
      return MOCK_DISCOUNT_RULES.filter(rule => rule.isActive);
    }

    // Try to get from cache first
    const cachedRules = await redisCache.get(CACHE_KEY);
    if (cachedRules) {
      logger.debug('Discount rules retrieved from cache');
      return cachedRules;
    }

    // If not in cache, fetch from database
    logger.info('Fetching discount rules from database');
    const rules = await prisma.discountRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { name: "asc" }]
    });

    // Cache the results
    await redisCache.set(CACHE_KEY, rules, CACHE_TTL);
    logger.info('Discount rules cached successfully', { count: rules.length });

    return rules;
  } catch (error) {
    logger.error('Error fetching discount rules', { error: error.message });
    // Return mock rules as fallback
    console.warn('Error fetching discount rules, using mock data as fallback');
    return MOCK_DISCOUNT_RULES.filter(rule => rule.isActive);
  }
}

export async function invalidateDiscountRulesCache() {
  try {
    await redisCache.del(CACHE_KEY);
    logger.info('Discount rules cache invalidated');
    return true;
  } catch (error) {
    logger.error('Error invalidating discount rules cache', { error: error.message });
    return false;
  }
}

export async function getAllDiscountRules() {
  try {
    const rules = await prisma.discountRule.findMany({
      orderBy: [{ priority: "desc" }, { name: "asc" }]
    });
    return rules;
  } catch (error) {
    logger.error('Error fetching all discount rules', { error: error.message });
    throw error;
  }
}

export async function createDiscountRule(data) {
  try {
    const rule = await prisma.discountRule.create({
      data
    });
    
    // Invalidate cache when new rule is created
    await invalidateDiscountRulesCache();
    logger.info('New discount rule created', { id: rule.id, name: rule.name });
    
    return rule;
  } catch (error) {
    logger.error('Error creating discount rule', { error: error.message });
    throw error;
  }
}

export async function updateDiscountRule(id, data) {
  try {
    const rule = await prisma.discountRule.update({
      where: { id },
      data
    });
    
    // Invalidate cache when rule is updated
    await invalidateDiscountRulesCache();
    logger.info('Discount rule updated', { id, name: rule.name });
    
    return rule;
  } catch (error) {
    logger.error('Error updating discount rule', { id, error: error.message });
    throw error;
  }
}

export async function deleteDiscountRule(id) {
  try {
    const rule = await prisma.discountRule.delete({
      where: { id }
    });
    
    // Invalidate cache when rule is deleted
    await invalidateDiscountRulesCache();
    logger.info('Discount rule deleted', { id, name: rule.name });
    
    return rule;
  } catch (error) {
    logger.error('Error deleting discount rule', { id, error: error.message });
    throw error;
  }
}
