import CategoryCard from "@/app/components/CategoryCard";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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

async function getJewelleryTemplates(): Promise<Category[]> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (62, 63, 64, 65, 66, 67, 68, 69, 70) AND is_active = TRUE ORDER BY display_order ASC'
    );
    
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
    console.error('Error fetching jewellery templates:', error);
    return [];
  }
}

export default async function ViewYourJewelleriesPage() {
  const jewelleries = await getJewelleryTemplates();

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background with Gold/Amber theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />

        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20"></div>

        <section className="container mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full mb-4 border border-yellow-500/30">
              <span className="text-yellow-400 text-sm font-bold">💎 Elegant Jewellery Collection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent animate-gradient">
              View Your Best Jewelleries
            </h1>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Discover elegant necklaces, earrings & accessories that enhance your beauty. Try on stunning jewellery and see yourself shine! ✨
            </p>
          </div>
        </section>

        {jewelleries.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">💎 Choose Your Favourite Jewellery</h2>
              <p className="text-zinc-400">Explore our collection of beautiful necklaces, earrings & accessories</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {jewelleries.map((template) => (
                <div key={template.id} className="break-inside-avoid">
                  <CategoryCard
                    id={template.id}
                    title={template.title}
                    slug={template.slug}
                    description={template.description}
                    image={template.image}
                    comingSoon={template.comingSoon}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {jewelleries.length === 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-16 text-center">
            <p className="text-zinc-400 text-lg">No jewellery templates available at the moment.</p>
          </section>
        )}

        <Footer />
      </div>
    </div>
  );
}
