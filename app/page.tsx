import CategoryCard from "./components/CategoryCard";
import CategoryRow from "./components/CategoryRow";
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

        {/* Hairstyle Banner */}
        {hairstyleTemplates.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 pt-4 pb-2">
            <a
              href="/hairstyles"
              className="block group bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl p-4 border border-zinc-700 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4 relative z-10">
                {/* Mini Preview Images */}
                <div className="flex -space-x-3">
                  {hairstyleTemplates.slice(0, 3).map((t, i) => (
                    <div key={t.id} className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-zinc-700 group-hover:border-yellow-500/50 transition-all" style={{ zIndex: 3 - i }}>
                      <img src={t.image} alt="" className="w-full h-full object-cover object-top" />
                    </div>
                  ))}
                </div>
                
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                    ✨ Choose Your Favourite Hairstyle
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {hairstyleTemplates.length} amazing styles waiting for you
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-yellow-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </section>
        )}

        {/* All Templates Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">All Templates</h2>
          
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
        </section>

        <Footer />
      </div>
    </div>
  );
}
