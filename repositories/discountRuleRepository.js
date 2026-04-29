import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logging/logger";

// Mock discount rules for production when database is not configured
const MOCK_DISCOUNT_RULES = [
  {
    id: "1",
    name: "Festival Discount",
    type: "FESTIVAL",
    priority: 1,
    isActive: true,
    combinable: true,
    value: 10
  },
  {
    id: "2",
    name: "Silver Membership",
    type: "MEMBERSHIP",
    priority: 2,
    isActive: true,
    combinable: true,
    value: 5
  },
  {
    id: "3",
    name: "Gold Membership",
    type: "MEMBERSHIP",
    priority: 3,
    isActive: true,
    combinable: true,
    value: 10
  },
  {
    id: "4",
    name: "Bulk Purchase",
    type: "MIN_PURCHASE",
    priority: 1,
    isActive: true,
    combinable: true,
    value: 5000
  }
];

export async function getActiveDiscountRules() {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured, using mock discount rules');
      return MOCK_DISCOUNT_RULES.filter(rule => rule.isActive);
    }

    // Fetch from database
    logger.info('Fetching discount rules from database');
    const rules = await prisma.discountRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { name: "asc" }]
    });

    logger.info('Discount rules fetched successfully', { count: rules.length });
    return rules;
  } catch (error) {
    logger.error('Error fetching discount rules', { error: error.message });
    // Return mock rules as fallback
    console.warn('Error fetching discount rules, using mock data as fallback');
    return MOCK_DISCOUNT_RULES.filter(rule => rule.isActive);
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
    
    logger.info('Discount rule deleted', { id, name: rule.name });
    
    return rule;
  } catch (error) {
    logger.error('Error deleting discount rule', { id, error: error.message });
    throw error;
  }
}
