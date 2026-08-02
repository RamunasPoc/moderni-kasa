'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function registerCompanyAndDirector(formData: FormData) {
  const companyName = formData.get('companyName') as string
  const companyCode = formData.get('companyCode') as string
  const adminName = formData.get('adminName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Patikriname, ar visi laukai užpildyti
  if (!companyName || !companyCode || !adminName || !email || !password) {
    return { success: false, error: 'Prašome užpildyti visus privalomus laukus.' }
  }

  try {
    // 1. Patikriname, ar vartotojas su tokiu el. paštu jau egzistuoja
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: 'Vartotojas su šiuo el. paštu jau egzistuoja.' }
    }

    // 2. Užšifruojame slaptažodį
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Prisma transakcija
    const result = await prisma.$transaction(async (tx) => {
      // Sukuriamas įmonės įrašas (naudojant companyCode)
      const company = await tx.company.create({
        data: {
          name: companyName,
          companyCode: companyCode,
        },
      })

      // Sukuriamas administratorius (role: ADMIN, su nurodytu vardo lauku)
      const user = await tx.user.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      })

      return { company, user }
    })

    return { 
      success: true, 
      message: 'Registracija sėkminga! Galite prisijungti.' 
    }

  } catch (error) {
    console.error('Klaida registruojant įmonę:', error)
    return { success: false, error: 'Registracijos metu įvyko serverio klaida.' }
  }
}