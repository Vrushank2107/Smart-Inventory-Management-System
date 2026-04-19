import { NextResponse } from "next/server";
import { getAllProducts } from "@/repositories/productRepository";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
