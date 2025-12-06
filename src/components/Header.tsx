"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCartCount } from '@/utils/cart';
import type { Product } from '@/types/product';
import ClientOnly from './ClientOnly';
import SearchBar from './SearchBar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const headerRef = useRef<HTMLElement>(null);
  const announcementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const announcements = [
    "🚚 Free Shipping for North America and Europe",
    "📦 Free Returns Within 30 days",
    "whatsapp-contact" // Special marker for WhatsApp announcement
  ];

  // Announcement bar animation
  useEffect(() => {
    const startAnnouncementRotation = () => {
      announcementIntervalRef.current = setInterval(() => {
        setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
      }, 2000);
    };

    startAnnouncementRotation();
    
    return () => {
      if (announcementIntervalRef.current) {
        clearInterval(announcementIntervalRef.current);
      }
    };
  }, [announcements.length]);

  const handleAnnouncementNavigation = (direction: 'prev' | 'next') => {
    if (announcementIntervalRef.current) {
      clearInterval(announcementIntervalRef.current);
    }
    
    setCurrentAnnouncement(prev => {
      if (direction === 'prev') {
        return prev === 0 ? announcements.length - 1 : prev - 1;
      } else {
        return (prev + 1) % announcements.length;
      }
    });

    // Restart auto-rotation after manual navigation
    setTimeout(() => {
      announcementIntervalRef.current = setInterval(() => {
        setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
      }, 2000);
    }, 100);
  };

  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window !== 'undefined') {
        setCartCount(getCartCount());
      }
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const promotionalBarHeight = 40; // Fixed height of the promotional bar
        
        if (scrollTop > promotionalBarHeight) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleCartClick = () => {
    if (cartCount > 0) {
      router.push('/checkout');
    }
  };
  const handleMobileMenuClose = () => {
    setIsMenuOpen(false);
  };
  return (
    <>
      {/* Announcement bar - not sticky */}
      <div className="bg-[#fcf050] text-[#373c4f] py-2 relative overflow-hidden h-[40px] flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-center relative w-full h-full">
          {/* Announcement Text */}
          <div className="text-center font-medium px-4 sm:px-16 transition-all duration-500 ease-in-out h-full flex items-center justify-center min-h-[24px]">
            {announcements[currentAnnouncement] === "whatsapp-contact" ? (
              <div key={currentAnnouncement} className="inline-flex items-center gap-2 animate-fade-in text-sm sm:text-base h-full">
                <a
                  href="https://wa.me/17176484487"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  aria-label="Contact us on WhatsApp"
                >
                  <Image
                    src="/whatsapp-svgrepo-com.svg"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span>Questions? WhatsApp us</span>
                  <span className="underline">+1 (717) 648-4487</span>
                </a>
              </div>
            ) : (
              <span key={currentAnnouncement} className="inline-block animate-fade-in whitespace-nowrap text-sm sm:text-base h-full flex items-center">
                {announcements[currentAnnouncement]}
              </span>
            )}
          </div>
          
          {/* Desktop Arrows Only */}
          <button
            onClick={() => handleAnnouncementNavigation('prev')}
            className="hidden sm:block absolute left-1/2 transform -translate-x-56 p-1 hover:bg-[#373c4f]/10 rounded-full transition-colors duration-200 z-10"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleAnnouncementNavigation('next')}
            className="hidden sm:block absolute left-1/2 transform translate-x-52 p-1 hover:bg-[#373c4f]/10 rounded-full transition-colors duration-200 z-10"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Navigation bar - smart sticky */}
      <header 
        ref={headerRef}
        className={`bg-white shadow-sm transition-all duration-300 ${
          isSticky 
            ? 'fixed top-0 left-0 right-0 z-50' 
            : 'relative'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/logosvg.svg" 
                alt="HappyDeel Logo"
                width={192}
                height={40}
                priority
                className="w-48"
              />
            </Link>
            <nav className="hidden lg:flex space-x-8 font-heading">
              <Link href="/" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300">Home</Link>
              <Link href="/#products" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300">Products</Link>
              <Link href="/#featured" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300">Featured</Link>
              <Link href="/track" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300">Track Order</Link>
              <Link href="/contact" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300">Contact Us</Link>
            </nav>
            <div className="hidden lg:flex items-center space-x-4 relative">
              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                className="text-black hover:text-[#0046be] transition-colors duration-300"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </button>
              <button onClick={handleCartClick} className="relative text-black hover:text-[#0046be] transition-colors duration-300 ml-2" aria-label={`Shopping cart ${cartCount > 0 ? `with ${cartCount} items` : '(empty)'}`}>
                <ShoppingCart className="h-5 w-5" />
                <ClientOnly>
                  <span className={`absolute -top-2 -right-2 bg-[#0046be] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-opacity duration-300 ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>{cartCount}</span>
                </ClientOnly>
              </button>
            </div>
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                className="text-black hover:text-[#0046be] transition-colors duration-300"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </button>
              <button onClick={handleCartClick} className="relative text-black hover:text-[#0046be] transition-colors duration-300" aria-label={`Shopping cart ${cartCount > 0 ? `with ${cartCount} items` : '(empty)'}`}>
                <ShoppingCart className="h-5 w-5" />
                <ClientOnly>
                  <span className={`absolute -top-2 -right-2 bg-[#0046be] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-opacity duration-300 ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>{cartCount}</span>
                </ClientOnly>
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-black hover:text-[#0046be] transition-colors duration-300"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
            {/* SearchBar overlay */}
            <SearchBar open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </div>
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4 font-heading">
                <Link href="/" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300" onClick={handleMobileMenuClose}>Home</Link>
                <Link href="/#products" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300" onClick={handleMobileMenuClose}>Products</Link>
                <Link href="/#featured" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300" onClick={handleMobileMenuClose}>Featured</Link>
                <Link href="/track" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300" onClick={handleMobileMenuClose}>Track Order</Link>
                <Link href="/contact" className="text-black hover:text-[#0046be] font-medium transition-colors duration-300" onClick={handleMobileMenuClose}>Contact Us</Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
export default Header;