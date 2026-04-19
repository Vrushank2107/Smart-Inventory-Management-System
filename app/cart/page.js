import CartClient from "@/components/CartClient";
import { getAllProducts } from "@/repositories/productRepository";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await getAllProducts();
  return <CartClient products={products} />;
}
