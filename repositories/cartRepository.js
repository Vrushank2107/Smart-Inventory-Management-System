import { getProductsByIds } from "@/repositories/productRepository";
import { Product } from "@/lib/models/Product";

export async function hydrateCartItems(cartItems) {
  const ids = cartItems.map((item) => item.productId);
  const products = await getProductsByIds(ids);
  const productById = new Map(products.map((product) => [product.id, product]));

  return cartItems
    .map((item) => {
      const product = productById.get(item.productId);
      if (!product) return null;

      return {
        product: new Product(product),
        quantity: Number(item.quantity)
      };
    })
    .filter(Boolean);
}
