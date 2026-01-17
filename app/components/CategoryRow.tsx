"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Template {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
}

interface CategoryRowProps {
  categoryName: string;
  categoryImage?: string;
  templates: Template[];
}

export default function CategoryRow({ categoryName, categoryImage, templates }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (templates.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Category Header */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white">{categoryName}</h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative group">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-yellow-400" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-yellow-400" />
        </button>

        {/* Templates Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/${template.slug}`}
              className="flex-none w-72 sm:w-80 group/card"
            >
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20 flex items-center gap-4">
                {/* Profile Picture */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                  <Image
                    src={template.image}
                    alt={template.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover object-top group-hover/card:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Template Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base mb-1 truncate group-hover/card:text-yellow-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 line-clamp-2">
                    {template.description.length > 60 
                      ? `${template.description.substring(0, 60)}...` 
                      : template.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
