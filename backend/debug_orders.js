import prisma from './src/config/prisma.js';

async function checkOrders() {
  const orders = await prisma.order.findMany({
    include: {
      fulfillments: {
        include: {
          items: { include: { medicine: true } },
          pharmacy: true
        }
      }
    }
  });
  console.log(JSON.stringify(orders, null, 2));
  process.exit(0);
}

checkOrders().catch(console.error);
