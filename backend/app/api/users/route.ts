import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    // Palaikome tiek JSON (iš Expo/API), tiek Form (iš HTML naršyklės)
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const { companyId, name, pinCode, role, email, password } = body;

    if (!companyId || !name) {
      return NextResponse.json(
        { success: false, error: 'Trūksta įmonės ID arba darbuotojo vardo' },
        { status: 400 }
      );
    }

    // Kasininkui privalomas 4 skaitmenų PIN
    if (role === 'CASHIER' && (!pinCode || String(pinCode).length !== 4)) {
      return NextResponse.json(
        { success: false, error: 'Kasininkui privaloma nurodyti 4 skaitmenų PIN kodą' },
        { status: 400 }
      );
    }

    // Sukuriame naują vartotoją duomenų bazėje
    const newUser = await prisma.user.create({
      data: {
        companyId,
        name,
        pinCode: pinCode ? String(pinCode) : null,
        role: role === 'ADMIN' ? Role.ADMIN : Role.CASHIER,
        email: email || null,
        password: password || null,
        isActive: true,
      },
    });

    // Jei užklausa atėjo iš naršyklės HTML formos, nukreipiame atgal į vartotojų sąrašą
    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(new URL(`/admin/users?companyId=${companyId}`, request.url), 303);
    }

    // Sugeneruojame QR kodą lokaliai Node.js aplinkoje (Base64 formatu)
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(newUser.id, { width: 150, margin: 1 });
    } catch (qrErr) {
      console.error('Klaida generuojant QR kodą serveryje:', qrErr);
    }

    // Jei tai API / JSON užklausa, grąžiname vartotoją kartu su aktyvavimo duomenimis ir lokaliu QR kodu
    return NextResponse.json(
      { 
        success: true, 
        user: newUser,
        activationCode: newUser.id,
        qrCodeDataUrl,
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Klaida kuriant darbuotoją:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Serverio klaida kuriant darbuotoją' }, 
      { status: 500 }
    );
  }
}