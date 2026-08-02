// app/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import LandingPage from '@/app/components/LandingPage';

export default async function Page() {
  const session = await getServerSession();

  // Jei vartotojas jau prisijungęs, nukreipiame jį tiesiai į kasą/dashboard
  if (session) {
    redirect('/dashboard'); // Arba galite palikti tiesioginį vaizdą
  }

  // Jei neprisijungęs - rodomas profesionalus prezentacinis puslapis
  return <LandingPage />;
}