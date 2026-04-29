import { getProductsByIds } from "@/repositories/productRepository";
import { Product } from "@/lib/models/Product";
import { logger } from "@/lib/logging/logger";

export async function hydrateCartItems(cartItems) {
  try {
    const ids = cartItems.map((item) => item.productId);
    logger.info('Hydrating cart items', { ids, cartItems });
    
    const products = await getProductsByIds(ids);
    logger.info('Products fetched for hydration', { products, count: products.length });
    
    const productById = new Map(products.map((product) => [product.id, product]));

    const hydrated = cartItems
      .map((item) => {
        const product = productById.get(item.productId);
        if (!product) {
          logger.warn('Product not found for cart item', { productId: item.productId });
          return null;
        }

        return {
          product: new Product(product),
          quantity: Number(item.quantity)
        };
      })
      .filter(Boolean);
    
    logger.info('Cart items hydrated successfully', { count: hydrated.length });
    return hydrated;
  } catch (error) {
    logger.error('Error hydrating cart items', { error: error.message, stack: error.stack });
    throw error;
  }
}
