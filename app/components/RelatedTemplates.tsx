import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import CategoryCard from "./CategoryCard";

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tags: string | null;
  coming_soon: boolean;
}

async function getRelatedTemplates(currentTemplateId: number, tags: string) {
  try {
    // Get all templates sorted by display_order
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE is_active = TRUE AND id != ? ORDER BY display_order ASC',
      [currentTemplateId]
    );
    
    return rows;
  } catch (error) {
    console.error('Error fetching related templates:', error);
    return [];
  }
}

export default async function RelatedTemplates({
  currentTemplateId,
  tags,
}: {
  currentTemplateId: number;
  tags: string;
}) {
  const templates = await getRelatedTemplates(currentTemplateId, tags);

  if (templates.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">
        Related Templates
      </h2>
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
        {templates.map((template) => {
          const slug = template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <div key={template.id} className="break-inside-avoid">
              <CategoryCard
                id={template.id}
                title={template.title}
                slug={slug}
                description={template.description}
                image={template.image_url}
                comingSoon={template.coming_soon}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
