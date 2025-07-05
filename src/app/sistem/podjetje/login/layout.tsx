import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prijava podjetja | Sistem za naročanje malic | MojaMal\'ca',
  description: 'Prijavite se v sistem za upravljanje malic vašega podjetja. Dostop do nadzorne plošče za upravljanje zaposlenih in pregled naročil.',
  keywords: [
    'prijava podjetje malica',
    'portal podjetja malica',
    'upravljanje zaposlenih malica',
    'nadzorna plošča podjetja',
    'sistem malic podjetje',
    'prijava mojamalca podjetje'
  ],
  openGraph: {
    title: 'Prijava podjetja | Sistem za naročanje malic | MojaMal\'ca',
    description: 'Prijavite se v sistem za upravljanje malic vašega podjetja. Dostop do nadzorne plošče za upravljanje zaposlenih in pregled naročil.',
    url: 'https://mojamalca.si/sistem/podjetje/login',
    siteName: 'MojaMal\'ca',
    images: [
      {
        url: '/mojamalcalogonobg.png',
        width: 1200,
        height: 630,
        alt: 'MojaMal\'ca - Prijava podjetja',
      },
    ],
    locale: 'sl_SI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prijava podjetja | Sistem za naročanje malic | MojaMal\'ca',
    description: 'Prijavite se v sistem za upravljanje malic vašega podjetja.',
    images: ['/mojamalcalogonobg.png'],
  },
  alternates: {
    canonical: '/sistem/podjetje/login',
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

export default function CompanyLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 