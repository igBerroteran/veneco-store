/* eslint-disable @typescript-eslint/no-require-imports */
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando la siembra de base de datos...');

  // 1. Limpiar base de datos
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Base de datos limpia.');

  // 2. Crear usuario administrador
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@veneco.store',
      password: hashedPassword,
      name: 'Admin Veneco',
      role: 'admin',
    },
  });
  console.log(`Usuario administrador creado: ${admin.email} (clave: admin123)`);

  // Crear usuario root administrador solicitado
  const rootEmail = process.env.ROOT_ADMIN_EMAIL;
  const rootPassword = process.env.ROOT_ADMIN_PASSWORD;

  if (!rootEmail || !rootPassword) {
    throw new Error('ROOT_ADMIN_EMAIL y ROOT_ADMIN_PASSWORD deben estar definidos en el archivo .env');
  }

  const rootHashedPassword = bcrypt.hashSync(rootPassword, 10);
  const rootAdmin = await prisma.user.create({
    data: {
      email: rootEmail,
      password: rootHashedPassword,
      name: 'Igor Berroterán',
      role: 'admin',
    },
  });
  console.log(`Usuario root administrador creado: ${rootAdmin.email}`);

  // 3. Crear usuario cliente de prueba
  const clientPassword = bcrypt.hashSync('cliente123', 10);
  const client = await prisma.user.create({
    data: {
      email: 'cliente@veneco.store',
      password: clientPassword,
      name: 'Igor Barreto',
      role: 'client',
    },
  });
  console.log(`Usuario cliente de prueba creado: ${client.email} (clave: cliente123)`);

  // 4. Crear productos iniciales con las imágenes generadas por IA
  const initialProducts = [
    {
      name: 'Gorra Negra Veneco',
      description: 'Gorra snapback de alta calidad color negro con bordado blanco de la marca VENECO y sus 7 estrellas. Ajuste regulable para máxima comodidad y estilo streetwear.',
      price: 25.00,
      image: '/products/veneco_black_cap.png',
      category: 'gorras',
      stock: 20,
      sizes: 'Ajustable',
    },
    {
      name: 'Gorra Blanca Veneco',
      description: 'Gorra snapback blanca premium con bordado negro de la marca VENECO y sus 7 estrellas. Un clásico sobrio y moderno con un contraste impecable.',
      price: 25.00,
      image: '/products/veneco_white_cap.png',
      category: 'gorras',
      stock: 15,
      sizes: 'Ajustable',
    },
    {
      name: 'Franela Negra Veneco Streetwear',
      description: 'Franela de corte oversized en color negro confeccionada en algodón pesado de 240g. Presenta la inscripción VENECO y el lema oficial de la marca: "De un insulto, sacamos un Grammy".',
      price: 35.00,
      image: '/products/veneco_black_shirt.png',
      category: 'camisas',
      stock: 30,
      sizes: 'S,M,L,XL',
    },
    {
      name: 'Franela Blanca Veneco Streetwear',
      description: 'Franela oversized premium en color blanco con tipografía en alto contraste negro y el lema: "De un insulto, sacamos un Grammy". Estilo sobrio y editorial.',
      price: 35.00,
      image: '/products/veneco_white_shirt.png',
      category: 'camisas',
      stock: 25,
      sizes: 'S,M,L,XL',
    },
    {
      name: 'Guayabera "La Custodia" Streetwear',
      description: 'Camisa de cuello camp / guayabera en lino y algodón premium. Presenta un patrón repetitivo de alto contraste inspirado en la iconografía urbana venezolana contemporánea. Ajuste holgado, botonadura frontal y caída fluida de alta gama.',
      price: 45.00,
      image: '/products/veneco_guayabera.png',
      category: 'camisas',
      stock: 15,
      sizes: 'S,M,L,XL',
    },
  ];

  for (const productData of initialProducts) {
    const product = await prisma.product.create({
      data: productData,
    });
    console.log(`Producto creado: ${product.name} (${product.category})`);
  }

  console.log('Siembra de base de datos completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
