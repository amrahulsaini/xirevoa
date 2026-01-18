import CategoryCard from "./components/CategoryCard";
import CategoryRow from "./components/CategoryRow";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AutoScrollBanner from "./components/AutoScrollBanner";
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
  category?: string;
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
  const templates = await getTemplates(searchParams.search);
  
  // Fetch hairstyle templates (IDs 23-27)
  const hairstyleTemplates = templates.filter(t => [23, 24, 25, 26, 27].includes(t.id));
  
  // Fetch 80s templates (IDs 33, 34)
  const eightyTemplates = templates.filter(t => [33, 34].includes(t.id));
  
  // Fetch cinematic universe templates (IDs 28, 16, 35, 36, 10)
  const cinematicTemplates = templates.filter(t => [28, 16, 35, 36, 10].includes(t.id));
  
  // Fetch instagram collage templates (IDs 1, 8, 2, 9, 7)
  const instagramTemplates = templates.filter(t => [1, 8, 2, 9, 7].includes(t.id));
  
  // Fetch girls hairstyle templates (IDs 39, 40, 41, 42)
  const girlsHairstyleTemplates = templates.filter(t => [39, 40, 41, 42].includes(t.id));
  
  // If searching, show grid view
  if (searchParams.search) {
    return (
      <div className="min-h-screen bg-black">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
          <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
        </div>

        <div className="relative z-10">
          <Header />
          <div className="h-16 sm:h-20"></div>

          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-6">
              <p className="text-zinc-400">
                Search results for: <span className="text-yellow-400 font-semibold">{searchParams.search}</span>
              </p>
              <p className="text-zinc-500 text-sm mt-1">{templates.length} templates found</p>
            </div>
            
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
              {templates.map((category) => (
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

            {templates.length === 0 && (
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
  
  // Default view with category rows and masonry grid
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

        {/* Category Banners */}
        <section className="container mx-auto px-4 sm:px-6 pt-4 pb-2">
          <div className="relative">
            {/* Auto-scroll wrapper */}
            <div className="relative group">
              {/* Gradient overlays for scroll indication */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Auto-Scrollable container */}
              <AutoScrollBanner>
                {/* Hairstyle Banner */}
                {hairstyleTemplates.length > 0 && (
                  <a
                    href="/hairstyles"
                    className="flex-shrink-0 w-96 group/card bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20 overflow-hidden relative snap-start"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Single Preview Image */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-zinc-700 group-hover/card:border-yellow-500/50 transition-all flex-shrink-0">
                        <img src={hairstyleTemplates[0].image} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-white group-hover/card:text-yellow-400 transition-colors">
                          ✨ Choose Your Favourite Hairstyle
                        </h2>
                        <p className="text-xs text-zinc-400">
                          {hairstyleTemplates.length} amazing styles
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-yellow-400 group-hover/card:translate-x-1 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                )}

                {/* 80s Banner */}
                {eightyTemplates.length > 0 && (
                  <a
                    href="/how-would-you-see-yourself-in-80s"
                    className="flex-shrink-0 w-96 group/card bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20 overflow-hidden relative snap-start"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Single Preview Image */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-zinc-700 group-hover/card:border-yellow-500/50 transition-all flex-shrink-0">
                        <img src={eightyTemplates[0].image} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-white group-hover/card:text-yellow-400 transition-colors">
                          🕰️ See How You'd Look in Your 80s
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Transform into your future self
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-yellow-400 group-hover/card:translate-x-1 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                )}

                {/* Cinematic Universe Banner */}
                {cinematicTemplates.length > 0 && (
                  <a
                    href="/cinematic-universe"
                    className="flex-shrink-0 w-96 group/card bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20 overflow-hidden relative snap-start"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Single Preview Image */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-zinc-700 group-hover/card:border-yellow-500/50 transition-all flex-shrink-0">
                        <img src={cinematicTemplates[0].image} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-white group-hover/card:text-yellow-400 transition-colors">
                          🎬 Cinematic Universe
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Epic movie scenes & iconic moments
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-yellow-400 group-hover/card:translate-x-1 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                )}

                {/* Instagram Collage Banner */}
                {instagramTemplates.length > 0 && (
                  <a
                    href="/instagram-collage"
                    className="flex-shrink-0 w-96 group/card bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20 overflow-hidden relative snap-start"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Single Preview Image */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-zinc-700 group-hover/card:border-yellow-500/50 transition-all flex-shrink-0">
                        <img src={instagramTemplates[0].image} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-white group-hover/card:text-yellow-400 transition-colors">
                          📸 Instagram Collage Stories
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Perfect layouts for social media
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-yellow-400 group-hover/card:translate-x-1 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                )}
              </AutoScrollBanner>
            </div>
          </div>
        </section>

        {/* Exclusively for Girls Section */}
        {girlsHairstyleTemplates.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="text-center mb-8">
              <div className="inline-block relative animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full border-2 border-white/20 shadow-2xl">
                  <span className="text-white text-base sm:text-lg font-black tracking-wide drop-shadow-lg">
                    ✨ EXCLUSIVELY FOR GIRLS ✨
                  </span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 mt-6">
                Change Your Hairstyle
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Keep your beautiful face while trying stunning new hairstyles
              </p>
            </div>
            
            <div className="max-w-xl mx-auto">
              <a
                href="/change-your-hairstyle-girls"
                className="group relative block bg-gradient-to-br from-pink-900/40 via-purple-900/40 to-pink-900/40 rounded-3xl overflow-hidden border-2 border-pink-500/40 hover:border-pink-400/80 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/50"
              >
                {/* Image Grid - Show multiple templates in preview */}
                <div className="aspect-[4/5] overflow-hidden relative">
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {girlsHairstyleTemplates.slice(0, 4).map((template, index) => (
                      <div key={template.id} className="overflow-hidden">
                        <img 
                          src={template.image} 
                          alt=""
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-pink-500/50 max-w-sm">
                      <div className="mb-4">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold px-4 py-2 rounded-full inline-block shadow-lg">
                          💖 {girlsHairstyleTemplates.length} Hairstyles
                        </div>
                      </div>
                      <h3 className="text-white font-black text-2xl mb-2 group-hover:text-pink-300 transition-colors">
                        Change Your Hairstyle
                      </h3>
                      <p className="text-pink-200/90 text-sm mb-4">
                        Try stunning hairstyles while keeping your beautiful face resemblance
                      </p>
                      <div className="flex items-center justify-center gap-2 text-pink-400 font-bold group-hover:gap-3 transition-all">
                        <span>Explore Now</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </section>
        )}

        {/* All Templates Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">All Templates</h2>
          
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {templates.map((category) => (
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
        </section>

        <Footer />
      </div>
    </div>
  );
}
