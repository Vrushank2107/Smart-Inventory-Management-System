import { NextResponse } from "next/server";
import { getAllProducts } from "@/repositories/productRepository";
import { ProductQuerySchema, validateRequest } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    
    logger.info('Products request received', { 
      query,
      userAgent: req.headers.get('user-agent')
    });

    const validation = validateRequest(ProductQuerySchema, query);
    if (!validation.success) {
      logger.warn('Products validation failed', { errors: validation.error });
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
    logger.info('Products retrieved successfully', { 
      duration: `${duration}ms`,
      page,
      limit,
      total: result.total,
      category,
      search
    });

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Products API error', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });
    
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
