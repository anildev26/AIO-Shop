const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function main() {
  const products = await prisma.product.findMany({ where: { slug: null } });
  console.log('Products without slug:', products.length);
  for (const p of products) {
    let slug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = slug + '-' + Date.now().toString(36);
    await prisma.product.update({ where: { id: p.id }, data: { slug } });
    console.log('Updated:', p.name, '->', slug);
  }
  await prisma.$disconnect();
}

main();
