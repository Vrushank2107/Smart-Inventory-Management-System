import { prisma } from "@/lib/prisma";

// Mock data fallback for production when database is not configured
const MOCK_PRODUCTS = [
  { id: "1", name: "Wireless Headphones", price: 2999, category: "Electronics", createdAt: new Date().toISOString() },
  { id: "2", name: "Smart Watch", price: 4999, category: "Electronics", createdAt: new Date().toISOString() },
  { id: "3", name: "Laptop Stand", price: 1499, category: "Accessories", createdAt: new Date().toISOString() },
  { id: "4", name: "USB-C Hub", price: 1999, category: "Accessories", createdAt: new Date().toISOString() },
  { id: "5", name: "Mechanical Keyboard", price: 3999, category: "Electronics", createdAt: new Date().toISOString() },
  { id: "6", name: "Wireless Mouse", price: 1299, category: "Electronics", createdAt: new Date().toISOString() },
  { id: "7", name: "Monitor Light Bar", price: 2499, category: "Accessories", createdAt: new Date().toISOString() },
  { id: "8", name: "Webcam HD", price: 3499, category: "Electronics", createdAt: new Date().toISOString() },
  { id: "9", name: "Desk Mat", price: 599, category: "Accessories", createdAt: new Date().toISOString() },
  { id: "10", name: "Cable Organizer", price: 399, category: "Accessories", createdAt: new Date().toISOString() },
  { id: "11", name: "Portable SSD 1TB", price: 6999, category: "Storage", createdAt: new Date().toISOString() },
  { id: "12", name: "SD Card 128GB", price: 999, category: "Storage", createdAt: new Date().toISOString() },
];

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

  // Check if database is configured
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not configured, using mock data');
    
    let filteredProducts = [...MOCK_PRODUCTS];
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = skip;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
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
  // Check if database is configured
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not configured, using mock data for getProductsByIds');
    return MOCK_PRODUCTS.filter(p => ids.includes(p.id));
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } }
  });
  return products.map(serializeProduct);
}

export async function getCategories() {
  // Check if database is configured
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not configured, using mock data for getCategories');
    const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
    return categories.sort();
  }

  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });
  
  return categories.map(item => item.category);
}
