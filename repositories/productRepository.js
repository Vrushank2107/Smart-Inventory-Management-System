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

export async function getAllProducts(options = {}) {
  const { page = 1, limit = 10, category, search } = options;
  const skip = (page - 1) * limit;

  const where = {};
  
  if (category) {
    where.category = category;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { category: { contains: search } }
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ category: "asc" }, { createdAt: "desc" }]
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);
  
  return {
    products: products.map(serializeProduct),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

export async function getProductsByIds(ids) {
  const products = await prisma.product.findMany({
    where: { id: { in: ids } }
  });
  return products.map(serializeProduct);
}

export async function getCategories() {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });
  
  return categories.map(item => item.category);
}
