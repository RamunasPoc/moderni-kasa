import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';

export default async function AdminUsersPage() {
  // 1. Gauname prisijungusio vadovo sesiją
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const userSession = session.user as any;
  const companyId = userSession.companyId;

  if (!companyId) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#dc2626' }}>
        <h2>Klaida: Paskyrai nepriskirtas įmonės ID (companyId).</h2>
        <p>Prašome atsijungti ir prisijungti iš naujo.</p>
      </div>
    );
  }

  // 2. Gauname tik šios įmonės darbuotojus
  const users = await prisma.user.findMany({
    where: { companyId },
    orderBy: { name: 'asc' },
  });

  // 3. Sugeneruojame QR kodus
  const usersWithQr = await Promise.all(
    users.map(async (u: any) => {
      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(u.id, { width: 150, margin: 1 });
      } catch (err) {
        console.error('Klaida generuojant QR:', err);
      }
      return { ...u, qrCodeDataUrl };
    })
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Darbuotojų ir kasininkų valdymas</h1>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Čia galite kurti kasininkus. Sukurtas vartotojas turės unikalų aktyvavimo kodą, kurį darbuotojas gali įvesti telefone.
      </p>

      {/* Forma naujam darbuotojui sukurti */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Pridėti naują darbuotoją</h3>
        <form action="/api/users" method="POST" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
          {/* Automatiškai įrašome teisingą prisijungusio vadovo įmonės ID */}
          <input type="hidden" name="companyId" value={companyId} />
          
          <input 
            type="text" 
            name="name" 
            placeholder="Vardas Pavardė" 
            required 
            style={{ padding: '10px', flex: 2, border: '1px solid #cbd5e1', borderRadius: '4px' }} 
          />
          
          <input 
            type="text" 
            name="pinCode" 
            placeholder="4 skaitmenų PIN (pvz. 1234)" 
            maxLength={4} 
            style={{ padding: '10px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px' }} 
          />

          <select name="role" style={{ padding: '10px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px' }}>
            <option value="CASHIER">Kasininkas (PIN)</option>
            <option value="ADMIN">Administratorius (Vadovas)</option>
          </select>

          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sukurti darbuotoją
          </button>
        </form>
      </div>

      {/* Darbuotojų sąrašas */}
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Vardas</th>
              <th style={{ padding: '12px' }}>Rolė</th>
              <th style={{ padding: '12px' }}>PIN kodas</th>
              <th style={{ padding: '12px' }}>Aktyvavimo kodas (ID)</th>
              <th style={{ padding: '12px' }}>QR Kodas</th>
              <th style={{ padding: '12px' }}>Būsena</th>
            </tr>
          </thead>
          <tbody>
            {usersWithQr.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{u.name}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    background: u.role === 'ADMIN' ? '#dbeafe' : '#f3f4f6', 
                    color: u.role === 'ADMIN' ? '#1e40af' : '#374151',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                  {u.pinCode ? `****` : '-'}
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                  {u.id}
                </td>
                <td style={{ padding: '12px' }}>
                  {u.qrCodeDataUrl ? (
                    <img 
                      src={u.qrCodeDataUrl} 
                      alt="QR" 
                      style={{ width: '60px', height: '60px', background: '#fff', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '4px' }} 
                    />
                  ) : (
                    'Generuojama...'
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ color: u.isActive ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    {u.isActive ? 'Aktyvus' : 'Neaktyvus'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}