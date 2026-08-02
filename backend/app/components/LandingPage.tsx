import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between selection:bg-violet-500 selection:text-white relative overflow-hidden">
      
      {/* Subtilus švytėjimo fonas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* Viršutinė navigacija */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3.5 py-2 rounded-2xl font-black shadow-lg shadow-violet-600/25 text-sm tracking-wider">
            i.EKA
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">Moderni Kasa</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-slate-300 hover:text-white transition px-3 py-2"
          >
            Prisijungti
          </Link>
          <Link 
            href="/register" 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-600/25 transition duration-300 transform hover:-translate-y-0.5"
          >
            Sukurti paskyrą (5 €/mėn.)
          </Link>
        </div>
      </header>

      {/* Pagrindinis herojus (Hero section) */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Jokių kasos aparatų nuomos – tik 5 € / mėn.
        </div>
        
        <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight max-w-4xl leading-[1.1] mb-6">
          Kam nuomoti senus aparatus? <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">Tavo telefonas – tai kasos aparatas.</span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Pamirškite brangias nuomos sutartis ir techninį galvos skausmą. Atsisiųskite programėlę arba įsidiekite PWA į savo telefono pradžios ekraną ir pradėkite prekiauti iškart.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
          <Link 
            href="/register" 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-extrabold text-base shadow-xl shadow-violet-600/30 transition duration-300 transform hover:-translate-y-0.5 text-center"
          >
            Užsiregistruoti už 5 €/mėn.
          </Link>
          <Link 
            href="/login" 
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-8 py-4 rounded-2xl font-bold text-base transition duration-300 text-center backdrop-blur-md"
          >
            Prisijungti prie sistemos
          </Link>
        </div>

        {/* KAIP TAI VEIKIA? 4 ŽINGSNIAI */}
        <div className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 sm:p-12 rounded-3xl mb-24 text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 text-center">Kaip pradėti naudotis per 2 minutes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 font-black flex items-center justify-center border border-violet-500/30">1</div>
              <h3 className="font-bold text-white">Užsiregistruoji</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Įvedi įmonės duomenis ir susikuri savo administratoriaus paskyrą.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 font-black flex items-center justify-center border border-indigo-500/30">2</div>
              <h3 className="font-bold text-white">Sukuri naudotojus</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Priskiri prisijungimus ar PIN kodus savo kasininkams ar darbuotojams.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 font-black flex items-center justify-center border border-cyan-500/30">3</div>
              <h3 className="font-bold text-white">Parsisiunti PWA / App</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Atidarai naršyklėje ir paspaudi „Pridėti į pagrindinį ekraną“ (Home Screen).</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 font-black flex items-center justify-center border border-emerald-500/30">4</div>
              <h3 className="font-bold text-white">Naudoji ir taupai</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Muši čekius, siunti į VMI i.EKA ir džiaugiesi maža kaina.</p>
            </div>
          </div>
        </div>

        {/* KO REIKIA TELEFONUI / ĮRANGAI? */}
        <div className="w-full text-left mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 text-center">Ką turi turėti jūsų telefonas ar planšetė?</h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-10 text-sm">Jokių specialių kasos terminalų pirkimo – užtenka išmaniojo įrenginio, kurį jau turite kišenėje.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-white/5 p-8 rounded-3xl flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-400 flex items-center justify-center font-bold text-2xl shrink-0 border border-violet-500/20">📡</div>
              <div>
                <h3 className="font-bold text-lg text-white mb-2">NFC palaikymas</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Jei norite priimti bekontakčius atsiskaitymus kortelėmis ar telefonais tiesiai per savo įrenginį, telefone reikalingas NFC modulis.</p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-white/5 p-8 rounded-3xl flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center font-bold text-2xl shrink-0 border border-cyan-500/20">🖨️</div>
              <div>
                <h3 className="font-bold text-lg text-white mb-2">Bluetooth ryšys</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Reikalingas tam, kad programėlė galėtų belaidžiu būdu prisijungti prie nešiojamo termospausdintuvo ir atspausdinti popierinį čekį klientui (jei jo reikia).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Papildomos funkcijos / kortelės */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-400 flex items-center justify-center font-bold text-xl mb-6 border border-violet-500/20">💸</div>
            <h3 className="font-bold text-lg text-white mb-2">Pigiau nebūna – 5 €/mėn.</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Sutaupykite šimtus eurų per metus, kuriuos anksčiau išleisdavote kasos aparatų nuomai ir brangiam aptarnavimui.</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center font-bold text-xl mb-6 border border-emerald-500/20">🛡️</div>
            <h3 className="font-bold text-lg text-white mb-2">VMI i.EKA atitiktis</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Visi čekiai automatiškai pasirašomi kriptografiniu parašu ir perduodami VMI be jokių papildomų tarpininkų.</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center font-bold text-xl mb-6 border border-cyan-500/20">📱</div>
            <h3 className="font-bold text-lg text-white mb-2">PWA technologija</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Jokių sudėtingų siuntimų iš App Store ar Google Play – naršyklėje paspauskite „Pridėti į ekrano pradžią“ ir turėsite programėlę.</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer id="kontaktai" className="bg-slate-950 border-t border-white/5 py-12 px-6 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-white">Moderni Kasa UAB</span>
            </div>
            <p className="text-xs text-slate-500">Skaitmeninė kasa išmaniajam telefonui už 5 €/mėn.</p>
          </div>
          <div className="text-sm text-slate-400 text-center md:text-right">
            <p>Turite klausimų? Susisiekite:</p>
            <p className="font-bold text-violet-400 mt-1">pagalba@modernikasa.lt | +370 600 00000</p>
          </div>
        </div>
      </footer>
    </div>
  );
}