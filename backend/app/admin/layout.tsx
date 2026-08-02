import Link from 'next/link';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Šoninis meniu */}
      <aside style={{ width: '260px', background: '#1e293b', color: '#fff', padding: '20px' }}>
        <h2>Kasos Admin</h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '30px' }}>i.EKA VMI Valdymas</p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link href="/admin" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
            📊 Apžvalga
          </Link>
          <Link href="/admin/receipts" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
            🧾 Kvitai ir VMI
          </Link>
          <Link href="/admin/products" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
            📦 Prekių katalogas
          </Link>
          <Link href="/admin/users" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
            👥 Darbuotojai / Kasininkai
            </Link>
        </nav>
      </aside>

      {/* Pagrindinis puslapio turinys */}
      <main style={{ flex: 1, background: '#f8fafc', padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}