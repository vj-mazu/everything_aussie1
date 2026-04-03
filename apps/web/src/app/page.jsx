"use client";

import { useEffect, useRef, useState } from "react";
import {
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Smartphone,
  Accessibility,
  Store,
  MessageCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  useMotionTemplate,
  useSpring,
} from "framer-motion";

const IntroLoader = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[100] bg-[#1A1A1A] flex items-center justify-center overflow-hidden"
    >
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onAnimationComplete={() => setTimeout(onComplete, 1500)}
          className="text-4xl md:text-7xl font-bold text-white font-playfair-display tracking-tighter"
        >
          Everything <span className="text-[#C9A668]">Aussie</span>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-[2px] bg-[#C9A668] mt-4 origin-left"
          />
        </motion.h1>
      </div>
      
      {/* Floating Sparkles in Loader */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -100], 
            opacity: [0, 1, 0],
            scale: [0, 1, 0] 
          }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            repeat: Infinity, 
            delay: i * 0.4 
          }}
          className="absolute text-[#C9A668]/30"
          style={{ 
            left: `${15 + i * 15}%`, 
            top: `${70 + (i % 3) * 10}%` 
          }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  // Magnetic Button Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const transform = useMotionTemplate`translate3d(${mouseX}px, ${mouseY}px, 0)`;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.3);
    mouseY.set(y * 0.3);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="bg-[#FAFAF5] selection:bg-[#C9A668] selection:text-white overflow-x-hidden">
      <AnimatePresence>
        {isLoading && <IntroLoader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* Floating Background Sparkles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -200, 0],
              x: [0, 50, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 2
            }}
            className="absolute text-[#C9A668]/10"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
        ))}
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#1A1A1A]/95 backdrop-blur-md z-50 border-b border-[#C9A668]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C9A668] to-[#8B6F47] rounded-lg flex items-center justify-center">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-playfair-display">
                Everything Aussie
              </h1>
              <p className="text-xs text-[#C9A668] font-light">
                South Melbourne Market
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/61432550568"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500/10 hover:bg-green-500/20 text-green-500 p-3 rounded-lg transition-all duration-300 flex items-center gap-2 border border-green-500/30"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href="tel:+61432550568"
              className="bg-gradient-to-r from-[#C9A668] to-[#8B6F47] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A668]/30 transition-all duration-300 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Contact Us</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden mt-20"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <motion.img
            style={{ scale }}
            src="/assets/real_store.jpg"
            alt="Everything Aussie Real Storefront"
            className="w-full h-full object-cover"
          />
          {/* Enhanced Visibility Scrim */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#FAFAF5]"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-5xl"
        >
          <div className="hero-content">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.3em" }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-[#C9A668] text-sm tracking-[0.3em] uppercase mb-4 font-light"
            >
              Welcome to
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-6xl md:text-8xl font-bold text-white mb-6 font-playfair-display leading-tight"
            >
              Everything Aussie
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl text-white/90 mb-4 font-light max-w-3xl mx-auto leading-relaxed"
            >
              The BEST quality Australian Souvenirs at the BEST price
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-lg text-[#C9A668] mb-8 font-light"
            >
              Genuine Aboriginal Arts • Australian Made Products • Authentic Artifacts
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex gap-6 justify-center flex-wrap"
            >
              <motion.a
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ transform }}
                href="#products"
                className="bg-gradient-to-r from-[#C9A668] to-[#8B6F47] text-white px-10 py-5 rounded-full text-lg font-bold shadow-[0_20px_50px_rgba(201,166,104,0.4)] transition-all duration-300 relative group overflow-hidden border border-white/20"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Explore Collection <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </motion.a>
              <motion.a
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ transform }}
                href="#location"
                className="bg-black/30 backdrop-blur-xl text-white px-10 py-5 rounded-full text-lg font-bold border-2 border-white/40 hover:bg-[#C9A668]/20 transition-all duration-300 hover:border-[#C9A668]"
              >
                Visit Our Stall
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 scroll-indicator">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 bg-gradient-to-b from-[#FAFAF5] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="text-center mb-16"
          >
            <p className="text-[#C9A668] text-sm tracking-[0.4em] uppercase mb-4 font-bold drop-shadow-sm">
              Discover
            </p>
            <div className="overflow-hidden">
              <motion.h2 
                initial={{ y: "100%", skewY: 5 }}
                whileInView={{ y: 0, skewY: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl font-bold text-[#1A1A1A] font-playfair-display mb-6 tracking-tight"
              >
                Authentic Australian Treasures
              </motion.h2>
            </div>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="w-32 h-1 bg-gradient-to-r from-transparent via-[#C9A668] to-transparent mx-auto"
            ></motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { 
                url: "https://raw.createusercontent.com/d3980f4b-3e3a-45e3-8ca8-b1fcd363ffa2/",
                title: "Heritage in Motion",
                desc: "Experience the rhythm of our authentic didgeridoos."
              },
              { 
                url: "https://raw.createusercontent.com/3887748c-1ebc-4d31-8609-dcd51af61b68/",
                title: "Curated Excellence",
                desc: "Discover the craftsmanship behind every souvenir."
              }
            ].map((video, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="rounded-3xl overflow-hidden shadow-2xl group relative active:scale-95 transition-transform cursor-pointer">
                  <video
                    src={video.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="text-center md:text-left px-2">
                  <h3 className="text-2xl font-bold text-[#1A1A1A] font-playfair-display mb-2">{video.title}</h3>
                  <p className="text-gray-600 font-light italic">{video.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C9A668] text-sm tracking-[0.3em] uppercase mb-3 font-light">
              Our Collection
            </p>
            <h2 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] font-playfair-display mb-4">
              What We Offer
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#C9A668] to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Aboriginal Arts & Artifacts",
                description:
                  "Discover the profound legacy of Australia through genuine returning boomerangs and intricate dot-art artifacts.",
                image:
                  "/assets/aboriginal.png",
              },
              {
                title: "Australian Soft Toys",
                description:
                  "Bring home a piece of the bush with our cuddly kangaroos, koalas, and wombats—crafted for pure Australian charm.",
                image:
                  "https://ucarecdn.com/cc54ff00-1698-4065-87af-1447be67e8c2/-/format/auto/",
              },
              {
                title: "Souvenirs & Gifts",
                description:
                  "Treasured mementos from fine gold-plated collectibles to vibrant apparel, each telling an Aussie story.",
                image:
                  "https://ucarecdn.com/4258acf0-4627-4c8e-991c-237c1336a314/-/format/auto/",
              },
              {
                title: "Traditional Crafts",
                description:
                  "Masterfully carved didgeridoos and artifacts that celebrate the timeless heritage of Australian craftsmanship.",
                image:
                  "/assets/crafts.png",
              },
              {
                title: "Backpacks & Bags",
                description:
                  "Australian-themed backpacks and carrying bags for all ages—where style meets durable outback spirit.",
                image:
                  "/assets/plush_backpacks.jpg",
                special: true,
              },
              {
                title: "Wide Selection",
                description:
                  "Thousands of authentic Australian treasures curated for exceptional quality and undeniable value.",
                image:
                  "https://ucarecdn.com/0d7ffb3f-2950-4471-a4e3-2099d51ecd7b/-/format/auto/",
              },
            ].map((product, index) => (
              <motion.div
                key={index}
                initial={{ 
                  opacity: 0, 
                  x: index % 2 === 0 ? -100 : 100, 
                }}
                whileInView={{ 
                  opacity: 1, 
                  x: 0, 
                }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  type: "spring", 
                  stiffness: 70, 
                  damping: 18, 
                  delay: index * 0.1 
                }}
                className={`group flex flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl ${
                  product.special 
                    ? "bg-[#1A1A1A] text-white ring-2 ring-[#C9A668]/50 shadow-[0_20px_50px_rgba(201,166,104,0.15)]" 
                    : "bg-white text-[#1A1A1A] shadow-lg"
                }`}
              >
                <div className="relative h-72 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.special && (
                    <div className="absolute top-4 right-4 bg-[#C9A668] p-2 rounded-full shadow-lg border border-white/20 z-10">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-1">
                  {product.special && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-[#C9A668] text-[11px] tracking-[0.4em] uppercase mb-4 font-black"
                    >
                      <Trophy className="w-3.5 h-3.5" /> Signature Collection
                    </motion.div>
                  )}
                  
                  <h3 className={`text-2xl md:text-3xl font-bold mb-4 font-playfair-display leading-tight ${product.special ? "text-white" : "text-[#1A1A1A]"}`}>
                    {product.title}
                  </h3>
                  
                  <p className={`text-sm mb-8 font-light leading-relaxed flex-1 ${product.special ? "text-white/80" : "text-gray-600"}`}>
                    {product.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-all duration-500">
                      <div className={`w-20 h-[3px] rounded-full ${product.special ? "bg-white" : "bg-[#C9A668]"}`}></div>
                      <div className={`w-12 h-[2px] rounded-full translate-x-4 ${product.special ? "bg-[#C9A668]" : "bg-[#1A1A1A]/20"}`}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-[#FAFAF5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C9A668] text-sm tracking-[0.3em] uppercase mb-3 font-light">
              Why Choose Us
            </p>
            <h2 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] font-playfair-display mb-4">
              Our Commitment
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#C9A668] to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Store className="w-12 h-12" />,
                title: "On-site services",
                description:
                  "Comprehensive on-site assistance at our iconic South Melbourne stall.",
              },
              {
                icon: <Accessibility className="w-12 h-12" />,
                title: "Accessibility",
                description: "Wheelchair-accessible entrance for every visitor.",
              },
              {
                icon: <Clock className="w-12 h-12" />,
                title: "Planning",
                description: "Seamlessly curated for a quick visit or deep discovery.",
              },
              {
                icon: <CreditCard className="w-12 h-12" />,
                title: "Payments",
                description: "Effortless transactions via all major digital methods.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ 
                  y: -15, 
                  boxShadow: "0 30px 60px -12px rgba(201,166,104,0.15)",
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-white border border-[#C9A668]/10 hover:border-[#C9A668]/30 transition-all duration-500 cursor-default"
              >
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FAFAF5] to-[#F0F0E0] text-[#1A1A1A] mb-8 shadow-inner"
                >
                  <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 text-[#C9A668]">
                    {feature.icon}
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4 font-playfair-display">
                  {feature.title}
                </h3>
                <div className="flex items-start gap-3 justify-center">
                  <div className="w-5 h-5 mt-1 text-[#C9A668] flex-shrink-0 bg-[#C9A668]/10 rounded-full p-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-[#666] font-light leading-relaxed text-base italic">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Kind Words Section */}
      <section className="py-24 bg-white border-t border-[#C9A668]/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <p className="text-[#C9A668] text-sm tracking-[0.4em] uppercase mb-4 font-bold">Feedback</p>
            <h2 className="text-5xl md:text-7xl font-bold text-[#1A1A1A] font-playfair-display mb-8">Kind Words</h2>
            <div className="w-24 h-1 bg-[#C9A668] mx-auto opacity-30"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "The quality of the boomerangs is unmatched. A true piece of Australian culture that we will treasure forever.",
                author: "Sarah J., UK",
                rating: 5
              },
              {
                text: "Best price at the South Melbourne Market. The selection is huge and the staff are incredibly welcoming.",
                author: "David L., USA",
                rating: 5
              },
              {
                text: "Bought the plush kangaroo for my niece and she hasn't let it go! Authentic and so beautifully made.",
                author: "Elena R., Italy",
                rating: 5
              }
            ].map((quote, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-10 rounded-3xl bg-[#FAFAF5] border border-[#C9A668]/10 hover:shadow-xl transition-all duration-500"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(quote.rating)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 text-[#C9A668]" />
                  ))}
                </div>
                <p className="text-xl text-[#1A1A1A] font-light leading-relaxed mb-8 italic font-playfair-display">
                  "{quote.text}"
                </p>
                <p className="text-[#C9A668] font-bold tracking-widest uppercase text-xs">
                  — {quote.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours Section */}
      <section id="location" className="py-24 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-white">
              <p className="text-[#C9A668] text-sm tracking-[0.3em] uppercase mb-3 font-light">
                Visit Us
              </p>
              <h2 className="text-5xl font-bold mb-8 font-playfair-display">
                Location & Hours
              </h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#C9A668]/20 flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-[#C9A668]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 font-playfair-display">
                      Address
                    </h3>
                    <p className="text-white/80 font-light leading-relaxed">
                      Shop 185 Everything Aussie
                      <br />
                      322-326 Coventry St
                      <br />
                      South Melbourne VIC 3205
                      <br />
                      Australia
                    </p>
                    <p className="text-[#C9A668] text-sm mt-2">
                      Located in: South Melbourne Market
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#C9A668]/20 flex items-center justify-center">
                      <Phone className="w-7 h-7 text-[#C9A668]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 font-playfair-display">
                      Contact
                    </h3>
                    <div className="flex flex-col gap-3">
                      <a
                        href="tel:+61432550568"
                        className="text-[#C9A668] text-lg hover:underline transition-all duration-300 flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        +61 432 550 568
                      </a>
                      <a
                        href="https://wa.me/61432550568"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 text-lg hover:underline transition-all duration-300 flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#C9A668]/20 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-[#C9A668]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4 font-playfair-display">
                      Opening Hours
                    </h3>
                    <div className="space-y-3">
                      {[
                        { day: "Wednesday", hours: "8:00 AM - 4:00 PM" },
                        { day: "Thursday", hours: "8:00 AM - 4:00 PM" },
                        {
                          day: "Friday",
                          hours: "Closed (Good Friday)",
                          special: true,
                        },
                        { day: "Saturday", hours: "8:00 AM - 4:00 PM" },
                        {
                          day: "Sunday",
                          hours: "8:00 AM - 4:00 PM (Easter - Holiday hours)",
                          special: true,
                        },
                        {
                          day: "Monday",
                          hours: "Closed (Easter Monday)",
                          special: true,
                        },
                        { day: "Tuesday", hours: "Closed" },
                      ].map((schedule, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-white/10"
                        >
                          <span
                            className={`font-semibold ${schedule.special ? "text-[#C9A668]" : "text-white"}`}
                          >
                            {schedule.day}
                          </span>
                          <span
                            className={`text-sm ${schedule.special ? "text-[#C9A668]/80" : "text-white/70"} font-light`}
                          >
                            {schedule.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/50 mt-4 italic">
                      Hours may vary on public holidays
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl h-[600px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.543286077747!2d144.95373631531656!3d-37.83177797975159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad667f1c1e2c1c1%3A0x1234567890abcdef!2s322%20Coventry%20St%2C%20South%20Melbourne%20VIC%203205!5e0!3m2!1sen!2sau!4v1234567890123!5m2!1sen!2sau"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-700"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F0F0F] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C9A668] to-[#8B6F47] rounded-lg flex items-center justify-center">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold font-playfair-display">
                Everything Aussie
              </h3>
              <p className="text-xs text-[#C9A668]">South Melbourne Market</p>
            </div>
          </div>
          <p className="text-white/60 mb-4 font-light">
            The BEST quality Australian Souvenirs at the BEST price
          </p>
          <p className="text-white/40 text-sm font-light">
            © {new Date().getFullYear()} Everything Aussie. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        .font-playfair-display {
          font-family: 'Playfair Display', serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background-color: #C9A668;
          color: white;
        }
      `}</style>
    </div>
  );
}
