import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavProps {
  currentPage: string;
  setPage: (page: any) => void;
}

export default function Navigation({ currentPage, setPage }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'input', label: 'Enter Dream' },
    { id: 'symbols', label: 'Explore Symbols' },
    { id: 'journal', label: 'Dream Journal' },
  ];

  const handleNavClick = (id: string) => {
    setPage(id);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent backdrop-blur-[2px]">
        <button 
          onClick={() => handleNavClick('intro')}
          className="font-serif text-xl tracking-widest text-white hover:text-purple-300 transition-colors drop-shadow-md cursor-pointer"
        >
          Dream Decoder
        </button>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          {navItems.map(item => {
            const isActive = currentPage === item.id || (currentPage === 'result' && item.id === 'input') || (currentPage === 'analysis' && item.id === 'input');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-xs tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer ${isActive ? 'text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]' : 'text-white/70 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden text-white hover:text-purple-300 transition-colors z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {navItems.map(item => {
              const isActive = currentPage === item.id || (currentPage === 'result' && item.id === 'input') || (currentPage === 'analysis' && item.id === 'input');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-xl tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${isActive ? 'text-purple-300 drop-shadow-[0_0_15px_rgba(216,180,254,0.8)]' : 'text-white/70 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
