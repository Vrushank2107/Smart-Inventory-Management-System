import { NextResponse } from "next/server";
import { hydrateCartItems } from "@/repositories/cartRepository";
import { getActiveDiscountRules } from "@/repositories/discountRuleRepository";
import { DiscountEngine } from "@/services/DiscountEngine";
import { CalculateRequestSchema, validateRequest } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    logger.info('Calculate request received', { body });

    if (!body || typeof body !== 'object') {
      logger.warn('Invalid request body');
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      );
    }

    const validation = validateRequest(CalculateRequestSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: validation.error });
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error,
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      );
    }

    const { cartItems, userType } = validation.data;
    logger.info('Validation passed', { cartItems, userType });
    
    const hydratedItems = await hydrateCartItems(cartItems);
    logger.info('Cart items hydrated', { count: hydratedItems.length, items: hydratedItems });
    
    const rules = await getActiveDiscountRules();
    logger.info('Discount rules fetched', { count: rules.length, rules });
    
    const engine = new DiscountEngine({ rules });
    const result = engine.evaluate({
      cartItems: hydratedItems,
      userType
    });
    
    const duration = Date.now() - startTime;
    logger.info('Discount calculation completed', { 
      duration: `${duration}ms`,
      itemsCount: cartItems.length,
      userType,
      discountApplied: result.discountApplied,
      result
    });

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Calculate API error', { 
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      errorDetails: error.toString()
    });
    
    // Check for database connection errors
    if (error.message && (error.message.includes('connect') || error.message.includes('database'))) {
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
