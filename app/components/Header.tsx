"use client";

import Link from "next/link";
import Image from "next/image";
import { Coins, User, Menu, Search } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-black/95 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-2xl blur-xl opacity-50" />
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/logo.png"
                  alt="Xirevoa AI Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Xirevoa AI
              </h1>
              <p className="text-xs text-zinc-500">Transform Your Reality</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 items-center">
            <Link href="/" className="text-zinc-400 hover:text-yellow-400 transition-colors font-medium">
              Templates
            </Link>
            <Link href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors font-medium">
              Gallery
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
            </button>

            {/* Coins */}
            <button className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-yellow-500/20">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400/20" />
              <span className="text-sm font-bold text-yellow-400">250</span>
            </button>

            {/* Profile */}
            <button className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
            </button>

            {/* Mobile Menu */}
            <button className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by title or tags..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pl-10 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
