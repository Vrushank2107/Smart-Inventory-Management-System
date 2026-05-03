import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET",
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT_SET"
    },
    nextauth: {
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      urlValid: process.env.NEXTAUTH_URL?.startsWith('http') || false
    }
  };

  // Test database connection
  try {
    const { prisma } = await import("@/lib/prisma");
    const userCount = await prisma.user.count();
    debug.database = {
      connected: true,
      userCount: userCount,
      productCount: await prisma.product.count(),
      ruleCount: await prisma.discountRule.count()
    };
  } catch (error) {
    debug.database = {
      connected: false,
      error: error.message
    };
  }

  return NextResponse.json(debug);
}
