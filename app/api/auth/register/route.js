import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema, validateRequest } from "@/lib/validation/schemas";

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not configured');
      return NextResponse.json({ 
        error: 'Server configuration error: Database not configured',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const body = await request.json();

    const validation = validateRequest(RegisterSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid registration data',
          details: validation.error,
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      );
    }

    const { name, email, password, type = 'NORMAL' } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'User already exists with this email',
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type
      }
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('Registration error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // Check for specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'User already exists with this email',
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }
    
    // Check for connection errors
    if (error.code === 'P1001' || error.message?.includes('can\'t reach database')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
