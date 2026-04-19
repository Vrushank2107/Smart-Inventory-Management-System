import { prisma } from "@/lib/prisma";

export async function getActiveDiscountRules() {
  return prisma.discountRule.findMany({
    where: { isActive: true },
    orderBy: [{ priority: "desc" }, { name: "asc" }]
  });
}
