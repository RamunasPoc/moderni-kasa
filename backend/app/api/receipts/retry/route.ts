
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <-- Naudokite centralizuotą prisma!
import { IekaClient } from '@/lib/iekaClient';

export async function POST(request: Request) {
  try {
    // Apsaugokime šį endpoint'ą paprastu raktu (Cron Secret), kad bet kas jo negalėtų paleisti
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Nepakanka teisių' }, { status: 401 });
    }

    // Randame visus kvitus, kurių nepavyko išsiųsti
    const failedReceipts = await prisma.receipt.findMany({
      where: {
        status: 'FISCALIZATION_FAILED',
      },
      include: {
        company: true,
      },
      take: 20, // Apdorojame po 20 kvitų vienu ypu, kad neperkrautume serverio
      orderBy: {
        createdAt: 'asc', // Siunčiame senesnius kvitus pirmiausiai, kad išlaikytume chronologiją
      },
    });

    let successCount = 0;
    let failCount = 0;

    for (const receipt of failedReceipts) {
      if (!receipt.company.privateKey) {
        failCount++;
        continue;
      }

      const ieka = new IekaClient({
        cert: receipt.company.ukan || '',
        key: receipt.company.privateKey,
        isTestEnvironment: true,
      });

      const vmiResponse = await ieka.sendReceipt({
        companyCode: receipt.company.companyCode || '',
        receiptNumber: receipt.receiptNumber,
        totalAmount: receipt.totalAmount,
        previousHash: receipt.previousHash || '',
        currentHash: receipt.currentHash || '',
      });

      if (vmiResponse.success) {
        await prisma.receipt.update({
          where: { id: receipt.id },
          data: {
            status: 'COMPLETED',
            vmiUuid: vmiResponse.data?.uuid || null,
          },
        });
        successCount++;
      } else {
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: failedReceipts.length,
      succeeded: successCount,
      failed: failCount,
    });
  } catch (error: any) {
    console.error('Klaida pakartotiniame kvitų siuntime:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}