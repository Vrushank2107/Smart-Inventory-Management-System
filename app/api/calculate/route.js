import { NextResponse } from "next/server";
import { hydrateCartItems } from "@/repositories/cartRepository";
import { getActiveDiscountRules } from "@/repositories/discountRuleRepository";
import { DiscountEngine } from "@/services/DiscountEngine";
import { CalculateRequestSchema, validateRequest } from "@/lib/validation/schemas";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
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
    
    const hydratedItems = await hydrateCartItems(cartItems);
    
    const rules = await getActiveDiscountRules();
    
    const engine = new DiscountEngine({ rules });
    const result = engine.evaluate({
      cartItems: hydratedItems,
      userType
    });
    
    const duration = Date.now() - startTime;

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
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
