import { NextResponse } from "next/server";
import { hydrateCartItems } from "@/repositories/cartRepository";
import { getActiveDiscountRules } from "@/repositories/discountRuleRepository";
import { DiscountEngine } from "@/services/DiscountEngine";

export async function POST(req) {
  try {
    const body = await req.json();
    const { cartItems = [], userType = "NORMAL" } = body;

    const hydratedItems = await hydrateCartItems(cartItems);
    const rules = await getActiveDiscountRules();
    const engine = new DiscountEngine({ rules });
    const result = engine.evaluate({
      cartItems: hydratedItems,
      userType
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
