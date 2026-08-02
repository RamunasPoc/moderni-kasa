'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerCompanyAndDirector } from '@/app/actions/authActions'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await registerCompanyAndDirector(formData)

      if (!result.success) {
        setError(result.error || 'Registracijos klaida')
      } else {
        setSuccess(result.message || 'Registracija sėkminga!')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('Įvyko netikėta klaida.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      
      {/* Subtilus švytėjimo fonas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-lg w-full relative z-10 space-y-8 bg-slate-900/40 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl shadow-violet-950/40">
        
        {/* Header / Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-xl font-black text-xs tracking-wider shadow-md shadow-violet-600/30 group-hover:scale-105 transition">
              i.EKA
            </div>
            <span className="font-extrabold text-sm text-slate-200 tracking-tight">Moderni Kasa</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sukurkite įmonės paskyrą
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Jau turite paskyrą?{' '}
            <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition">
              Prisijunkite čia
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-sm text-rose-400 flex items-center gap-3">
            <span className="text-lg shrink-0">⚠️</span> 
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-sm text-emerald-400 flex items-center gap-3">
            <span className="text-lg shrink-0">✅</span> 
            <span>{success} Nukreipiama į prisijungimą...</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} method="POST">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Įmonės pavadinimas</label>
              <input
                name="companyName"
                type="text"
                required
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm transition"
                placeholder="UAB „Verslas“"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Įmonės kodas</label>
                <input
                  name="companyCode"
                  type="text"
                  required
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm transition"
                  placeholder="123456789"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Admin. vardas</label>
                <input
                  name="adminName"
                  type="text"
                  required
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm transition"
                  placeholder="Vardenis"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Administratoriaus el. paštas</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm transition"
                placeholder="admin@imone.lt"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Slaptažodis</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-violet-600/30 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-sm tracking-wide"
            >
              {loading ? 'Registruojama...' : 'Registruoti įmonę (5 €/mėn.)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}