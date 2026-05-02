import { NextResponse } from "next/server";
import { getAllProducts } from "@/repositories/productRepository";
import { ProductQuerySchema, validateRequest } from "@/lib/validation/schemas";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(
      req.url || '',
      req.nextUrl?.origin || 'https://smart-inventory-management-system-gamma.vercel.app'
    );
    const query = Object.fromEntries(searchParams.entries());
    
    const validation = validateRequest(ProductQuerySchema, query);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error,
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      );
    }

    const { page, limit, category, search } = validation.data;
    
    const result = await getAllProducts({
      page,
      limit,
      category,
      search
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Check for database connection errors
    if (error.message && error.message.includes('connect')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please check your database configuration.',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
