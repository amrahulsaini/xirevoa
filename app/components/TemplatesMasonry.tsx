import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import CategoryCard from "./CategoryCard";

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tags: string | null;
  category: string | null;
  coming_soon: boolean;
}

async function getTemplates(currentTemplateId: number) {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      "SELECT id, title, description, image_url, tags, category, coming_soon FROM templates WHERE is_active = TRUE AND id != ? ORDER BY display_order ASC",
      [currentTemplateId]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [] as TemplateRow[];
  }
}

export default async function TemplatesMasonry({
  currentTemplateId,
  tags,
  category,
}: {
  currentTemplateId: number;
  tags?: string;
  category?: string;
}) {
  const rows = await getTemplates(currentTemplateId);

  const tagArray = (tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // Prioritize: 1. Same category, 2. Matching tags, 3. Others (all in display order)
  const categoryTemplates: TemplateRow[] = [];
  const tagMatchTemplates: TemplateRow[] = [];
  const otherTemplates: TemplateRow[] = [];

  for (const row of rows) {
    // Check if same category (and category is not empty/null)
    if (category && row.category && row.category.toLowerCase() === category.toLowerCase()) {
      categoryTemplates.push(row);
    }
    // Check if tags match (but not already in category list)
    else if (tagArray.length && tagArray.some((tag) =>
      (row.tags || "").toLowerCase().includes(tag.toLowerCase())
    )) {
      tagMatchTemplates.push(row);
    }
    // Everything else
    else {
      otherTemplates.push(row);
    }
  }

  const templates = [...categoryTemplates, ...tagMatchTemplates, ...otherTemplates];

  if (templates.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">More templates</h2>
      </div>

      <div className="columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-4 [column-fill:_balance]">
        {templates.map((template) => {
          const slug = template.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

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
