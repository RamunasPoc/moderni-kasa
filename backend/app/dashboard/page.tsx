// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getProducts } from '@/app/actions/productActions';
import { getReceipts } from '@/app/actions/receiptActions';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  // Gauname duomenis iš duomenų bazės tiesiai serverio pusėje
  const products = await getProducts();
  const receipts = await getReceipts();

  // Apskaičiuojame pagrindinius rodiklius (metrikas)
  const totalRevenue = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const receiptsCount = receipts.length;
  const productsCount = products.length;

  const user = session.user as any;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 selection:bg-indigo-500 selection:text-white">
      {/* Viršutinė navigacijos juosta */}
      <header className="max-w-7xl mx-auto w-full bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl px-6 py-4 mb-8 flex justify-between items-center border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl font-extrabold shadow-lg shadow-indigo-600/30 text-sm tracking-wider">
            i.EKA
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Direktoriaus Valdymo Skydas</h1>
            <p className="text-xs text-slate-400">Prisijungęs: {user?.name || user?.email} • Įmonė: {user?.companyId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            Atidaryti Kasos Terminalą
          </Link>
          <Link 
            href="/api/auth/signout" 
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            Atsijungti
          </Link>
        </div>
      </header>

      {/* Pagrindinis turinys */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Metrikų kortelės */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Bendra apyvarta</p>
            <p className="text-3xl font-black text-indigo-400">€{totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-2">Iš viso išmuštų čekių sumos</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Išmušti čekiai</p>
            <p className="text-3xl font-black text-emerald-400">{receiptsCount} vnt.</p>
            <p className="text-xs text-slate-500 mt-2">Sėkmingai perduoti į VMI i.EKA</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Prekių katalogas</p>
            <p className="text-3xl font-black text-purple-400">{productsCount} prekės</p>
            <p className="text-xs text-slate-500 mt-2">Aktyvios prekės sistemoje</p>
          </div>
        </div>

        {/* Lentelelės: Naujausi čekiai ir Prekių sąrašas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Naujausi čekiai */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center justify-between">
              <span>Naujausi čekiai</span>
              <span className="text-xs text-slate-400 font-normal">Paskutiniai pardavimai</span>
            </h2>

            {receipts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Čekių dar nėra. Atlikite pirmą pardavimą kasoje.</p>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[350px] overflow-y-auto pr-1">
                {receipts.slice(0, 10).map((receipt) => (
                  <div key={receipt.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-slate-200">Čekis #{receipt.receiptNumber}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(receipt.createdAt).toLocaleString('lt-LT')} • {receipt.items.length} prekės
                      </p>
                    </div>
                    <span className="font-bold text-indigo-400">€{receipt.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prekių sąrašas */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center justify-between">
              <span>Prekių likučiai</span>
              <span className="text-xs text-slate-400 font-normal">Katalogas</span>
            </h2>

            {products.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Prekių katalogas tuščjas.</p>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[350px] overflow-y-auto pr-1">
                {products.map((product) => (
                  <div key={product.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-slate-200">{product.name}</p>
                      <p className="text-xs text-slate-500">Likutis: {product.stock} vnt.</p>
                    </div>
                    <span className="font-bold text-emerald-400">€{product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}