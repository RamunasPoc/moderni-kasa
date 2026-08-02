'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// 1. Gauti visus prisijungusio direktoriaus įmonės čekius (istorijai)
export async function getReceipts() {
  try {
    const session = await getServerSession();
    const companyId = (session?.user as any)?.companyId;

    if (!companyId) {
      throw new Error('Neprisijungęs vartotojas arba nerastas įmonės ID.');
    }

    const receipts = await prisma.receipt.findMany({
      where: { companyId }, // Filtruojame pagal įmonę
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
    return receipts;
  } catch (error) {
    console.error('Klaida gaunant čekius:', error);
    return [];
  }
}

// 2. Sukurti naują čekį priskiriant jį direktoriaus įmonei
export async function createReceipt(data: {
  receiptNumber: number;
  totalAmount: number;
  items: { name: string; quantity: number; price: number; vatRate: number }[];
  cryptoSign?: string;
}) {
  try {
    const session = await getServerSession();
    const companyId = (session?.user as any)?.companyId;
    const userId = (session?.user as any)?.id;

    if (!companyId) {
      return { success: false, error: 'Neprisijungęs vartotojas arba nerastas įmonės ID.' };
    }

    const newReceipt = await prisma.receipt.create({
      data: {
        receiptNumber: data.receiptNumber,
        totalAmount: data.totalAmount,
        cryptoSign: data.cryptoSign || null,
        status: 'COMPLETED',
        companyId, // Būtinai priskiriame įmonei
        userId: userId || null, // Galima priskirti, kas išmušė čekį
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            vatRate: item.vatRate,
          })),
        },
      },
      include: { items: true },
    });

    return { success: true, receipt: newReceipt };
  } catch (error) {
    console.error('Klaida kuriant čekį:', error);
    return { success: false, error: 'Nepavyko išsaugoti čekio duomenų bazėje.' };
  }
}