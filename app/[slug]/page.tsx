import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import TemplateGenerator from "@/app/components/TemplateGenerator";
import RelatedTemplates from "@/app/components/RelatedTemplates";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface TemplateData extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  ai_prompt: string | null;
  tags: string | null;
}

interface OutfitTemplateData extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  outfit_image_url: string;
  ai_prompt: string | null;
  category: string;
}

async function getTemplateBySlug(slug: string) {
  try {
    // Check regular templates first
    const [rows] = await pool.query<TemplateData[]>(
      'SELECT id, title, description, image_url, ai_prompt, tags FROM templates WHERE is_active = TRUE'
    );
    
    const template = rows.find(row => {
      const templateSlug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return templateSlug === slug;
    });
    
    if (template) {
      return {
        id: template.id,
        title: template.title,
        description: template.description,
        image: template.image_url,
        aiPrompt: template.ai_prompt || '',
        tags: template.tags || '',
        isOutfit: false,
      };
    }
    
    // Check outfit templates
    const [outfitRows] = await pool.query<OutfitTemplateData[]>(
      'SELECT id, name, description, outfit_image_url, ai_prompt, category FROM outfit_templates WHERE is_active = TRUE'
    );
    
    const outfitTemplate = outfitRows.find(row => {
      const templateSlug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return templateSlug === slug;
    });
    
    if (outfitTemplate) {
      return {
        id: outfitTemplate.id,
        title: outfitTemplate.name,
        description: outfitTemplate.description,
        image: outfitTemplate.outfit_image_url,
        aiPrompt: outfitTemplate.ai_prompt || '',
        tags: outfitTemplate.category || '',
        isOutfit: true,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

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

        {/* Template Generator Section */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <TemplateGenerator 
            template={template} 
            isOutfit={template.isOutfit} 
            tags={template.tags}
            relatedTemplatesSlot={<RelatedTemplates currentTemplateId={template.id} tags={template.tags} />}
          />
        </section>

        <Footer />
      </div>
    </div>
  );
}
