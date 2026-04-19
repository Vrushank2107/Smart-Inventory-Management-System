import ShopClient from "@/components/ShopClient";
import { getAllProducts } from "@/repositories/productRepository";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await getAllProducts();
  return <ShopClient products={products} />;
}
