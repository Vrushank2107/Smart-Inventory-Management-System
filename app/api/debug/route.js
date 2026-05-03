import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connection
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const ruleCount = await prisma.discountRule.count();

    return NextResponse.json({
      success: true,
      database: "connected",
      data: {
        users: userCount,
        products: productCount,
        discountRules: ruleCount
      }
    });
  } catch (error) {
    console.error("Database debug error:", error);
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error.message
    }, { status: 500 });
  }
}
