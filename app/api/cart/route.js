import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request) {
  try {
    // Try both session methods
    const session = await getServerSession(authOptions);
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    console.log('Cart API - Session check:', session ? 'Session found' : 'No session');
    console.log('Cart API - Token check:', token ? 'Token found' : 'No token');
    console.log('Cart API - Request headers:', Object.fromEntries(request.headers.entries()));
    
    if (!session && !token) {
      console.log('Cart API - Unauthorized access attempt');
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }
    
    // Use token if session is not available
    const userId = session?.user?.id || token?.sub;
    
    if (!userId) {
      console.log('Cart API - No user ID found');
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    // Get or create user's cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId: userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Try both session methods
    const session = await getServerSession(authOptions);
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    console.log('Cart POST API - Session check:', session ? 'Session found' : 'No session');
    console.log('Cart POST API - Token check:', token ? 'Token found' : 'No token');
    
    if (!session && !token) {
      console.log('Cart POST API - Unauthorized access attempt');
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }
    
    // Use token if session is not available
    const userId = session?.user?.id || token?.sub;
    
    if (!userId) {
      console.log('Cart POST API - No user ID found');
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid product or quantity" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get or create user's cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId: userId
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId
        }
      });
    }

    // Update or create cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      },
      update: {
        quantity: quantity
      },
      create: {
        cartId: cart.id,
        productId: productId,
        quantity: quantity
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    // Get user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id
      }
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Remove cart item
    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      }
    });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
