"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const typingTextRef = useRef<HTMLSpanElement>(null);
  const placeholder = '\u00a0';

  useEffect(() => {
    const element = typingTextRef.current;
    if (!element) return;

    const words = ['Cameras', 'Fashion', 'Tech', 'Sport Gear'];
    let isAnimating = true;
    let currentIndex = 0;

    const sleep = (duration: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, duration));

    const typeWord = async (word: string) => {
      element.textContent = '';
      const letters = word.split('');
      for (const letter of letters) {
        if (!isAnimating) return;
        element.textContent = `${element.textContent}${letter}`;
        await sleep(90);
      }
    };

    const deleteWord = async () => {
      while (isAnimating && (element.textContent?.length ?? 0) > 0) {
        element.textContent = element.textContent?.slice(0, -1) ?? '';
        await sleep(40);
      }
      element.textContent = placeholder;
    };

    const animateLoop = async () => {
      element.textContent = placeholder;

      while (isAnimating) {
        const word = words[currentIndex];

        // Type word, show tail on same line
        await typeWord(word);
        if (!isAnimating) break;

        // Wait while word is displayed
        await sleep(2000);
        if (!isAnimating) break;

        // Delete current word
        await deleteWord();
        if (!isAnimating) break;

        await sleep(350);
        if (!isAnimating) break;

        currentIndex = (currentIndex + 1) % words.length;
      }
    };

    animateLoop();

    return () => {
      isAnimating = false;
    };
  }, []);

  return (
    <div className="relative bg-[#1c44b6] overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 transform -skew-y-6 bg-black"></div>
        <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
          <div className="w-64 h-64 rounded-full bg-black opacity-20"></div>
        </div>
        <div className="absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/4">
          <div className="w-96 h-96 rounded-full bg-black opacity-20"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] text-center md:text-left">
              <span
                ref={typingTextRef}
                className="block h-[1.2em] mb-[5px] mx-auto md:mx-0 text-center md:text-left"
              >
                {placeholder}
              </span>
              <span className="block text-center md:text-left leading-[1.2]">
                The Marketplace For<br className="hidden md:block" /> Great Finds
              </span>
            </h1>
            <p className="mt-3 text-lg md:text-xl text-blue-100 max-w-lg mx-auto md:mx-0">
              Authentic Burberry, Stone Island, And More. Top Tech, Bikes, And Cameras. All Checked And Ready.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="#products" 
                className="px-8 py-3 bg-white text-[#1b44b7] font-medium rounded-md shadow-md hover:bg-gray-100 transition duration-300 flex items-center justify-center border-2 border-transparent"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a 
                href="#featured" 
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 transition duration-300 flex items-center justify-center"
              >
                Featured Products
              </a>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative mx-auto w-full max-w-md md:max-w-[320px]">
              <div className="absolute inset-0 bg-[#1c44b6] rounded-2xl transform rotate-3 scale-105 opacity-50 blur-xl"></div>
              <Image 
                src="/g7x.webp" 
                alt="Canon G7X Camera with accessories" 
                width={500}
                height={400}
                priority
                className="relative z-10 rounded-xl shadow-2xl w-full h-auto object-cover object-center"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-[#313a4b] font-medium">Special Offers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;