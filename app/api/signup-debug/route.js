import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    const debug = {
      timestamp: new Date().toISOString(),
      received: { name, email, password: password ? "***" : null },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT_SET",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET"
      }
    };

    // Test database connection
    try {
      const userCount = await prisma.user.count();
      debug.database = { connected: true, userCount };
    } catch (error) {
      debug.database = { connected: false, error: error.message };
      return NextResponse.json(debug, { status: 500 });
    }

    // Test user creation
    if (email && password) {
      try {
        const hashedPassword = await bcrypt.hash(password, 12);
        debug.userCreation = {
          attempted: true,
          hashed: true,
          passwordLength: password.length
        };

        // Don't actually create, just test
        await prisma.$disconnect();
        return NextResponse.json(debug);
      } catch (hashError) {
        debug.userCreation = {
          attempted: true,
          hashed: false,
          error: hashError.message
        };
      }
    }

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error.message
    }, { status: 500 });
  }
}
