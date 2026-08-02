import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { IekaClient } from '@/lib/iekaClient';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, userId, items, paymentMethod } = body;

    if (!companyId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Trūksta privalomų duomenų (companyId arba prekių)' },
        { status: 400 }
      );
    }

    // Apskaičiuojame bendrą čekio sumą
    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    // Naudojame Prisma tranzakciją, kad užtikrintume eiliškumą ir išvengtume konfliktų
   const result = await prisma.$transaction(async (tx: any) => {
      // 1. Randame paskutinį įmonės kvitą, kad gautume jo currentHash ir numerį
      const lastReceipt = await tx.receipt.findFirst({
        where: { companyId },
        orderBy: { receiptNumber: 'desc' },
      });

      const receiptNumber = lastReceipt ? lastReceipt.receiptNumber + 1 : 1;
      
      // Jei tai pirmas įmonės kvitas, naudojamas nulinis/genetinis hešas, kitu atveju – ankstesnio kvito hešas[cite: 1]
      const previousHash = lastReceipt?.currentHash || '0000000000000000000000000000000000000000000000000000000000000000';

      // 2. Sukuriamos eilutės duomenys hešo generavimui pagal VMI reikalavimus[cite: 1]
      const timestamp = new Date().toISOString();
      const rawDataToHash = `${companyId}:${receiptNumber}:${totalAmount.toFixed(2)}:${previousHash}:${timestamp}`;
      
      const currentHash = crypto
        .createHash('sha256')
        .update(rawDataToHash)
        .digest('hex');

      // 3. Sukuriamas kvitas ir jo prekės duomenų bazėje
      const newReceipt = await tx.receipt.create({
        data: {
          receiptNumber,
          totalAmount,
          paymentMethod: paymentMethod || 'CARD',
          status: 'PENDING_FISCALIZATION',
          previousHash,
          currentHash,
          companyId,
          userId,
          createdAt: new Date(timestamp),
          items: {
            create: items.map((item: { name: string; quantity: number; price: number; vatRate?: number; productId?: string }) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              vatRate: item.vatRate ?? 21.0,
              productId: item.productId,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return newReceipt;
    });

    // 4. i.EKA integracija per virtualios fiskalizacijos EKA004 / EKA001 paslaugas[cite: 1]
    const company = await prisma.company.findUnique({ where: { id: companyId } });

    if (company && company.privateKey) {
      const ieka = new IekaClient({
        cert: company.ukan || '',
        key: company.privateKey,
        isTestEnvironment: true, // Gamybinėje aplinkoje pakeiskite į false
      });

      const vmiResponse = await ieka.sendReceipt({
        companyCode: company.companyCode || '',
        receiptNumber: result.receiptNumber,
        totalAmount: result.totalAmount,
        previousHash: result.previousHash || '',
        currentHash: result.currentHash || '',
      });

      if (vmiResponse.success) {
        // Atnaujiname kvito būseną duomenų bazėje kaip sėkmingai fiskalizuotą
        await prisma.receipt.update({
          where: { id: result.id },
          data: { 
            status: 'COMPLETED',
            vmiUuid: vmiResponse.data?.uuid || null 
          },
        });
      } else {
        // Pažymime, kad siuntimas nepavyko (galima sukurti pakartotinio siuntimo eilę)
        await prisma.receipt.update({
          where: { id: result.id },
          data: { status: 'FISCALIZATION_FAILED' },
        });
      }
    }

    return NextResponse.json({ success: true, receipt: result }, { status: 201 });
  } catch (error: any) {
    console.error('Klaida apdorojant kvitą:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}