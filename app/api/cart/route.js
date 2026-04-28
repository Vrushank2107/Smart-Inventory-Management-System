import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

function isNotFoundPrismaError(error) {
  return error && typeof error === "object" && error.code === "P2025";
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const token = session ? null : await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!session && !token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }
    
    const userId = session?.user?.id || token?.sub;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findFirst({
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
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const token = session ? null : await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!session && !token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }
    
    const userId = session?.user?.id || token?.sub;
    
    if (!userId) {
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

    try {
      await prisma.cartItem.upsert({
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
        }
      });
    } catch (error) {
      if (!isNotFoundPrismaError(error)) {
        throw error;
      }
      // If the cart was changed concurrently, re-create and retry once.
      cart = await prisma.cart.findFirst({ where: { userId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
      }
      await prisma.cartItem.upsert({
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
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    const token = session ? null : await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!session && !token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session?.user?.id || token?.sub;
    if (!userId) {
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
        userId
      }
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    try {
      await prisma.cartItem.delete({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId
          }
        }
      });
    } catch (error) {
      if (!isNotFoundPrismaError(error)) {
        throw error;
      }
      // Item already absent; return the current cart state.
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(updatedCart || { items: [] });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
