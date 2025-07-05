import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sistem za naročanje malic | MojaMal\'ca',
  description: 'Prijavite se kot podjetje ali zaposleni in enostavno upravljajte z naročili malic. Hitro, pregledno in brez skrbi!',
  keywords: [
    'sistem naročanje malic',
    'prijava podjetje malica',
    'prijava zaposleni malica',
    'upravljanje naročil malic',
    'portal malic podjetja',
    'naročanje malic online'
  ],
  openGraph: {
    title: 'Sistem za naročanje malic | MojaMal\'ca',
    description: 'Prijavite se kot podjetje ali zaposleni in enostavno upravljajte z naročili malic. Hitro, pregledno in brez skrbi!',
    url: 'https://mojamalca.si/sistem',
    siteName: 'MojaMal\'ca',
    images: [
      {
        url: '/mojamalcalogonobg.png',
        width: 1200,
        height: 630,
        alt: 'MojaMal\'ca - Sistem za naročanje malic',
      },
    ],
    locale: 'sl_SI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistem za naročanje malic | MojaMal\'ca',
    description: 'Prijavite se kot podjetje ali zaposleni in enostavno upravljajte z naročili malic.',
    images: ['/mojamalcalogonobg.png'],
  },
  alternates: {
    canonical: '/sistem',
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