import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const barcode = searchParams.get('barcode');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Trūksta privalomo companyId parametro' },
        { status: 400 }
      );
    }

    // Filtravimo sąlyga
    const whereCondition: any = { companyId };
    if (barcode) {
      whereCondition.barcode = barcode;
    }

    // Traukiame produktus pagal Prisma tavo struktūrą
    const products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        barcode: true,
        price: true,
        stock: true,
        vatRate: true,
        companyId: true,
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error('Klaida gaunant produktus:', error);
    return NextResponse.json(
      { success: false, error: 'Nepavyko užkrauti prekių katalogo iš duomenų bazės' },
      { status: 500 }
    );
  }
}