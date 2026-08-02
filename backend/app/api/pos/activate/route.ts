import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activationCode } = body;

    if (!activationCode) {
      return NextResponse.json(
        { success: false, error: 'Trūksta aktyvavimo kodo (vartotojo ID)' },
        { status: 400 }
      );
    }

    const cleanCode = String(activationCode).trim();

    // 1. Ieškome vartotojo pagal jo ID ir patikriname, ar jis aktyvus
    const user = await prisma.user.findFirst({
      where: {
        id: cleanCode,
        isActive: true,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Vartotojas nerastas arba yra pasyvus' },
        { status: 404 }
      );
    }

    // 2. Patikriname, ar vartotojo įmonė yra aktyvi
    if (!user.company || !user.company.isActive) {
      return NextResponse.json(
        { success: false, error: 'Paskyrai priklausanti įmonė yra neaktyvi' },
        { status: 403 }
      );
    }

    // 3. Sugeneruojame žetoną (su užkoduotais userId ir companyId)
    const deviceToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        companyId: user.companyId,
        createdAt: Date.now(),
      })
    ).toString('base64');

    // 4. Grąžiname atsakymą mobiliajai kasai
    return NextResponse.json({
      success: true,
      deviceToken,
      employee: {
        id: user.id,
        companyId: user.companyId,
        name: user.name,
        role: user.role,
        companyName: user.company.name,
      },
    });
  } catch (error: any) {
    console.error('Klaida aktyvuojant įrenginį:', error);
    return NextResponse.json(
      { success: false, error: 'Serverio klaida aktyvuojant įrenginį' },
      { status: 500 }
    );
  }
}