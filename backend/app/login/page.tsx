'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Sėkmingai prisijungus - nukreipiame į direktoriaus panelę
        router.push('/dashboard');
        router.refresh(); // Užtikriname, kad serverio komponentai atsinaujintų su nauja sesija
      }
    } catch (err) {
      setError('Įvyko nenumatyta klaida. Bandykite dar kartą.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-white font-extrabold text-xl">POS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Prisijungimas</h1>
          <p className="text-sm text-slate-500 mt-2">Valdykite savo įmonės kasą ir darbuotojus</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg border border-rose-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">El. paštas</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="admin@imone.lt"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">Slaptažodis</label>
              <a href="#" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">Pamiršote?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Prisijungti'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Neturite paskyros? <a href="#" className="text-indigo-600 font-semibold hover:underline">Registruokitės</a>
        </div>
      </div>
    </main>
  );
}