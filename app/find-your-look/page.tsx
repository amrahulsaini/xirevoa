import FindYourLookClient from '../components/FindYourLookClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryRow from '../components/CategoryRow';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Find Your Look - AI Hairstyle Recommendations | Xirevoa',
  description: 'Upload your photo and let AI recommend the best hairstyles for your face shape. Get personalized hairstyle suggestions with AI.',
};

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tags: string | null;
  coming_soon: boolean;
}

interface Template {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  tags: string;
  comingSoon?: boolean;
}

async function getHairstyleTemplates(): Promise<Template[]> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (23, 24, 25, 26, 27) AND is_active = TRUE ORDER BY display_order ASC'
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
    console.error('Error fetching templates:', error);
    return [];
  }
}

async function getRelatedCategories() {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (43, 44, 45, 46, 47, 48, 28, 29, 30, 31, 32) AND is_active = TRUE ORDER BY display_order ASC'
    );
    
    const allTemplates = rows.map((row: TemplateRow) => ({
      id: row.id,
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: row.description,
      image: row.image_url,
      tags: row.tags || '',
      comingSoon: row.coming_soon,
    }));

    return {
      outfits: allTemplates.filter(t => [43, 44, 45, 46, 47, 48].includes(t.id)),
      eighties: allTemplates.filter(t => [28, 29, 30, 31, 32].includes(t.id)),
    };
  } catch (error) {
    console.error('Error fetching related categories:', error);
    return { outfits: [], eighties: [] };
  }
}

export default async function FindYourLookPage() {
  const hairstyleTemplates = await getHairstyleTemplates();
  const relatedCategories = await getRelatedCategories();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-20">
        <FindYourLookClient hairstyleTemplates={hairstyleTemplates} />
        
        {/* Related Categories */}
        <div className="container mx-auto px-4 py-16">
          <CategoryRow 
            categoryName="Iconic Outfits"
            templates={relatedCategories.outfits}
          />
          <CategoryRow 
            categoryName="80s Style"
            templates={relatedCategories.eighties}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
