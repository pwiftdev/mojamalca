'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { db } from "@/app/lib/firebase/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const fullText = "Dostava hrane na vaš dom Kranj. Malice za podjetja.";
  const controls = useAnimation();

  // Add these refs and inView states for the cards
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const card1InView = useInView(card1Ref, { once: false, amount: 0.6 });
  const card2InView = useInView(card2Ref, { once: false, amount: 0.6 });
  const card3InView = useInView(card3Ref, { once: false, amount: 0.6 });

  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  // Blog post data
  const blogPosts = [
    {
      title: "Zakaj izbrati zdrave malice v podjetju?",
      excerpt: "Odkrijte prednosti zdravih malic za vaše zaposlene.",
      icon: <HealthyIcon />,
      content: (
        <div>
          <h2 className="text-2xl font-extrabold text-yellow-300 mb-4">Zakaj izbrati zdrave malice v podjetju?</h2>
          <p className="mb-4">
            V današnjem hitrem tempu življenja postaja kakovostna prehrana na delovnem mestu vse pomembnejša. Zaposleni, ki redno uživajo uravnotežene obroke, so bolj osredotočeni, produktivni in zadovoljni. Zato se vedno več podjetij odloča za organizirane in <b>zdrave malice za podjetja</b>.
          </p>
          <hr className="my-6 border-yellow-400" />
          <h3 className="text-xl font-bold text-yellow-200 mb-2">Malice za podjetja – več kot le obrok</h3>
          <p className="mb-2">Zdrava malica ni le trenutek odmora – je naložba v dobro počutje ekipe. Prednosti, ki jih prinašajo premišljeno pripravljene malice:</p>
          <ul className="list-none space-y-2 mb-4">
            <li className="flex items-center"><CheckIcon /> Več energije in koncentracije čez dan</li>
            <li className="flex items-center"><CheckIcon /> Manj bolniških odsotnosti</li>
            <li className="flex items-center"><CheckIcon /> Večje zadovoljstvo in motivacija zaposlenih</li>
            <li className="flex items-center"><CheckIcon /> Prihranek časa in enostavna organizacija</li>
          </ul>
          <hr className="my-6 border-yellow-400" />
          <h3 className="text-xl font-bold text-yellow-200 mb-2">Malice Kranj – lokalna rešitev za podjetja</h3>
          <p className="mb-2">
            Če vaše podjetje deluje v okolici Kranja, imamo pravo rešitev za vas. Pri <a href="https://mojamalca.si" className="text-yellow-300 underline hover:text-yellow-400" target="_blank" rel="noopener noreferrer">MojaMalca.si</a> nudimo raznoliko, sveže pripravljeno hrano, prilagojeno potrebam zaposlenih. Naša ponudba vključuje tudi vegetarijanske, brezglutenske in druge prehranske možnosti, z dostavo direktno na vašo lokacijo.
          </p>
          <p className="mb-4">Smo specialisti za <b>malice v Kranju</b> in okolici – zanesljivi, fleksibilni in vedno sveži.</p>
          <hr className="my-6 border-yellow-400" />
          <h3 className="text-xl font-bold text-yellow-200 mb-2">Zakaj izbrati Moja Malca?</h3>
          <p>
            Z večletnimi izkušnjami v pripravi <b>malic za podjetja</b>, razumemo, kaj zaposleni potrebujejo: okusen obrok, ki ne obteži, ampak napolni z energijo. Vašim ekipam dostavljamo malice, ki so pripravljene z mislijo na zdravje, okus in učinkovitost.
          </p>
        </div>
      )
    },
    {
      title: "Organizirane malice v podjetju: Rešitev za podjetja v Gorenjski regiji",
      excerpt: "Preverite našo najnovejšo ponudbo svežih in okusnih obrokov!",
      icon: <CalendarIcon />,
      content: (
        <div>
          <h2 className="text-2xl font-extrabold text-yellow-300 mb-4">Organizirane malice v podjetju: Rešitev za podjetja v Gorenjski regiji</h2>
          <p className="mb-4">
            V sodobnem tempu dela je čas ena najdragocenejših dobrin. Zato se vse več podjetij odloča za organizirane malice za zaposlene, ki ne le prihranijo čas, temveč tudi izboljšajo zadovoljstvo in učinkovitost ekipe.
          </p>
          <p className="mb-4">
            Z rešitvijo, kot jo ponuja <a href="https://mojamalca.si" className="text-yellow-300 underline hover:text-yellow-400" target="_blank" rel="noopener noreferrer">MojaMalca.si</a>, lahko podjetja svojim zaposlenim omogočijo preprosto naročanje obrokov – hitro, digitalno in brez stresa.
          </p>
          <h3 className="text-xl font-bold text-yellow-200 mb-2 mt-6">Pametno naročanje prek aplikacije</h3>
          <p className="mb-2">Pri Moja Malca smo razvili sistem, ki poenostavi celoten proces. Zaposleni si vsak teden vnaprej prek spletne aplikacije izberejo malice za posamezne dni. Tako vnaprej vemo, kaj in koliko pripraviti – vi pa se izognete višku hrane ali organizacijskim zapletom.</p>
          <h3 className="text-xl font-bold text-yellow-200 mb-2 mt-6">Prilagodljive malice, dostavljene na vrata podjetja</h3>
          <p className="mb-2">Vsi obroki so skrbno pripravljeni, sveži in pakirani glede na potrebe podjetja. Po dogovoru lahko:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-200">
            <li>naročite individualno pakiranje za vsakega zaposlenega</li>
            <li>izberete skupinsko dostavo v večjih embalažah</li>
            <li>vključite prehranske preference ali omejitve (npr. vegetarijansko, brez glutena itd.)</li>
          </ul>
          <h3 className="text-xl font-bold text-yellow-200 mb-2 mt-6">Zakaj podjetja izberejo organizirane malice?</h3>
          <ul className="list-none space-y-2 mb-4">
            <li className="flex items-center"><CheckIcon /> Prihranek časa pri organizaciji prehrane</li>
            <li className="flex items-center"><CheckIcon /> Večja zanesljivost in manj stresa za zaposlene</li>
            <li className="flex items-center"><CheckIcon /> Enostavno upravljanje naročil prek aplikacije</li>
            <li className="flex items-center"><CheckIcon /> Fleksibilno pakiranje in dostava</li>
            <li className="flex items-center"><CheckIcon /> Sveža in uravnotežena hrana, ki podpira delovni ritem</li>
          </ul>
          <h3 className="text-xl font-bold text-yellow-200 mb-2 mt-6">Poskrbite za prehrano – brez dodatnega dela</h3>
          <p>
            Če želite svojim zaposlenim ponuditi nekaj več, a brez dodatnega napora, so malice za podjetja odlična rešitev. Z našim sistemom postane vsakodnevna prehrana preprosta, organizirana in prilagojena vašim željam.
          </p>
        </div>
      )
    },
    {
      title: "Kako načrtujemo tedenski meni za podjetja",
      excerpt: "Spoznajte naš proces načrtovanja uravnoteženih menijev.",
      icon: <ChefHatIcon />,
      content: (
        <div>
          <h2 className="text-2xl font-extrabold text-yellow-300 mb-4">Kako načrtujemo tedenski meni za podjetja</h2>
          <p className="mb-4">
            Pri zagotavljanju kakovostnih malic za podjetja ni pomembna le dostava in okus hrane, temveč tudi premišljeno načrtovan meni. V podjetju Moja Malca verjamemo, da mora biti prehrana v službi raznolika, uravnotežena in prilagojena dejanskim željam zaposlenih.
          </p>
          <h3 className="text-xl font-bold text-yellow-200 mb-2 mt-6">Naš sistem: fiksna osnova + dnevna rotacija</h3>
          <p className="mb-2">Da bi dosegli idealno ravnovesje med stabilnostjo in pestrostjo, naš tedenski meni temelji na dveh ključnih elementih:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-200">
            <li><b>7–10 fiksnih obrokov mesečno:</b> To so priljubljene in preverjene jedi, ki so na voljo vsak dan. Zaposleni se lahko vedno zanesejo na svoje favorite.</li>
            <li><b>Dnevna rotacija 3 obrokov:</b> Vsak dan dodamo tri nova jedilnika, ki se dnevno menjajo. S tem ohranjamo raznolikost, sezonskost in omogočimo odkrivanje novih okusov.</li>
          </ul>
          <h3 className="text-xl font-bold text-yellow-200 mb-2 mt-6">Načrtovanje na podlagi povratnih informacij</h3>
          <p className="mb-2">Naš meni ni statičen. Redno analiziramo povratne informacije uporabnikov, spremljamo ocene in predloge, ter na podlagi analize:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-200">
            <li>prilagajamo sestavo dnevne rotacije</li>
            <li>odstranjujemo manj priljubljene jedi</li>
            <li>fiksiramo najbolj priljubljene obroke v mesečni osnovi</li>
          </ul>
          <p className="mb-4">S tem zagotavljamo, da so malice ne le okusne, ampak tudi vedno bolj prilagojene dejanskim željam podjetij in zaposlenih.</p>
          <h3 className="text-xl font-bold text-yellow-200 mb-2 mt-6">Prednosti načrtovanega menija</h3>
          <ul className="list-none space-y-2 mb-4">
            <li className="flex items-center"><CheckIcon /> Večja raznolikost brez organizacijskih zapletov</li>
            <li className="flex items-center"><CheckIcon /> Preverjena kakovost in stabilna ponudba</li>
            <li className="flex items-center"><CheckIcon /> Možnost izbire za različne prehranske potrebe</li>
            <li className="flex items-center"><CheckIcon /> Stalen napredek na podlagi mnenj uporabnikov</li>
          </ul>
        </div>
      )
    }
  ];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const section = parallaxRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Only apply effect when section is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollY = Math.max(0, windowHeight - rect.top);
        const translate = scrollY * 0.15;
        if (imageRef.current) {
          imageRef.current.style.transform = `translateY(${translate}px)`;
        }
      }

      // Calculate scroll progress for hero section
      const scrollPosition = window.scrollY;
      const maxScroll = window.innerHeight * 0.5; // Adjust this value to control when max speed is reached
      const progress = Math.min(scrollPosition / maxScroll, 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        // Start the floating animation after typing is complete
        controls.start({
          y: [0, -5, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        });
      }
    }, 50); // Adjust typing speed here

    return () => clearInterval(interval);
  }, [controls]);

  return (
    <main className="flex flex-col min-h-screen items-center bg-[#231F20] pb-12">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-yellow-300 text-[#231F20] px-4 py-2 rounded z-50">
        Pojdi na glavno vsebino
      </a>
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto py-4 fixed top-0 inset-x-0 z-30 bg-black/50 backdrop-blur-md rounded-b-2xl transition-all duration-300"
      >
        <div className="w-full flex items-center justify-between px-2 md:px-8">
          <Link href="/">
            <Image
              src="/mojamalcalogonobg.png"
              alt="Moja Mal&apos;ca Logo"
              width={160}
              height={80}
              priority
              className="drop-shadow-lg hover:scale-105 transition-transform"
            />
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-6 lg:gap-10 text-lg font-extrabold uppercase tracking-wide items-center">
            <Link href="#meni" className="text-yellow-300 hover:text-yellow-400 transition-colors font-extrabold uppercase tracking-wide">MENI</Link>
            <Link href="#podjetja" className="text-yellow-300 hover:text-yellow-400 transition-colors font-extrabold uppercase tracking-wide">Podjetja</Link>
            <Link href="#kontakt" className="text-yellow-300 hover:text-yellow-400 transition-colors font-extrabold uppercase tracking-wide">Povpraševanje</Link>
            
            {/* Floating Contact Badge */}
            <div className="relative group ml-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-300 to-orange-500 hover:from-yellow-400 hover:to-orange-600 text-[#231F20] font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="hidden group-hover:inline text-sm">Kontakt</span>
              </div>
              
              {/* Expanded Contact Options */}
              <div className="absolute top-full right-0 mt-2 bg-[#262222] rounded-2xl shadow-2xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto min-w-[220px] transform scale-95 group-hover:scale-100">
                <div className="p-4 space-y-3">
                  <a href="tel:069846626" className="flex items-center gap-3 text-yellow-300 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-gray-700/50">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">069 846 626</div>
                      <div className="text-xs text-gray-400">MOBILNA LINIJA</div>
                    </div>
                  </a>
                  <a href="tel:070451777" className="flex items-center gap-3 text-yellow-300 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-gray-700/50">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">070 451 777</div>
                      <div className="text-xs text-gray-400">MOBILNA LINIJA 2</div>
                    </div>
                  </a>
                  <div className="border-t border-gray-600 pt-3">
                    <a href="mailto:prodaja@mojamalca.si" className="flex items-center gap-3 text-yellow-300 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-gray-700/50">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">prodaja@mojamalca.si</div>
                        <div className="text-xs text-gray-400">E-pošta</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          {/* Hamburger Icon */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 z-50 fixed top-6 right-6 group"
            aria-label="Odpri meni"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`block w-8 h-1 bg-yellow-300 rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-8 h-1 bg-yellow-300 rounded mt-1.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-8 h-1 bg-yellow-300 rounded mt-1.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
          {/* Mobile Menu Overlay */}
          {menuOpen && (
            <div className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md flex items-center justify-center z-40 transition-all duration-300">
              <nav className="flex flex-col items-center justify-center gap-10 text-3xl font-extrabold uppercase tracking-wide text-yellow-300">
                <Link href="#meni" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition-colors">MENI</Link>
                <Link href="#podjetja" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition-colors">Podjetja</Link>
                <Link href="#kontakt" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition-colors">Povpraševanje</Link>
                
                {/* Mobile Contact Section */}
                <div className="mt-8 space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-yellow-300 mb-4">Kontaktirajte nas</h3>
                  </div>
                  <a href="tel:069846626" className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-[#231F20] font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                    <div className="w-10 h-10 bg-[#231F20] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-semibold">069 846 626</div>
                      <div className="text-sm opacity-80">MOBILNA LINIJA</div>
                    </div>
                  </a>
                  <a href="tel:070451777" className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#231F20] font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                    <div className="w-10 h-10 bg-[#231F20] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-semibold">070 451 777</div>
                      <div className="text-sm opacity-80">MOBILNA LINIJA 2</div>
                    </div>
                  </a>
                  <a href="mailto:prodaja@mojamalca.si" className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-semibold">PRODAJA@MOJAMALCA.SI</div>
                      <div className="text-sm opacity-80">E-POŠTA</div>
                    </div>
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section
        id="main-content"
        className="relative flex flex-col items-center justify-center min-h-[85vh] h-[85vh] w-full overflow-hidden"
        style={{ minHeight: '85vh', paddingTop: '88px' }}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.2 }}
          transition={{ duration: 15, ease: "linear" }}
          className="absolute inset-0"
        >
          <Image
            src="/pexels-ethanrwilkinson-3753488.jpg"
            alt="Hero Background"
            fill
            className="object-cover object-center z-0"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/60 z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-20 flex flex-col items-center justify-center w-full h-full px-4"
        >
          <motion.h1 
            animate={controls}
            className="text-4xl md:text-5xl font-extrabold text-yellow-300 text-center mb-4 tracking-tight drop-shadow-lg min-h-[4rem]"
          >
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block ml-1"
            >
              |
            </motion.span>
          </motion.h1>
          <p className="text-lg md:text-xl text-gray-200 text-center max-w-2xl mb-8 drop-shadow">
            Najboljše pice, in uravnotežene, sveže malice na vaš dom. Catering ponudba malic za mala in velika podjetja.
          </p>
          <Link href="#kontakt" className="relative group">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-400 opacity-90 blur-[1px] group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-energy-1" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 opacity-90 blur-[1px] group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-energy-2" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-orange-500 opacity-90 blur-[1px] group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-energy-3" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 bg-[length:200%_100%] animate-gradient-x text-[#231F20] font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-200 overflow-hidden group"
            >
              <span className="relative z-10">Oddaj povpraševanje</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 bg-[length:200%_100%] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 flex flex-col items-center text-center bg-[#262222] rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:scale-105"
        >
          <span className="mb-4 flex items-center justify-center">
            <Image src="/icon1.png" alt="Ikona za zdravo prehrano - zeleni list" width={48} height={48} className="object-contain" />
          </span>
          <h2 className="text-2xl font-extrabold text-yellow-300 mb-2">Zdravo</h2>
          <p className="text-gray-200">Uporabljamo le sveže in lokalne sestavine za pripravo uravnoteženih obrokov.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col items-center text-center bg-[#262222] rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:scale-105"
        >
          <span className="mb-4 flex items-center justify-center">
            <Image src="/icon2.png" alt="Ikona za sveže sestavine - sveže sadje" width={48} height={48} className="object-contain" />
          </span>
          <h2 className="text-2xl font-extrabold text-yellow-300 mb-2">Sveže</h2>
          <p className="text-gray-200">Vsak obrok pripravimo tik pred dostavo, da ohranimo okus in hranilno vrednost.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1 flex flex-col items-center text-center bg-[#262222] rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:scale-105"
        >
          <span className="mb-4 flex items-center justify-center">
            <Image src="/icon3.png" alt="Ikona za kakovostno hrano - kakovostni znak" width={48} height={48} className="object-contain" />
          </span>
          <h2 className="text-2xl font-extrabold text-yellow-300 mb-2">Kakovostno</h2>
          <p className="text-gray-200">Kuhamo z ljubeznijo in skrbjo za vaše zdravje in dobro počutje.</p>
        </motion.div>
      </section>

      {/* Dostava na dom: Meni Section */}
      <section id="meni" className="w-full max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-300 text-center mb-8">Dostava na dom: Meni</h2>
        <MenuDeliveryList />
      </section>

      {/* Call to Order Section */}
      <section className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
        <h3 className="text-2xl md:text-3xl font-extrabold text-yellow-300 mb-4 text-center">Pokliči nas za naročilo</h3>
        <a href="tel:069846626" className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-yellow-300 to-orange-400 px-8 py-4 rounded-full shadow-lg hover:from-yellow-400 hover:to-orange-500 transition mb-2">
          069 846 626
        </a>
      </section>

      {/* For Companies Section */}
      <section id="podjetja" className="w-full max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold text-yellow-300 mb-4"
          >
            Mal&apos;ca za podjetja
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Prilagodljive rešitve za mala in velika podjetja z enostavnim spletnim sistemom za naročanje
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="group">
              <div className="flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 hover:bg-[#262222] hover:shadow-lg">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-300 mb-3">Redna ali enkratna dostava</h3>
                  <p className="text-gray-300 leading-relaxed">Prilagodimo se vašim potrebam - od rednih tedenskih dostav do enkratnih dogodkov</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 hover:bg-[#262222] hover:shadow-lg">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-300 mb-3">Prilagodljiv meni</h3>
                  <p className="text-gray-300 leading-relaxed">Zaposleni izbirajo iz različnih opcij, vključno s posebnimi dietami</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 hover:bg-[#262222] hover:shadow-lg">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-300 mb-3">Hitra in zanesljiva dostava</h3>
                  <p className="text-gray-300 leading-relaxed">Sveži obroki dostavljeni pravočasno, ne glede na vremenske razmere</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/photo1.jpg"
                alt="Sveže pripravljena malica za podjetja - zdrava hrana na krožniku"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            
            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-8 -left-8 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-[#231F20] mb-1">Najboljša rešitev</div>
                <div className="text-sm font-semibold text-[#231F20]">za mal&apos;co!</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="#kontakt">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-300 to-orange-500 hover:from-yellow-400 hover:to-orange-600 text-[#231F20] font-bold py-4 px-10 rounded-full text-lg shadow-lg transition-all duration-200"
            >
              Povpraševanje za podjetja
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Blog Section */}
      <section className="w-full max-w-3xl mx-auto mt-12 mb-8 bg-[#262222] rounded-2xl shadow-lg p-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-300 mb-4 text-center">Malice, zdravi obroki in novice</h2>
        <ul className="space-y-3">
          {blogPosts.map((post, idx) => (
            <li key={idx} className="border border-gray-700 rounded-lg overflow-hidden transition-shadow hover:shadow-xl bg-[#231F20]">
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-3 focus:outline-none group"
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                aria-expanded={expandedIndex === idx}
              >
                <span className="flex-shrink-0">{post.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-base md:text-lg font-bold text-yellow-200 group-hover:text-yellow-300 transition-colors">{post.title}</div>
                  <div className="text-gray-400 text-xs mt-0.5 line-clamp-2">{post.excerpt}</div>
                </div>
                <span className={`ml-3 transition-transform duration-300 ${expandedIndex === idx ? 'rotate-90' : ''}`}>▶</span>
              </button>
              {expandedIndex === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="px-4 py-3 border-t border-gray-700 text-gray-200 bg-[#2d292a]"
                >
                  {typeof post.content === 'string' ? (
                    <ReactMarkdown className="prose prose-invert max-w-none text-gray-200">{post.content}</ReactMarkdown>
                  ) : (
                    post.content
                  )}
                </motion.div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-300 mb-4">
            Pogosto zastavljena vprašanja
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Odgovori na najpogostejša vprašanja o naših storitvah za podjetja
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* FAQ Item 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#262222] rounded-2xl p-6 border border-gray-700 hover:border-yellow-300/30 transition-colors duration-300"
          >
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-xl font-bold text-yellow-300 group-open:text-yellow-400 transition-colors duration-300">
                  Kdaj in kam dostavljate malice?
                </h3>
                <svg 
                  className="w-6 h-6 text-yellow-300 group-open:rotate-180 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-300 leading-relaxed">
                Malice za podjetja dostavljamo na območju Gorenjske regije, ob času, ki ga natančno določimo skupaj s podjetjem.
              </div>
            </details>
          </motion.div>

          {/* FAQ Item 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#262222] rounded-2xl p-6 border border-gray-700 hover:border-yellow-300/30 transition-colors duration-300"
          >
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-xl font-bold text-yellow-300 group-open:text-yellow-400 transition-colors duration-300">
                  Ali ponujate prilagojene obroke za posebne prehranske potrebe?
                </h3>
                <svg 
                  className="w-6 h-6 text-yellow-300 group-open:rotate-180 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-300 leading-relaxed">
                Tedenski meniji so popolnoma prilagojeni potrebam podjetja in njihovih zaposlenih – tudi za posebne prehranske zahteve, kot so vegetarijanske, brez glutena ipd.
              </div>
            </details>
          </motion.div>

          {/* FAQ Item 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#262222] rounded-2xl p-6 border border-gray-700 hover:border-yellow-300/30 transition-colors duration-300"
          >
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-xl font-bold text-yellow-300 group-open:text-yellow-400 transition-colors duration-300">
                  Kako poteka naročilo malice za podjetja?
                </h3>
                <svg 
                  className="w-6 h-6 text-yellow-300 group-open:rotate-180 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-300 leading-relaxed">
                Ko je pogodba sklenjena, podjetje prejme dostop do sistema MojaMal&apos;ca, kjer lahko ustvarja račune za svoje zaposlene. Ti nato kar prek telefona enostavno izbirajo jedi iz tedenskega menija.
              </div>
            </details>
          </motion.div>

          {/* FAQ Item 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[#262222] rounded-2xl p-6 border border-gray-700 hover:border-yellow-300/30 transition-colors duration-300"
          >
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-xl font-bold text-yellow-300 group-open:text-yellow-400 transition-colors duration-300">
                  Ali lahko naročim malico samo za en dan ali je obvezna redna naročnina?
                </h3>
                <svg 
                  className="w-6 h-6 text-yellow-300 group-open:rotate-180 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-300 leading-relaxed">
                Ko je pogodba z podjetjem sklenjena, zaposleni lahko za vsak dan v tednu sami izberejo, ali bodo naročili malico ali ne. Brez obveznosti da malico morajo naročiti vsak dan.
              </div>
            </details>
          </motion.div>

          {/* FAQ Item 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-[#262222] rounded-2xl p-6 border border-gray-700 hover:border-yellow-300/30 transition-colors duration-300"
          >
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-xl font-bold text-yellow-300 group-open:text-yellow-400 transition-colors duration-300">
                  Kako so malice pakirane in dostavljene?
                </h3>
                <svg 
                  className="w-6 h-6 text-yellow-300 group-open:rotate-180 transition-transform duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-300 leading-relaxed">
                Način pakiranja in dostave se dogovori na sestanku z vsakim podjetjem posebej. Možnosti vključujejo posamezne papirnate škatle za vsakega zaposlenega, velike gastro posode za delitev jedi in druge prilagoditve po potrebi.
              </div>
            </details>
          </motion.div>
        </div>
      </section>

      {/* New Section for Partner Companies */}
      <section className="w-full flex flex-col items-center justify-center py-12 bg-yellow-50 border-t border-b border-yellow-200">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">Dostop za podjetja, ki sodelujejo z nami.</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/sistem/podjetje/login"
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg text-lg transition text-center"
          >
            Dostop za podjetje
          </a>
          <a
            href="/sistem/zaposleni/login"
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg text-lg transition text-center"
          >
            Dostop za zaposlene
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        id="kontakt"
        className="w-full max-w-2xl bg-[#2d292a] rounded-2xl shadow-xl p-8 mt-10 flex flex-col items-center"
      >
        <h2 className="text-3xl font-extrabold text-yellow-300 mb-4">Oddaj povpraševanje</h2>
        <p className="text-gray-200 mb-6 text-center">Za naročila, povpraševanja ali dodatne informacije izpolnite spodnji obrazec ali nam pišite na <a href="mailto:prodaja@mojamalca.si" className="underline text-yellow-300">prodaja@mojamalca.si</a>.</p>
        <form className="w-full flex flex-col gap-4" onSubmit={async (e) => {
          e.preventDefault();
          setContactLoading(true);
          setContactError("");
          setContactSuccess("");
          const form = e.currentTarget;
          const name = (form.elements[0] as HTMLInputElement).value;
          const company = (form.elements[1] as HTMLInputElement).value;
          const email = (form.elements[2] as HTMLInputElement).value;
          const message = (form.elements[3] as HTMLTextAreaElement).value;
          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, company, email, message }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Napaka pri pošiljanju.");
            setContactSuccess("Sporočilo je bilo uspešno poslano! Hvala za vaše povpraševanje.");
            form.reset();
          } catch (err: any) {
            setContactError(err.message || "Napaka pri pošiljanju.");
          } finally {
            setContactLoading(false);
          }
        }}>
          <input type="text" placeholder="Ime in priimek" className="rounded-lg p-3 bg-[#231F20] text-white placeholder-gray-400 border border-gray-600 focus:border-yellow-400 outline-none" required />
          <input type="text" placeholder="Ime podjetja" className="rounded-lg p-3 bg-[#231F20] text-white placeholder-gray-400 border border-gray-600 focus:border-yellow-400 outline-none" required />
          <input type="email" placeholder="E-pošta" className="rounded-lg p-3 bg-[#231F20] text-white placeholder-gray-400 border border-gray-600 focus:border-yellow-400 outline-none" required />
          <textarea placeholder="Vaše sporočilo" className="rounded-lg p-3 bg-[#231F20] text-white placeholder-gray-400 border border-gray-600 focus:border-yellow-400 outline-none" rows={4} required />
          {contactError && <div className="text-red-400 text-sm font-semibold">{contactError}</div>}
          {contactSuccess && <div className="text-green-400 text-sm font-semibold">{contactSuccess}</div>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={contactLoading}
            className="bg-yellow-400 hover:bg-yellow-300 text-[#231F20] font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {contactLoading ? "Pošiljanje..." : "Pošlji sporočilo"}
          </motion.button>
        </form>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full border-t border-[#333] bg-[#231F20] mt-12 px-2 md:px-8 pt-8 pb-4 text-gray-400 text-sm"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo */}
          <div className="flex justify-center md:justify-start mb-4 md:mb-0">
            <Image
              src="/mojamalcalogonobg.png"
              alt="Moja Mal&apos;ca Logo"
              width={160}
              height={80}
              className="drop-shadow-lg"
            />
          </div>
          {/* Contact Details */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <span className="flex items-center gap-2 font-semibold text-white">
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5 text-yellow-300'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 2.25c-4.556 0-8.25 3.694-8.25 8.25 0 5.25 8.25 11.25 8.25 11.25s8.25-6 8.25-11.25c0-4.556-3.694-8.25-8.25-8.25zm0 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z' />
              </svg>
              Ručigajeva cesta 5, 4000 Kranj
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5 text-yellow-300'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.91l-7.2 4.5a2.25 2.25 0 01-2.36 0l-7.2-4.5A2.25 2.25 0 012.25 6.993V6.75' />
              </svg>
              <a href="mailto:prodaja@mojamalca.si" className="text-yellow-300 hover:text-yellow-400">prodaja@mojamalca.si</a>
            </span>
          </div>
          {/* Call Buttons */}
          <div className="flex flex-col md:items-end items-center gap-3">
            <a href="tel:069846626" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-[#231F20] font-bold py-2 px-5 rounded-full shadow transition-all duration-200 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.636-2.175l-2.272-.681a2.25 2.25 0 00-2.82 1.09l-.345.69a11.25 11.25 0 01-5.31-5.31l.69-.345a2.25 2.25 0 001.09-2.82l-.681-2.272A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              069 846 626
            </a>
            <a href="tel:070451777" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-[#231F20] font-bold py-2 px-5 rounded-full shadow transition-all duration-200 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.636-2.175l-2.272-.681a2.25 2.25 0 00-2.82 1.09l-.345.69a11.25 11.25 0 01-5.31-5.31l.69-.345a2.25 2.25 0 001.09-2.82l-.681-2.272A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              070 451 777
            </a>
          </div>
        </div>
        <div className="w-full flex justify-center mt-6">
          <span className="text-center text-gray-400">© {new Date().getFullYear()} mojamalca.si &mdash; Klik. Dostava. Mal&apos;ca.</span>
        </div>
      </motion.footer>

      {/* Floating Contact Button */}
      <button
        onClick={() => setContactModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-yellow-300 to-orange-500 hover:from-yellow-400 hover:to-orange-600 text-[#231F20] font-bold py-3 px-6 rounded-full shadow-xl flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-400"
        aria-label="Pokličite nas"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Pokličite nas
      </button>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#231F20] rounded-2xl shadow-2xl border border-yellow-400 max-w-xs w-full p-4 relative animate-fade-in">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-2 right-2 text-yellow-300 hover:text-orange-500 text-xl font-bold focus:outline-none"
              aria-label="Zapri kontaktni obrazec"
            >
              ×
            </button>
            <h2 className="text-lg font-bold text-yellow-300 mb-4 text-center">KONTAKTIRAJTE NAS</h2>
            <div className="space-y-3">
              <a href="tel:069846626" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-[#231F20] font-bold py-2 px-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                <div className="w-8 h-8 bg-[#231F20] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-base font-semibold">069 846 626</div>
                  <div className="text-xs opacity-80">MOBILNA LINIJA</div>
                </div>
              </a>
              <a href="tel:070451777" className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#231F20] font-bold py-2 px-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                <div className="w-8 h-8 bg-[#231F20] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-base font-semibold">070 451 777</div>
                  <div className="text-xs opacity-80">MOBILNA LINIJA 2</div>
                </div>
              </a>
              <a href="mailto:prodaja@mojamalca.si" className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-2 px-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#231F20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-base font-semibold break-words whitespace-pre-line">PRODAJA@MOJAMALCA.SI</div>
                  <div className="text-xs opacity-80">E-POŠTA</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
);

// Topic-related icons
const HealthyIcon = () => (
  <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" /></svg>
);
const CalendarIcon = () => (
  <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" /></svg>
);
const ChefHatIcon = () => (
  <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10a4 4 0 014-4h8a4 4 0 014 4v2a4 4 0 01-4 4H8a4 4 0 01-4-4v-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 18h8" /></svg>
);

function MenuDeliveryList() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "deliveryMenu"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenus(menuData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Group menus by category
  const groupedMenus = menus.reduce((acc, menu) => {
    const category = menu.category || "Drugo";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(menu);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-yellow-300">Nalaganje menija...</div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Trenutno ni na voljo nobenih menijev.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedMenus).map(([category, categoryMenus]) => (
        <div key={category}>
          <h3 className="text-2xl font-bold text-yellow-200 mb-4 text-center">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(categoryMenus as any[]).map((menu: any) => (
              <div
                key={menu.id}
                className="bg-[#262222] rounded-2xl shadow-lg p-6 flex flex-col items-start"
              >
                <h3 className="text-xl font-bold text-yellow-200 mb-2">
                  {menu.name}
                </h3>
                {menu.description && (
                  <p className="text-gray-300 mb-2">{menu.description}</p>
                )}
                <div className="text-yellow-300 font-bold text-lg mt-auto">
                  {menu.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
