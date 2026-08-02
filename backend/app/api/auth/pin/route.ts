import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    // 2. Randame visus aktyvius įmonės kasininkus
    const cashiers = await prisma.user.findMany({
      where: {
        companyId: company.id,
        role: 'CASHIER',
        isActive: true,
      },
    });

    // 3. Ieškome, kurio kasininko užkoduotas PIN atitinka įvestą
    let matchedCashier = null;

    for (const cashier of cashiers) {
      if (cashier.pinCode) {
        const isPinValid = await bcrypt.compare(pinCode, cashier.pinCode);
        if (isPinValid) {
          matchedCashier = cashier;
          break;
        }
      }
    }

    // Jei neradome atitikmens
    if (!matchedCashier) {
      return NextResponse.json(
        { success: false, error: 'Neteisingas PIN kodas' },
        { status: 401 }
      );
    }

    // 4. Grąžiname sėkmingo prisijungimo duomenis
    return NextResponse.json({
      success: true,
      user: {
        id: matchedCashier.id,
        name: matchedCashier.name,
        role: matchedCashier.role,
        companyId: company.id,
        companyName: company.name,
      },
    });
  } catch (error: any) {
    console.error('Prisijungimo klaida:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}