import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prijava zaposlenega | Sistem za naročanje malic | MojaMal\'ca',
  description: 'Prijavite se v sistem za naročanje malic kot zaposleni. Pregled in izbira menijev za malico, enostavno upravljanje naročil.',
  keywords: [
    'prijava zaposleni malica',
    'portal zaposleni malica',
    'naročanje malic zaposleni',
    'izbira menijev malica',
    'sistem malic zaposleni',
    'prijava mojamalca zaposleni'
  ],
  openGraph: {
    title: 'Prijava zaposlenega | Sistem za naročanje malic | MojaMal\'ca',
    description: 'Prijavite se v sistem za naročanje malic kot zaposleni. Pregled in izbira menijev za malico, enostavno upravljanje naročil.',
    url: 'https://mojamalca.si/sistem/zaposleni/login',
    siteName: 'MojaMal\'ca',
    images: [
      {
        url: '/mojamalcalogonobg.png',
        width: 1200,
        height: 630,
        alt: 'MojaMal\'ca - Prijava zaposlenega',
      },
    ],
    locale: 'sl_SI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prijava zaposlenega | Sistem za naročanje malic | MojaMal\'ca',
    description: 'Prijavite se v sistem za naročanje malic kot zaposleni.',
    images: ['/mojamalcalogonobg.png'],
  },
  alternates: {
    canonical: '/sistem/zaposleni/login',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function EmployeeLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 