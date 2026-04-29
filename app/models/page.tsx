import Header from "../components/Header";
import Footer from "../components/Footer";

const models = [
  {
    name: "Gemini",
    description: "Google's multimodal model for fast, high-quality image and text generation workflows.",
  },
  {
    name: "Nano Banana Pro",
    description: "A compact creative model for quick visual drafts and lightweight generations.",
  },
  {
    name: "Nano Banana Pro 2",
    description: "A refined second version focused on sharper outputs and better prompt control.",
  },
  {
    name: "ChatGPT Image 2",
    description: "An image model style used for rich prompt understanding and polished artwork generation.",
  },
  {
    name: "Ideogram",
    description: "Strong for typography-aware visuals, posters, and social-ready compositions.",
  },
  {
    name: "Flux",
    description: "A modern image model for detailed renders, stylized scenes, and high-fidelity results.",
  },
  {
    name: "Stable Diffusion XL",
    description: "A flexible open ecosystem model for creative image generation and fine-tuned styles.",
  },
  {
    name: "Midjourney",
    description: "A visually striking model known for cinematic composition and aesthetic richness.",
  },
];

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="h-16 sm:h-20" />

      <main className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mb-10">
          <p className="text-yellow-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3">Models</p>
          <h1 className="text-3xl sm:text-5xl font-black mb-4">Our AI model lineup</h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-7">
            This page lists the AI models and model families we surface across Xirevoa. The focus is on fast iteration, strong visual quality, and a mix of creative and practical generation options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {models.map((model) => (
            <article key={model.name} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{model.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{model.description}</p>
                </div>
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-yellow-300">
                  AI
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}