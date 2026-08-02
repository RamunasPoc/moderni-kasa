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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sukurkite savo įmonės paskyrą
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Arba{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              prisijunkite prie esamos paskyros
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">
            {success} Nukreipiama į prisijungimą...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Įmonės pavadinimas</label>
              <input
                name="companyName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="UAB „Verslas“"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Įmonės kodas</label>
              <input
                name="companyCode"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Administratoriaus vardas</label>
              <input
                name="adminName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Vardenis Pavardenis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Administratoriaus el. paštas</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="admin@imone.lt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slaptažodis</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registruojama...' : 'Registruoti įmonę'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}