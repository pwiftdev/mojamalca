import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nadzorna plošča podjetja | Upravljanje malic | MojaMal\'ca',
  description: 'Nadzorna plošča za upravljanje malic vašega podjetja. Pregled naročil, upravljanje zaposlenih, tedenski meniji in statistika.',
  keywords: [
    'nadzorna plošča podjetja malica',
    'upravljanje zaposlenih malica',
    'pregled naročil malic',
    'tedenski meniji podjetje',
    'statistika malic podjetje',
    'admin portal mojamalca'
  ],
  openGraph: {
    title: 'Nadzorna plošča podjetja | Upravljanje malic | MojaMal\'ca',
    description: 'Nadzorna plošča za upravljanje malic vašega podjetja. Pregled naročil, upravljanje zaposlenih, tedenski meniji in statistika.',
    url: 'https://mojamalca.si/sistem/podjetje/admin',
    siteName: 'MojaMal\'ca',
    images: [
      {
        url: '/mojamalcalogonobg.png',
        width: 1200,
        height: 630,
        alt: 'MojaMal\'ca - Nadzorna plošča podjetja',
      },
    ],
    locale: 'sl_SI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nadzorna plošča podjetja | Upravljanje malic | MojaMal\'ca',
    description: 'Nadzorna plošča za upravljanje malic vašega podjetja.',
    images: ['/mojamalcalogonobg.png'],
  },
  alternates: {
    canonical: '/sistem/podjetje/admin',
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

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 