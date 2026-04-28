import { NextResponse } from "next/server";
import { hydrateCartItems } from "@/repositories/cartRepository";
import { getActiveDiscountRules } from "@/repositories/discountRuleRepository";
import { DiscountEngine } from "@/services/DiscountEngine";
import { CalculateRequestSchema, validateRequest } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export async function POST(req) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    logger.info('Calculate request received', { 
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

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
    
    console.log("API received userType:", userType);
    console.log("API received cartItems:", cartItems);
    
    const hydratedItems = await hydrateCartItems(cartItems);
    console.log("Hydrated items:", hydratedItems);
    
    const rules = await getActiveDiscountRules();
    console.log("Active rules:", rules);
    
    const engine = new DiscountEngine({ rules });
    const result = engine.evaluate({
      cartItems: hydratedItems,
      userType
    });
    
    console.log("Discount engine result:", result);

    const duration = Date.now() - startTime;
    logger.info('Discount calculation completed', { 
      duration: `${duration}ms`,
      itemsCount: cartItems.length,
      userType,
      discountApplied: result.discountApplied
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
      duration: `${duration}ms`
    });
    
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
