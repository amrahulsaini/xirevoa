import CategoryCard from "./components/CategoryCard";
import CategoryRow from "./components/CategoryRow";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AutoScrollBanner from "./components/AutoScrollBanner";
import FeaturedBanner from "./components/FeaturedBanner";
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
      query += ' AND (title LIKE ? OR tags LIKE ? OR description LIKE ?)';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
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
  
  // Fetch jewellery templates (IDs 62-70)
  const jewelleryTemplates = templates.filter(t => [62, 63, 64, 65, 66, 67, 68, 69, 70].includes(t.id));
  
  // Fetch outfit templates (IDs 43-50)
  const outfitTemplates = templates.filter(t => [43, 44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60].includes(t.id));
  
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
            {/* Search Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Search Results
                  </h2>
                  <p className="text-zinc-400">
                    Showing results for: <span className="text-yellow-400 font-semibold">"{searchParams.search}"</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2">
                    <span className="text-yellow-400 font-bold text-lg">{templates.length}</span>
                    <span className="text-zinc-400 text-sm ml-2">found</span>
                  </div>
                  <a 
                    href="/" 
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-400 hover:text-yellow-400 transition-colors text-sm font-medium"
                  >
                    Clear Search
                  </a>
                </div>
              </div>
            </div>
            
            {/* Search Results Grid */}
            {templates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {templates.map((category) => (
                  <div key={category.id} className="group">
                    <CategoryCard
                      id={category.id}
                      title={category.title}
                      slug={category.slug}
                      description={category.description}
                      image={category.image}
                      comingSoon={category.comingSoon}
                    />
                    {/* Show tags if available */}
                    {category.tags && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {category.tags.split(',').slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-400"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-800/50 border-2 border-zinc-700 rounded-full mb-6">
                  <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Templates Found</h3>
                <p className="text-zinc-400 mb-6">
                  We couldn't find any templates matching "{searchParams.search}"
                </p>
                <a 
                  href="/" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Browse All Templates
                </a>
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
      {/* Featured Banner */}
      <FeaturedBanner />
      
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
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full border-2 border-white/20 shadow-2xl">
                  <span className="text-white text-base sm:text-lg font-black tracking-wide drop-shadow-lg typing-animation">
                    ✨ EXCLUSIVELY FOR GIRLS ✨
                  </span>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
              {/* Hairstyles Card */}
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

              {/* Jewelleries Card */}
              {jewelleryTemplates.length > 0 && (
                <a
                  href="/view-your-jewelleries"
                  className="group relative block bg-gradient-to-br from-yellow-900/40 via-amber-900/40 to-yellow-900/40 rounded-3xl overflow-hidden border-2 border-yellow-500/40 hover:border-yellow-400/80 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50"
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <div className="grid grid-cols-2 gap-1 h-full">
                      {jewelleryTemplates.slice(0, 4).map((template, index) => (
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
                      <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-500/50 max-w-sm">
                        <div className="mb-4">
                          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-sm font-bold px-4 py-2 rounded-full inline-block shadow-lg">
                            💎 {jewelleryTemplates.length} Jewelleries
                          </div>
                        </div>
                        <h3 className="text-white font-black text-2xl mb-2 group-hover:text-yellow-300 transition-colors">
                          Try Best Jewelleries
                        </h3>
                        <p className="text-yellow-200/90 text-sm mb-4">
                          Discover elegant necklaces, earrings & accessories that enhance your beauty
                        </p>
                        <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold group-hover:gap-3 transition-all">
                          <span>Explore Now</span>
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              )}

              {/* Iconic Outfits Card */}
              <a
                href="/view-your-iconic-outfit"
                className="group relative block bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-purple-900/40 rounded-3xl overflow-hidden border-2 border-purple-500/40 hover:border-purple-400/80 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  {/* Show outfit templates if available, otherwise placeholder */}
                  {outfitTemplates.length > 0 ? (
                    <>
                      {/* Grid of 4 outfit images */}
                      <div className="grid grid-cols-2 gap-1 h-full">
                        {outfitTemplates.slice(0, 4).map((template) => (
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
                        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/50 max-w-sm">
                          <div className="mb-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full inline-block shadow-lg">
                              ✨ {outfitTemplates.length} Outfits
                            </div>
                          </div>
                          <h3 className="text-white font-black text-2xl mb-2 group-hover:text-purple-300 transition-colors">
                            View Your Iconic Outfit
                          </h3>
                          <p className="text-purple-200/90 text-sm mb-4">
                            Upload your photo and see yourself wearing iconic outfits
                          </p>
                          <div className="flex items-center justify-center gap-2 text-purple-400 font-bold group-hover:gap-3 transition-all">
                            <span>Try It Now</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="text-8xl animate-bounce">👗</div>
                          <div className="text-white font-black text-xl">
                            Outfit Templates
                          </div>
                          <div className="text-purple-200 text-sm px-8">
                            Add outfit photo (ID 43) to see it here
                          </div>
                        </div>
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      
                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/50 max-w-sm">
                          <div className="mb-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full inline-block shadow-lg">
                              ✨ NEW FEATURE
                            </div>
                          </div>
                          <h3 className="text-white font-black text-2xl mb-2 group-hover:text-purple-300 transition-colors">
                            View Your Iconic Outfit
                          </h3>
                          <p className="text-purple-200/90 text-sm mb-4">
                            Upload your photo and see yourself wearing iconic outfits
                          </p>
                          <div className="flex items-center justify-center gap-2 text-purple-400 font-bold group-hover:gap-3 transition-all">
                            <span>Try It Now</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </a>
            </div>
          </section>
        )}

        {/* All Templates Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">All Templates</h2>
          
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {templates.slice(0, 5).map((category) => (
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

          {/* Banner after first 5 templates */}
          <div className="my-8 w-full">
            <div className="relative w-full overflow-hidden rounded-2xl border-2 border-zinc-800 hover:border-yellow-500/50 transition-all">
              <img 
                src="/hero-banner.png" 
                alt="Banner"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Remaining templates */}
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {templates.slice(5).map((category) => (
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
