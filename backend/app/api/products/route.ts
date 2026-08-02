import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Sukuria naują prekę per Admin pultą
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const { companyId, name, price, barcode, stock, vatRate } = body;

    if (!companyId || !name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Trūksta įmonės ID, pavadinimo arba kainos' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        companyId,
        name: String(name),
        price: parseFloat(price),
        barcode: barcode ? String(barcode) : null,
        stock: stock ? parseFloat(stock) : 0,
        vatRate: vatRate ? parseFloat(vatRate) : 21.0,
      },
    });

    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(
        new URL(`/admin/products?companyId=${companyId}`, request.url),
        303
      );
    }

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Klaida kuriant prekę:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Grąžina įmonės prekes Admin pultui
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Trūksta companyId' },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Klaida gaunant prekes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}