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
            
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
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

        {/* All Templates Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">All Templates</h2>
          
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
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
