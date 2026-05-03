const { PrismaClient, UserType, DiscountRuleType } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  const products = await prisma.product.createMany({
    data: [
      { name: "Wireless Mouse", price: 899, category: "Accessories" },
      { name: "Mechanical Keyboard", price: 3299, category: "Accessories" },
      { name: "USB-C Hub", price: 1899, category: "Accessories" },
      { name: "Laptop Stand", price: 1499, category: "Office" },
      { name: "Noise-Canceling Headphones", price: 6999, category: "Audio" },
      { name: "Smartwatch", price: 9999, category: "Wearables" },
      { name: "Portable SSD 1TB", price: 7499, category: "Storage" },
      { name: "Webcam HD", price: 2599, category: "Video" },
      { name: "Gaming Controller", price: 4199, category: "Gaming" },
      { name: "Bluetooth Speaker", price: 3599, category: "Audio" },
      { name: "Desk Lamp", price: 1299, category: "Office" },
      { name: "Ergonomic Chair Cushion", price: 2199, category: "Office" }
    ]
  });

  const bcrypt = require("bcryptjs");

  // Create demo users with authentication
  const hashedPasswordNormal = await bcrypt.hash("password123", 12);
  const hashedPasswordSilver = await bcrypt.hash("password123", 12);
  const hashedPasswordGold = await bcrypt.hash("password123", 12);

  const users = await prisma.user.createMany({
    data: [
      { 
        name: "Nisha", 
        email: "nisha@example.com", 
        password: hashedPasswordNormal,
        type: UserType.NORMAL 
      },
      { 
        name: "Arjun", 
        email: "arjun@example.com", 
        password: hashedPasswordSilver,
        type: UserType.SILVER 
      },
      { 
        name: "Meera", 
        email: "meera@example.com", 
        password: hashedPasswordGold,
        type: UserType.GOLD 
      }
    ]
  });

  const rules = await prisma.discountRule.createMany({
    data: [
      { name: "New Year Discount 10%", type: DiscountRuleType.FESTIVAL, value: 10, isActive: true, priority: 90, combinable: false },
      { name: "Diwali Discount 15%", type: DiscountRuleType.FESTIVAL, value: 15, isActive: true, priority: 85, combinable: false },
      { name: "Weekend Discount 5%", type: DiscountRuleType.FESTIVAL, value: 5, isActive: true, priority: 70, combinable: true },
      { name: "Membership Bonus 10%", type: DiscountRuleType.MEMBERSHIP, value: 10, isActive: true, priority: 80, combinable: true },
      { name: "Premium Membership 15%", type: DiscountRuleType.MEMBERSHIP, value: 15, isActive: true, priority: 75, combinable: false },
      { name: "Min Purchase 5000", type: DiscountRuleType.MIN_PURCHASE, value: 5000, isActive: true, priority: 65, combinable: true },
      { name: "Min Purchase 10000", type: DiscountRuleType.MIN_PURCHASE, value: 10000, isActive: true, priority: 88, combinable: false },
      { name: "Dormant Rule", type: DiscountRuleType.FESTIVAL, value: 20, isActive: false, priority: 99, combinable: true }
    ]
  });

  console.log("Seed completed:", { products, users, rules });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
