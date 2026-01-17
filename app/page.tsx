import CategoryCard from "./components/CategoryCard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = 'force-dynamic';

interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  tags: string;
  comingSoon?: boolean;
}

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tags: string | null;
  coming_soon: boolean;
}

async function getTemplates(searchQuery?: string): Promise<Category[]> {
  try {
    let query = 'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE is_active = TRUE';
    const params: any[] = [];
    
    if (searchQuery) {
      query += ' AND (title LIKE ? OR tags LIKE ?)';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }
    
    query += ' ORDER BY display_order ASC';
    
    const [rows] = await pool.query<TemplateRow[]>(query, params);
    
    return rows.map((row: TemplateRow) => ({
      id: row.id,
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: row.description,
      image: row.image_url,
      tags: row.tags || '',
      comingSoon: row.coming_soon,
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const categories = await getTemplates(searchParams.search);
  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />

        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20"></div>

        {/* Categories Grid - Pinterest Masonry Style */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {searchParams.search && (
            <div className="mb-6">
              <p className="text-zinc-400">
                Search results for: <span className="text-yellow-400 font-semibold">{searchParams.search}</span>
              </p>
              <p className="text-zinc-500 text-sm mt-1">{categories.length} templates found</p>
            </div>
          )}
          
          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="break-inside-avoid">
                <CategoryCard
                  id={category.id}
                  title={category.title}
                  slug={category.slug}
                  description={category.description}
                  image={category.image}
                  comingSoon={category.comingSoon}
                />
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-400 text-lg">No templates found</p>
              <a href="/" className="text-yellow-400 hover:underline mt-2 inline-block">Clear search</a>
            </div>
          )}
        </section>

        <Footer />
      </div>
    </div>
  );
}
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
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20"></div>

        {/* Categories Grid - Pinterest Masonry Style */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="break-inside-avoid">
                <CategoryCard
                  id={category.id}
                  title={category.title}
                  description={category.description}
                  image={category.image}
                  comingSoon={category.comingSoon}
                />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-yellow-500/20 via-yellow-600/10 to-transparent border border-yellow-500/20 p-8 sm:p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6">
                Ready to Transform?
              </h3>
              <p className="text-base sm:text-xl text-zinc-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Join thousands of users creating stunning AI transformations every day
              </p>
              <button className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg sm:text-xl rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all transform hover:scale-105">
                Start Your Journey
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 bg-black/50 backdrop-blur-xl py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Features</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Gallery</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">About</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">API</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">Terms</a></li>
                  <li><a href="#" className="text-zinc-400 hover:text-yellow-400 transition-colors">License</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm sm:text-base text-zinc-500">&copy; 2026 Xirevoa AI. All rights reserved.</p>
              <div className="flex gap-3 sm:gap-4">
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
