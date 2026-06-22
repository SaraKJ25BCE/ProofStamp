import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Legal Professional",
    role: "Lawyer",
    quote: "With AI making it so easy to produce content, proving who created something first is about to become a significant challenge, and ProofStamp offers a comfortable and affordable solution for this."
  },
  {
    name: "Expert Advocate",
    role: "Advocate",
    quote: "Most copyright cases come down to one simple question: Who can prove they had the file first? If you can’t prove it, you lose. ProofStamp solves this issue."
  },
  {
    name: "Senior Advocate",
    role: "Advocate",
    quote: "ProofStamp clearly did their research on the BSA 2023. The automated Section 63 certificates is a great implementation. I can confidently hand these to a judge."
  },
  {
    name: "Legal Professional",
    role: "Lawyer",
    quote: "When you connect a digital record to a verified identity, trusted timestamping, and a cryptographic audit trail, you create something very powerful. Today, an Indian courtroom will treat that evidence with great respect."
  },
  {
    name: "Expert Advocate",
    role: "Advocate",
    quote: "Screenshots and emails are easy to fake. I’d take ProofStamp to court because it provides admissible technical proof of prior possession."
  },
  {
    name: "Senior Advocate",
    role: "Advocate",
    quote: "Proving chain of custody requires hiring an expensive forensics expert. ProofStamp makes this process easier by giving us everything we need right away."
  },
  {
    name: "Legal Counsel",
    role: "Advocate",
    quote: "Impressed by how ProofStamp combines technology and law. A very impressive technical implementation, but it addresses a messy, real world legal problem, and makes the life of lawyers easier."
  },
  {
    name: "Beta Tester",
    role: "Actor, Influencer",
    quote: "Awesome product!!! would love to be a beta tester."
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 10000); // 10 seconds

    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="py-16 md:py-24 px-6 relative z-10 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Main Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 backdrop-blur-md apple-shadow text-center h-[450px] md:h-[400px] w-full flex flex-col transition-all duration-500 ease-in-out">
            <div className="flex-grow flex flex-col items-center justify-center">
              <Quote className="h-8 w-8 md:h-10 md:w-10 text-white/20 mb-6 shrink-0" />
              <p className="text-lg md:text-xl lg:text-2xl text-white font-medium tracking-tight leading-relaxed transition-opacity duration-500 ease-in-out">
                "{testimonials[currentIndex].quote}"
              </p>
            </div>
            <div className="mt-auto shrink-0 pt-6">
              <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">{testimonials[currentIndex].name}</h4>
              <p className="text-sm md:text-base text-white/50 mt-1 uppercase tracking-widest font-semibold">{testimonials[currentIndex].role}</p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 -translate-y-1/2 -left-12 md:-left-20 lg:-left-28 h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all backdrop-blur-md hidden sm:flex z-20 shadow-xl hover:scale-105"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 -right-12 md:-right-20 lg:-right-28 h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all backdrop-blur-md hidden sm:flex z-20 shadow-xl hover:scale-105"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center items-center gap-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/20 w-2.5 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Mobile Arrows (Visible only on small screens) */}
        <div className="flex justify-center items-center gap-6 mt-6 sm:hidden">
          <button 
            onClick={prevSlide}
            className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
