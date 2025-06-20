'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const fullText = "Zdrava, sveža in kakovostna mal'ca za podjetja";
  const controls = useAnimation();

  // Add these refs and inView states for the cards
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const card1InView = useInView(card1Ref, { once: false, amount: 0.6 });
  const card2InView = useInView(card2Ref, { once: false, amount: 0.6 });
  const card3InView = useInView(card3Ref, { once: false, amount: 0.6 });

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
              alt="Moja Mal'ca Logo"
              width={160}
              height={80}
              priority
              className="drop-shadow-lg hover:scale-105 transition-transform"
            />
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-6 lg:gap-10 text-lg font-extrabold uppercase tracking-wide items-center">
            <Link href="#podjetja" className="text-yellow-300 hover:text-yellow-400 transition-colors font-extrabold uppercase tracking-wide">Za podjetja</Link>
            <Link href="#kontakt" className="text-yellow-300 hover:text-yellow-400 transition-colors font-extrabold uppercase tracking-wide">Kontakt</Link>
            <a href="tel:069846626" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-[#231F20] font-bold py-2 px-5 rounded-full shadow transition-all duration-200 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.636-2.175l-2.272-.681a2.25 2.25 0 00-2.82 1.09l-.345.69a11.25 11.25 0 01-5.31-5.31l.69-.345a2.25 2.25 0 001.09-2.82l-.681-2.272A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              069 846 626
            </a>
            <a href="tel:070451777" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-[#231F20] font-bold py-2 px-5 rounded-full shadow transition-all duration-200 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.636-2.175l-2.272-.681a2.25 2.25 0 00-2.82 1.09l-.345.69a11.25 11.25 0 01-5.31-5.31l.69-.345a2.25 2.25 0 001.09-2.82l-.681-2.272A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              070 451 777
            </a>
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
            <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-md flex items-center justify-center z-40 transition-all duration-300">
              <nav className="flex flex-col items-center justify-center gap-10 text-3xl font-extrabold uppercase tracking-wide text-yellow-300">
                <Link href="#podjetja" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition-colors">Za podjetja</Link>
                <Link href="#kontakt" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition-colors">Kontakt</Link>
                <a href="tel:069846626" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-[#231F20] font-bold py-2 px-5 rounded-full shadow transition-all duration-200 mt-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.636-2.175l-2.272-.681a2.25 2.25 0 00-2.82 1.09l-.345.69a11.25 11.25 0 01-5.31-5.31l.69-.345a2.25 2.25 0 001.09-2.82l-.681-2.272A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  069 846 626
                </a>
                <a href="tel:070451777" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-[#231F20] font-bold py-2 px-5 rounded-full shadow transition-all duration-200 mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.636-2.175l-2.272-.681a2.25 2.25 0 00-2.82 1.09l-.345.69a11.25 11.25 0 01-5.31-5.31l.69-.345a2.25 2.25 0 001.09-2.82l-.681-2.272A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  070 451 777
                </a>
              </nav>
            </div>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section
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
            Dostavljamo okusne in uravnotežene obroke za mala in velika podjetja po Gorenjski. Preprosto naročanje, hitra dostava in vedno nasmejana ekipa!
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
              <span className="relative z-10">Naroči mal&apos;co</span>
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
            <Image src="/icon1.png" alt="Zdravo ikona" width={48} height={48} className="object-contain" />
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
            <Image src="/icon2.png" alt="Sveže ikona" width={48} height={48} className="object-contain" />
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
            <Image src="/icon3.png" alt="Kakovostno ikona" width={48} height={48} className="object-contain" />
          </span>
          <h2 className="text-2xl font-extrabold text-yellow-300 mb-2">Kakovostno</h2>
          <p className="text-gray-200">Kuhamo z ljubeznijo in skrbjo za vaše zdravje in dobro počutje.</p>
        </motion.div>
      </section>

      {/* For Companies Section */}
      <section id="podjetja" ref={parallaxRef} className="w-full min-h-[400px] h-[60vh] relative flex items-center justify-center my-16 overflow-hidden">
        {/* Full Background Image */}
        <Image
          ref={imageRef}
          src="/photo1.jpg"
          alt="Mal'ca catering - hrana"
          fill
          className="object-cover object-center w-full h-full rounded-2xl shadow-2xl transition-transform duration-300 will-change-transform"
          style={{ filter: 'brightness(0.93) saturate(1.1)' }}
          priority
        />
        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 max-w-md md:max-w-lg w-full md:ml-auto md:mr-12 bg-gradient-to-br from-orange-400 to-yellow-300 p-3 md:p-8 gap-2 md:gap-4 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center backdrop-blur-md m-2"
        >
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#231F20] mb-1 md:mb-2 drop-shadow-lg">Mal&apos;ca za podjetja</h2>
          <p className="text-base md:text-lg text-[#231F20] mb-1 md:mb-2 font-medium max-w-xl">
            Ponujamo prilagodljive rešitve za mala in velika podjetja. Možnost rednih ali enkratnih naročil, prilagoditev menija glede na želje zaposlenih in enostavno naročanje preko spleta.
          </p>
          <ul className="list-disc list-inside text-[#231F20] mb-2 text-sm md:text-base font-semibold space-y-0.5 text-left md:text-center md:list-inside">
            <li>Redna ali enkratna dostava</li>
            <li>Prilagodljiv meni</li>
            <li>Možnost posebnih diet</li>
            <li>Hitra in zanesljiva dostava</li>
          </ul>
          <Link href="#kontakt">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#231F20] hover:bg-[#2d292a] text-yellow-300 font-extrabold py-2 md:py-3 px-6 md:px-8 rounded-full text-base md:text-lg shadow-xl transition-all duration-200 mt-1 mx-auto"
            >
              Povpraševanje za podjetja
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* How it works Section */}
      <section id="kako" className="w-full max-w-4xl py-14 mx-auto relative overflow-hidden">
        {/* Background Circles */}
        <div className="absolute inset-0 z-0">
          {/* Orbiting circles */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* First orbit */}
            <div className="absolute w-16 h-16 rounded-full bg-orange-500/30 blur-xl animate-orbit-1" />
            <div className="absolute w-12 h-12 rounded-full bg-yellow-400/30 blur-xl animate-orbit-1" style={{ animationDelay: '-5s' }} />
            
            {/* Second orbit */}
            <div className="absolute w-14 h-14 rounded-full bg-yellow-300/30 blur-xl animate-orbit-2" />
            <div className="absolute w-16 h-16 rounded-full bg-orange-400/30 blur-xl animate-orbit-2" style={{ animationDelay: '-8s' }} />
            
            {/* Third orbit */}
            <div className="absolute w-12 h-12 rounded-full bg-orange-300/30 blur-xl animate-orbit-3" />
            <div className="absolute w-14 h-14 rounded-full bg-yellow-400/30 blur-xl animate-orbit-3" style={{ animationDelay: '-12s' }} />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-300 text-center mb-10 relative z-10">Kako poteka poslovanje z nami?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 relative px-4 md:px-0 z-10">
          {/* Connecting Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300/20 via-yellow-300/40 to-yellow-300/20 -translate-y-1/2" />
          {/* Mobile Vertical Line */}
          <div className="md:hidden absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-300/20 via-yellow-300/40 to-yellow-300/20 -translate-x-1/2" />
          
          {/* Step 1 */}
          <motion.div
            ref={card1Ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center bg-[#262222] rounded-2xl p-8 md:p-6 shadow-lg relative group hover:shadow-yellow-300/20 transition-all duration-300 mx-4 md:mx-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-yellow-300/10 to-orange-500/10 rounded-2xl transition-opacity duration-500 ${card1InView ? 'opacity-100' : 'opacity-0'} md:group-hover:opacity-100`} />
            <div className="flex items-center justify-center w-16 h-16 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 text-[#231F20] font-extrabold text-2xl mb-6 md:mb-4 relative group-hover:scale-110 transition-transform duration-300">
              <span className="relative z-10">1</span>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 animate-pulse ${card1InView ? 'opacity-50' : 'opacity-0'} transition-opacity duration-500`} />
            </div>
            <h3 className={`text-2xl md:text-xl font-bold mb-3 md:mb-2 text-center transition-colors duration-500 ${card1InView ? 'text-yellow-300' : 'text-yellow-200'} md:group-hover:text-yellow-300`}>Sestanek s podjetjem</h3>
            <p className={`text-center text-lg md:text-base transition-colors duration-500 ${card1InView ? 'text-gray-100' : 'text-gray-200'} md:group-hover:text-gray-100`}>Najprej se dogovorimo za sestanek, kjer skupaj določimo ure dostave, prehranske preference in posebne želje vaših zaposlenih.</p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            ref={card2Ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center bg-[#262222] rounded-2xl p-8 md:p-6 shadow-lg relative group hover:shadow-yellow-300/20 transition-all duration-300 mx-4 md:mx-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-yellow-300/10 to-orange-500/10 rounded-2xl transition-opacity duration-500 ${card2InView ? 'opacity-100' : 'opacity-0'} md:group-hover:opacity-100`} />
            <div className="flex items-center justify-center w-16 h-16 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 text-[#231F20] font-extrabold text-2xl mb-6 md:mb-4 relative group-hover:scale-110 transition-transform duration-300">
              <span className="relative z-10">2</span>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 animate-pulse ${card2InView ? 'opacity-50' : 'opacity-0'} transition-opacity duration-500`} />
            </div>
            <h3 className={`text-2xl md:text-xl font-bold mb-3 md:mb-2 text-center transition-colors duration-500 ${card2InView ? 'text-yellow-300' : 'text-yellow-200'} md:group-hover:text-yellow-300`}>Prilagojen sistem za podjetje</h3>
            <p className={`text-center text-lg md:text-base transition-colors duration-500 ${card2InView ? 'text-gray-100' : 'text-gray-200'} md:group-hover:text-gray-100`}>Podjetju zagotovimo lasten, prilagojen spletni sistem, kjer lahko zaposleni enostavno izbirajo obroke.</p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            ref={card3Ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center bg-[#262222] rounded-2xl p-8 md:p-6 shadow-lg relative group hover:shadow-yellow-300/20 transition-all duration-300 mx-4 md:mx-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-yellow-300/10 to-orange-500/10 rounded-2xl transition-opacity duration-500 ${card3InView ? 'opacity-100' : 'opacity-0'} md:group-hover:opacity-100`} />
            <div className="flex items-center justify-center w-16 h-16 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 text-[#231F20] font-extrabold text-2xl mb-6 md:mb-4 relative group-hover:scale-110 transition-transform duration-300">
              <span className="relative z-10">3</span>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 animate-pulse ${card3InView ? 'opacity-50' : 'opacity-0'} transition-opacity duration-500`} />
            </div>
            <h3 className={`text-2xl md:text-xl font-bold mb-3 md:mb-2 text-center transition-colors duration-500 ${card3InView ? 'text-yellow-300' : 'text-yellow-200'} md:group-hover:text-yellow-300`}>Tedenska izbira obrokov</h3>
            <p className={`text-center text-lg md:text-base transition-colors duration-500 ${card3InView ? 'text-gray-100' : 'text-gray-200'} md:group-hover:text-gray-100`}>Zaposleni vsak teden izberejo svoje želene obroke, mi pa poskrbimo za pravočasno in svežo dostavo.</p>
          </motion.div>
        </div>
      </section>

      {/* New Section for Partner Companies */}
      <section className="w-full flex flex-col items-center justify-center py-12 bg-yellow-50 border-t border-b border-yellow-200">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">Dostop za podjetja, ki sodelujejo z nami.</h2>
        <a
          href="/sistem"
          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg text-lg transition"
        >
          Pojdi na sistem
        </a>
      </section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        id="kontakt"
        className="w-full max-w-2xl bg-[#2d292a] rounded-2xl shadow-xl p-8 mt-10 flex flex-col items-center"
      >
        <h2 className="text-3xl font-extrabold text-yellow-300 mb-4">Kontaktirajte nas</h2>
        <p className="text-gray-200 mb-6 text-center">Za naročila, povpraševanja ali dodatne informacije izpolnite spodnji obrazec ali nam pišite na <a href="mailto:info@mojamalca.si" className="underline text-yellow-300">info@mojamalca.si</a>.</p>
        <form className="w-full flex flex-col gap-4">
          <input type="text" placeholder="Ime in priimek" className="rounded-lg p-3 bg-[#231F20] text-white placeholder-gray-400 border border-gray-600 focus:border-yellow-400 outline-none" required />
          <input type="email" placeholder="E-pošta" className="rounded-lg p-3 bg-[#231F20] text-white placeholder-gray-400 border border-gray-600 focus:border-yellow-400 outline-none" required />
          <textarea placeholder="Vaše sporočilo" className="rounded-lg p-3 bg-[#231F20] text-white placeholder-gray-400 border border-gray-600 focus:border-yellow-400 outline-none" rows={4} required />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-300 text-[#231F20] font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-200 mt-2"
          >
            Pošlji sporočilo
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
              alt="Moja Mal'ca Logo"
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
    </main>
  );
}
