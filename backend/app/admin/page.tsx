import { prisma } from '@/lib/prisma'; // <--- Naudokite šį importą, o ne PrismaClient tiesiogiai!
import Link from 'next/link';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const companyId = resolvedSearchParams.companyId || 'DEMO_COMPANY_ID';

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      _count: {
        select: { receipts: true, products: true, users: true },
      },
    },
  });

  const failedReceiptsCount = await prisma.receipt.count({
    where: { companyId, status: 'FISCALIZATION_FAILED' },
  });

  const recentReceipts = await prisma.receipt.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: true },
  });

  return (
    <div>
      <h1>Įmonės apžvalga</h1>
      <p>Įmonė: <strong>{company?.name || 'Nepasirinkta'}</strong> (Kodas: {company?.companyCode || 'Nenurodytas'})</p>

      {/* Statistikos kortelės */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Išrašyti kvitai</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{company?._count.receipts || 0}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Prekės kataloge</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{company?._count.products || 0}</p>
        </div>
        <div style={{ background: failedReceiptsCount > 0 ? '#fef2f2' : '#f0fdf4', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>VMI Klaidos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: failedReceiptsCount > 0 ? '#dc2626' : '#16a34a' }}>
            {failedReceiptsCount}
          </p>
        </div>
      </div>

      {/* Paskutiniai kvitai */}
      <h2 style={{ marginTop: '40px' }}>Paskutiniai kvitai</h2>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Nr.</th>
              <th style={{ padding: '12px' }}>Suma</th>
              <th style={{ padding: '12px' }}>Mokėjimas</th>
              <th style={{ padding: '12px' }}>VMI Būsena</th>
              <th style={{ padding: '12px' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {recentReceipts.map((receipt) => (
              <tr key={receipt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>#{receipt.receiptNumber}</td>
                <td style={{ padding: '12px' }}>{receipt.totalAmount.toFixed(2)} €</td>
                <td style={{ padding: '12px' }}>{receipt.paymentMethod}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    color: receipt.status === 'COMPLETED' ? '#16a34a' : receipt.status === 'FISCALIZATION_FAILED' ? '#dc2626' : '#d97706',
                    fontWeight: 'bold'
                  }}>
                    {receipt.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{new Date(receipt.createdAt).toLocaleString('lt-LT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}