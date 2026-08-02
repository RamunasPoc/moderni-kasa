import { prisma } from '@/lib/prisma'; // <--- Naudokite šį importą, o ne PrismaClient tiesiogiai!
import Link from 'next/link';

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const companyId = resolvedSearchParams.companyId || 'DEMO_COMPANY_ID';

  const products = await prisma.product.findMany({
    where: { companyId },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1>Prekių katalogas</h1>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Pridėti naują prekę</h3>
        <form action="/api/products" method="POST" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
          <input type="hidden" name="companyId" value={companyId} />
          <input type="text" name="name" placeholder="Prekės pavadinimas" required style={{ padding: '10px', flex: 2, border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          <input type="number" step="0.01" name="price" placeholder="Kaina (€)" required style={{ padding: '10px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          <input type="text" name="barcode" placeholder="Barkodas (nebūtina)" style={{ padding: '10px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Pridėti prekę
          </button>
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Pavadinimas</th>
              <th style={{ padding: '12px' }}>Kaina</th>
              <th style={{ padding: '12px' }}>PVM</th>
              <th style={{ padding: '12px' }}>Barkodas</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>{p.name}</td>
                <td style={{ padding: '12px' }}>{p.price.toFixed(2)} €</td>
                <td style={{ padding: '12px' }}>{p.vatRate}%</td>
                <td style={{ padding: '12px' }}>{p.barcode || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}