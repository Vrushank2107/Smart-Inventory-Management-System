import { prisma } from "@/lib/prisma";

function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    category: product.category,
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt
  };
}

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }]
  });
  return products.map(serializeProduct);
}

export async function getProductsByIds(ids) {
  const products = await prisma.product.findMany({
    where: { id: { in: ids } }
  });
  return products.map(serializeProduct);
}
