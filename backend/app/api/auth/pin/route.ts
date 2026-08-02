import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { companyCode, pinCode } = await request.json();

    if (!companyCode || !pinCode) {
      return NextResponse.json(
        { success: false, error: 'Nurodykite įmonės kodą ir PIN kodą' },
        { status: 400 }
      );
    }

    // 1. Randame įmonę pagal kodą
    const company = await prisma.company.findFirst({
      where: { companyCode, isActive: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Įmonė nerasta arba neaktyvi' },
        { status: 404 }
      );
    }

    // 2. Randame kasininką pagal PIN kodą šioje įmonėje
    const cashier = await prisma.user.findFirst({
      where: {
        companyId: company.id,
        pinCode: pinCode,
        role: 'CASHIER',
        isActive: true,
      },
    });

    if (!cashier) {
      return NextResponse.json(
        { success: false, error: 'Neteisingas PIN kodas' },
        { status: 401 }
      );
    }

    // Gražiname sėkmingo prisijungimo duomenis
    return NextResponse.json({
      success: true,
      user: {
        id: cashier.id,
        name: cashier.name,
        role: cashier.role,
        companyId: company.id,
        companyName: company.name,
      },
    });
  } catch (error: any) {
    console.error('Prisijungimo klaida:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}