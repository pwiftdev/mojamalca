'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function MenuAppPage() {
  return (
    <div className="min-h-screen bg-[#231F20] flex flex-col justify-between">
      <div className="w-full max-w-2xl mx-auto px-4 py-10 flex flex-col items-center">
        <Image src="/mojamalcalogonobg.png" alt="Moja Mal'ca Logo" width={180} height={60} className="mb-6" priority />
        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-400 text-center mb-2 tracking-tight drop-shadow-lg">
          Dobrodošli v sistemu za naročanje malic
        </h1>
        <p className="text-lg text-gray-200 text-center mb-10 max-w-xl">
          Prijavite se kot podjetje ali zaposleni in enostavno upravljajte z naročili malic. Hitro, pregledno in brez skrbi!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          {/* Company Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-2 border-yellow-300">
            <h3 className="text-xl font-bold text-yellow-500 mb-2">Prijava podjetja</h3>
            <p className="text-gray-700 text-center mb-4">Dostop do nadzorne plošče podjetja za upravljanje zaposlenih in pregled naročil.</p>
            <Link
              href="/sistem/podjetje/login"
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#231F20] font-bold rounded-full shadow transition text-lg mt-2"
            >
              Prijava podjetja
            </Link>
          </div>
          {/* Employee Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-2 border-orange-300">
            <h3 className="text-xl font-bold text-orange-500 mb-2">Prijava zaposlenega</h3>
            <p className="text-gray-700 text-center mb-4">Dostop do vašega računa za pregled in izbiro menijev za malico.</p>
            <Link
              href="/sistem/zaposleni/login"
              className="px-6 py-2 bg-orange-400 hover:bg-orange-500 text-[#231F20] font-bold rounded-full shadow transition text-lg mt-2"
            >
              Prijava zaposlenega
            </Link>
          </div>
        </div>
      </div>
      {/* Contact/Help Section */}
      <footer className="w-full bg-[#231F20] text-gray-300 py-8 border-t border-gray-800 mt-12">
        <div className="max-w-2xl mx-auto px-4 flex flex-col md:flex-row md:justify-between items-center gap-4 text-center">
          <div>
            <div className="font-semibold text-white">Ručigajeva cesta 5, 4000 Kranj</div>
            <div className="mt-1">prodaja@mojamalca.si</div>
            <div className="mt-1">069 846 626 &nbsp;|&nbsp; 070 451 777</div>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-400">
            © 2025 mojamalca.si — Klik. Dostava. Mal&apos;ca.
          </div>
        </div>
      </footer>
    </div>
  )
} 