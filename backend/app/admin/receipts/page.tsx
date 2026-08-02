import { prisma } from '@/lib/prisma'; // <--- Naudokite šį importą, o ne PrismaClient tiesiogiai!
import Link from 'next/link';

export default async function AdminReceiptsPage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const companyId = resolvedSearchParams.companyId || 'DEMO_COMPANY_ID';

  const receipts = await prisma.receipt.findMany({
    where: { companyId },
    orderBy: { receiptNumber: 'desc' },
    take: 50,
    include: { items: true },
  });

  return (
    <div>
      <h1>Kvitų istorija ir VMI fiskalizacija</h1>
      
      <div style={{ margin: '20px 0' }}>
        <form action="/api/receipts/retry" method="POST">
          <input type="hidden" name="companyId" value={companyId} />
          <button type="submit" style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Paleisti pakartotinį nesėkmingų kvitų siuntimą (Retry)
          </button>
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Nr.</th>
              <th style={{ padding: '12px' }}>Suma</th>
              <th style={{ padding: '12px' }}>Prekės</th>
              <th style={{ padding: '12px' }}>Būsena</th>
              <th style={{ padding: '12px' }}>VMI UUID</th>
              <th style={{ padding: '12px' }}>Hešas</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>#{r.receiptNumber}</td>
                <td style={{ padding: '12px' }}>{r.totalAmount.toFixed(2)} €</td>
                <td style={{ padding: '12px' }}>{r.items.length} vnt.</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ color: r.status === 'COMPLETED' ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>{r.vmiUuid || '-'}</td>
                <td style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace' }}>{r.currentHash?.substring(0, 16)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}