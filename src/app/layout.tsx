import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "MojaMal'ca - Zdrava in sveža malica za podjetja | Gorenjska Regija",
    template: "%s | MojaMal'ca"
  },
  description: "Dostavljamo okusne in uravnotežene malice za podjetja v Gorenjski regiji. Preprosto naročanje, hitra dostava, okusna malica.",
  keywords: [
    "dostava malic gorenjska",
    "dostava malic ljubljana", 
    "dostava malic kranj",
    "zdrava kosila za podjetja",
    "malice za podjetja",
    "catering malice",
    "malice podjetja",
    "dostava malic"
  ],
  authors: [{ name: "MojaMal'ca" }],
  creator: "MojaMal'ca",
  publisher: "MojaMal'ca",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mojamalca.si'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'sl_SI',
    url: 'https://mojamalca.si',
    title: 'MojaMal\'ca - Zdrava in sveža malica za podjetja | Gorenjska Regija',
    description: 'Dostavljamo okusne in uravnotežene malice za podjetja v Gorenjski regiji. Preprosto naročanje, hitra dostava, okusna malica.',
    siteName: 'MojaMal\'ca',
    images: [
      {
        url: '/mojamalcalogonobg.png',
        width: 1200,
        height: 630,
        alt: 'MojaMal\'ca - Zdrava in sveža malica za podjetja',
        type: 'image/png',
      },
      {
        url: '/photo1.jpg',
        width: 1200,
        height: 800,
        alt: 'Sveže in okusne malice za podjetja',
        type: 'image/jpeg',
      },
      {
        url: '/photo2.jpg',
        width: 1200,
        height: 800,
        alt: 'Zdrave malice dostavljene v podjetje',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MojaMal\'ca - Zdrava in sveža malica za podjetja | Gorenjska Regija',
    description: 'Dostavljamo okusne in uravnotežene malice za podjetja v Gorenjski regiji. Preprosto naročanje, hitra dostava, okusna malica.',
    images: [
      {
        url: '/mojamalcalogonobg.png',
        alt: 'MojaMal\'ca - Zdrava in sveža malica za podjetja',
        width: 1200,
        height: 630,
      },
      {
        url: '/photo1.jpg',
        alt: 'Sveže in okusne malice za podjetja',
        width: 1200,
        height: 800,
      },
    ],
    creator: '@mojamalca',
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
  verification: {
    // google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sl">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/favicon-32x32.png" />
        <meta name="image" content="https://mojamalca.si/mojamalcalogonobg.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        {/* Structured Data for Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodService",
              "name": "MojaMal'ca",
              "description": "Dostavljamo okusne in uravnotežene malice za podjetja v Gorenjski regiji. Preprosto naročanje, hitra dostava, okusna malica.",
              "url": "https://mojamalca.si",
              "logo": "https://mojamalca.si/mojamalcalogonobg.png",
              "image": "https://mojamalca.si/mojamalcalogonobg.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ručigajeva cesta 5",
                "addressLocality": "Kranj",
                "postalCode": "4000",
                "addressCountry": "SI"
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+38670451777",
                  "contactType": "customer service",
                  "areaServed": "SI",
                  "availableLanguage": "Slovenian"
                },
                {
                  "@type": "ContactPoint", 
                  "telephone": "+38669846626",
                  "contactType": "customer service",
                  "areaServed": "SI",
                  "availableLanguage": "Slovenian"
                }
              ],
              "email": "prodaja@mojamalca.si",
              "areaServed": [
                {
                  "@type": "Place",
                  "name": "Gorenjska regija"
                },
                {
                  "@type": "Place", 
                  "name": "Ljubljana"
                }
              ],
              "servesCuisine": ["Slovenian", "Mediterranean", "Healthy"],
              "priceRange": "€€",
              "openingHours": "Mo-Fr 08:00-17:00",
              "sameAs": [
                "https://www.facebook.com/mojamalca",
                "https://www.instagram.com/mojamalca"
              ]
            })
          }}
        />
        
        {/* FAQ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Kdaj in kam dostavljate malice?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Malice za podjetja dostavljamo na območju Gorenjske regije, ob času, ki ga natančno določimo skupaj s podjetjem."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Ali ponujate prilagojene obroke za posebne prehranske potrebe (npr. vegetarijanske, brez glutena)?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Tedenski meniji so popolnoma prilagojeni potrebam podjetja in njihovih zaposlenih – tudi za posebne prehranske zahteve, kot so vegetarijanske, brez glutena ipd."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kako poteka naročilo malice za podjetja?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ko je pogodba sklenjena, podjetje prejme dostop do sistema MojaMal'ca, kjer lahko ustvarja račune za svoje zaposlene. Ti nato kar prek telefona enostavno izbirajo jedi iz tedenskega menija."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Ali lahko naročim malico samo za en dan ali je obvezna redna naročnina?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ko je pogodba z podjetjem sklenjena, zaposleni lahko za vsak dan v tednu sami izberejo, ali bodo naročili malico ali ne. Brez obveznosti da malico morajo naročiti vsak dan."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kako so malice pakirane in dostavljene?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Način pakiranja in dostave se dogovori na sestanku z vsakim podjetjem posebej. Možnosti vključujejo posamezne papirnate škatle za vsakega zaposlenega, velike gastro posode za delitev jedi in druge prilagoditve po potrebi."
                  }
                }
              ]
            })
          }}
        />
        
        {/* Local Business Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "MojaMal'ca",
              "description": "Dostavljamo okusne in uravnotežene malice za podjetja v Gorenjski regiji. Preprosto naročanje, hitra dostava, okusna malica.",
              "url": "https://mojamalca.si",
              "logo": "https://mojamalca.si/mojamalcalogonobg.png",
              "image": "https://mojamalca.si/mojamalcalogonobg.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ručigajeva cesta 5",
                "addressLocality": "Kranj",
                "postalCode": "4000",
                "addressCountry": "SI"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 46.2389,
                "longitude": 14.3556
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+38669846626",
                  "contactType": "customer service",
                  "areaServed": "SI",
                  "availableLanguage": "Slovenian"
                },
                {
                  "@type": "ContactPoint", 
                  "telephone": "+38670451777",
                  "contactType": "customer service",
                  "areaServed": "SI",
                  "availableLanguage": "Slovenian"
                }
              ],
              "email": "prodaja@mojamalca.si",
              "openingHours": "Mo-Fr 08:00-17:00",
              "priceRange": "€€",
              "servesCuisine": ["Slovenian", "Mediterranean", "Healthy"],
              "areaServed": [
                {
                  "@type": "Place",
                  "name": "Gorenjska regija"
                },
                {
                  "@type": "Place", 
                  "name": "Ljubljana"
                }
              ],
              "sameAs": [
                "https://www.facebook.com/mojamalca",
                "https://www.instagram.com/mojamalca"
              ]
            })
          }}
        />
        
        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Domov",
                  "item": "https://mojamalca.si"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Sistem za naročanje",
                  "item": "https://mojamalca.si/sistem"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Prijava podjetja",
                  "item": "https://mojamalca.si/sistem/podjetje/login"
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "Prijava zaposlenega",
                  "item": "https://mojamalca.si/sistem/zaposleni/login"
                }
              ]
            })
          }}
        />
        
        {/* Blog Posts Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "MojaMal'ca Blog",
              "description": "Novice, nasveti in informacije o zdravih malicah za podjetja",
              "url": "https://mojamalca.si",
              "publisher": {
                "@type": "Organization",
                "name": "MojaMal'ca",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://mojamalca.si/mojamalcalogonobg.png"
                }
              },
              "blogPost": [
                {
                  "@type": "BlogPosting",
                  "headline": "Zakaj izbrati zdrave malice v podjetju?",
                  "description": "Odkrijte prednosti zdravih malic za vaše zaposlene in kako izboljšajo produktivnost in zadovoljstvo.",
                  "author": {
                    "@type": "Organization",
                    "name": "MojaMal'ca"
                  },
                  "datePublished": "2024-01-15",
                  "dateModified": "2024-01-15",
                  "publisher": {
                    "@type": "Organization",
                    "name": "MojaMal'ca"
                  },
                  "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": "https://mojamalca.si"
                  }
                },
                {
                  "@type": "BlogPosting",
                  "headline": "Organizirane malice v podjetju: Rešitev za podjetja v Gorenjski regiji",
                  "description": "Preverite našo najnovejšo ponudbo svežih in okusnih obrokov za podjetja v Gorenjski regiji.",
                  "author": {
                    "@type": "Organization",
                    "name": "MojaMal'ca"
                  },
                  "datePublished": "2024-01-20",
                  "dateModified": "2024-01-20",
                  "publisher": {
                    "@type": "Organization",
                    "name": "MojaMal'ca"
                  },
                  "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": "https://mojamalca.si"
                  }
                },
                {
                  "@type": "BlogPosting",
                  "headline": "Kako načrtujemo tedenski meni za podjetja",
                  "description": "Spoznajte naš proces načrtovanja uravnoteženih menijev za podjetja in kako prilagajamo ponudbo potrebam zaposlenih.",
                  "author": {
                    "@type": "Organization",
                    "name": "MojaMal'ca"
                  },
                  "datePublished": "2024-01-25",
                  "dateModified": "2024-01-25",
                  "publisher": {
                    "@type": "Organization",
                    "name": "MojaMal'ca"
                  },
                  "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": "https://mojamalca.si"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="bg-[#231F20] text-white min-h-screen m-0 p-0">{children}</body>
    </html>
  );
}
