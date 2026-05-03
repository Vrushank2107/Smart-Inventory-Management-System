import { prisma } from "@/lib/prisma";

// Mock discount rules for production when database is not configured
const MOCK_DISCOUNT_RULES = [
  {
    id: "1",
    name: "New Year Discount 10%",
    type: "FESTIVAL",
    priority: 90,
    isActive: true,
    combinable: false,
    value: 10
  },
  {
    id: "2",
    name: "Diwali Discount 15%",
    type: "FESTIVAL",
    priority: 85,
    isActive: true,
    combinable: false,
    value: 15
  },
  {
    id: "3",
    name: "Weekend Discount 5%",
    type: "FESTIVAL",
    priority: 70,
    isActive: true,
    combinable: true,
    value: 5
  },
  {
    id: "4",
    name: "Silver Membership",
    type: "MEMBERSHIP",
    priority: 80,
    isActive: true,
    combinable: true,
    value: 5
  },
  {
    id: "5",
    name: "Gold Membership",
    type: "MEMBERSHIP",
    priority: 75,
    isActive: true,
    combinable: true,
    value: 10
  },
  {
    id: "6",
    name: "Bulk Purchase",
    type: "MIN_PURCHASE",
    priority: 65,
    isActive: true,
    combinable: true,
    value: 5000
  },
  {
    id: "7",
    name: "Min Purchase 10000",
    type: "MIN_PURCHASE",
    priority: 88,
    isActive: true,
    combinable: false,
    value: 10000
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
    const rules = await prisma.discountRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { name: "asc" }]
    });

    return rules;
  } catch (error) {
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
    throw error;
  }
}

export async function createDiscountRule(data) {
  try {
    const rule = await prisma.discountRule.create({
      data
    });
    
    return rule;
  } catch (error) {
    throw error;
  }
}

export async function updateDiscountRule(id, data) {
  try {
    const rule = await prisma.discountRule.update({
      where: { id },
      data
    });
    
    return rule;
  } catch (error) {
    throw error;
  }
}

export async function deleteDiscountRule(id) {
  try {
    const rule = await prisma.discountRule.delete({
      where: { id }
    });
    
    return rule;
  } catch (error) {
    throw error;
  }
}
