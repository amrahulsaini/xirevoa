"use client";

import Link from "next/link";
import Image from "next/image";
import { Zap, User, Menu, Search, X, Home, Image as ImageIcon, DollarSign, Sparkles, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showSidebar && !target.closest('.sidebar') && !target.closest('.menu-btn')) {
        setShowSidebar(false);
      }
      if (showUserMenu && !target.closest('.user-menu') && !target.closest('.user-btn')) {
        setShowUserMenu(false);
      }
    };

    if (showSidebar || showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      if (showSidebar) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showSidebar, showUserMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      setShowSearch(false);
    }
  };

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/", label: "Templates", icon: ImageIcon },
    { href: "#pricing", label: "Pricing", icon: DollarSign },
    { href: "#gallery", label: "Gallery", icon: Sparkles },
  ];

  return (
    <>
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

            {/* Right Side Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
              </button>

              {/* XPoints - Show only if logged in */}
              {session && (
              <button className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-yellow-500/20">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold text-black">XP</span>
                </div>
                <span className="text-sm font-bold text-yellow-400">{(session.user as any)?.xpoints || 20}</span>
                </button>
              )}

              {/* Profile */}
              {session ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="user-btn w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors overflow-hidden border-2 border-yellow-500/20"
                  >
                    {session.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="user-menu absolute right-0 mt-2 w-64 bg-zinc-900 border-2 border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="p-4 border-b border-zinc-800 bg-zinc-800/50">
                        <p className="text-white font-semibold truncate">{session.user?.name}</p>
                        <p className="text-zinc-400 text-sm truncate">{session.user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link 
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors border-2 border-zinc-700 hover:border-yellow-500/50"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
                </Link>
              )}

              {/* Menu Button */}
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="menu-btn w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
              >
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

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity" />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 z-[70] transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setShowSidebar(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 transition-all group"
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-zinc-800">
            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-2">Need help?</p>
              <Link 
                href="#support" 
                className="text-yellow-400 hover:text-yellow-300 font-medium text-sm"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
