import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Naročanje malic | Izbira menijev | MojaMal\'ca',
  description: 'Naročite svojo malico iz tedenskega menija. Pregled dostopnih obrokov, prehranske preference in enostavno naročanje.',
  keywords: [
    'naročanje malic zaposleni',
    'izbira menijev malica',
    'tedenski meni malica',
    'prehranske preference malica',
    'naročanje obrokov online',
    'mojamalca naročanje'
  ],
  openGraph: {
    title: 'Naročanje malic | Izbira menijev | MojaMal\'ca',
    description: 'Naročite svojo malico iz tedenskega menija. Pregled dostopnih obrokov, prehranske preference in enostavno naročanje.',
    url: 'https://mojamalca.si/sistem/zaposleni/narocanje',
    siteName: 'MojaMal\'ca',
    images: [
      {
        url: '/mojamalcalogonobg.png',
        width: 1200,
        height: 630,
        alt: 'MojaMal\'ca - Naročanje malic',
      },
    ],
    locale: 'sl_SI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naročanje malic | Izbira menijev | MojaMal\'ca',
    description: 'Naročite svojo malico iz tedenskega menija.',
    images: ['/mojamalcalogonobg.png'],
  },
  alternates: {
    canonical: '/sistem/zaposleni/narocanje',
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

export default function EmployeeOrderingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 