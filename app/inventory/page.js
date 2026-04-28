import ShopClient from "@/components/ShopClient";
import { getAllProducts, getCategories } from "@/repositories/productRepository";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const initialData = await getAllProducts({ page: 1, limit: 12 });
  const categories = await getCategories();
  
  return (
    <ShopClient 
      initialData={initialData} 
      categories={categories}
    />
  );
}
