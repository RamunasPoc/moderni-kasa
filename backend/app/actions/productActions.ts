'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// 1. Gauti tik prisijungusio direktoriaus įmonės prekes
export async function getProducts() {
  try {
    const session = await getServerSession();
    const companyId = (session?.user as any)?.companyId;

    if (!companyId) {
      throw new Error('Neprisijungęs vartotojas arba nerastas įmonės ID.');
    }

    const products = await prisma.product.findMany({
      where: { companyId }, // Filtruojame pagal įmonę, kad UAB A nematytų UAB B prekių
      orderBy: { createdAt: 'desc' },
    });
    return products;
  } catch (error) {
    console.error('Klaida gaunant prekes:', error);
    return [];
  }
}

// 2. Sukurti naują prekę priskiriant ją direktoriaus įmonei
export async function createProduct(formData: FormData) {
  try {
    const session = await getServerSession();
    const companyId = (session?.user as any)?.companyId;

    if (!companyId) {
      throw new Error('Neprisijungęs vartotojas arba nerastas įmonės ID.');
    }

    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseFloat(formData.get('stock') as string || '0');

    if (!name || isNaN(price)) {
      throw new Error('Neteisingi duomenys: trūksta pavadinimo arba kainos.');
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        companyId, // Priskiriame prekę konkrečiai įmonei
      },
    });
    
    return newProduct;
  } catch (error) {
    console.error('Klaida kuriant prekę:', error);
    throw error;
  }
}