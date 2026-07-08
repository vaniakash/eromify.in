"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowLeft, Copy, Check, Lock, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const influencers = [
  {
    name: "Emma Watson", image: "/sofia/image.webp", prompt: `A high-quality outdoor lifestyle portrait of a stylish young woman in her early 20s with a fair-to-light warm skin tone, photographed sitting casually in a sunlit urban garden or upscale café courtyard setting during bright natural daylight. Her body is angled slightly sideways in a relaxed seated pose, one hand gently raised toward her sunglasses as if adjusting them naturally, creating an effortless candid luxury street-style aesthetic.

Maintain strict facial identity consistency with the reference image: identical facial structure, same eye shape and spacing, same nose proportions, same lip shape and fullness, same eyebrow density and placement, same jawline softness, and same skin undertones—no facial alteration, no beautification drift, no identity morphing. Preserve the exact same subject.

Her dark brown hair is styled into a relaxed low ponytail with soft volume and silky texture, with loose curled face-framing strands falling naturally around the cheeks and jawline. Realistic flyaways catch the sunlight softly. Her expression is calm, polished, and naturally confident—slightly parted lips, relaxed jawline, and effortless feminine composure.

Bright natural sunlight illuminates the face from a soft side angle, creating warm luminous highlights across the cheekbones, lips, collarbones, jawline, and loose hair strands, while subtle natural shadows sculpt the face softly. The light feels crisp, clean, and luxurious—like premium outdoor editorial photography captured candidly.

Emphasize ultra-realistic skin texture: visible pores, soft peach fuzz, subtle natural blush, faint freckles, delicate skin sheen, slight redness, and tiny authentic imperfections—no smoothing, no airbrushing, no plastic skin effect. Skin should feel healthy, naturally radiant, and completely lifelike.

She wears an elevated casual luxury outfit: a soft beige cropped lightweight trench-style jacket with visible cotton texture, natural folds, realistic stitching, and softly structured tailoring layered over a crisp light-blue striped collared shirt with subtle fabric grain and clean fold lines. High-waisted denim jeans feature premium wash texture, realistic stitching, and natural creasing.

Accessories are refined and understated: a luxury beige baseball cap with soft embroidery detail, elegant round-frame sunglasses with lightly tinted lenses and subtle metallic reflections, a delicate silver or diamond tennis necklace catching small highlights naturally, fine rings, and a structured designer crossbody bag with premium woven strap detailing and soft leather texture.

The background features black-framed glass windows, lush greenery, climbing vines, soft botanical textures, and warm sunlight filtering naturally through leaves. Background remains softly blurred with elegant depth of field, enhancing the premium editorial lifestyle mood.

Shot on a modern smartphone or mirrorless camera with a 35mm equivalent lens, medium portrait framing, slightly eye-level perspective. Clean contemporary color grading with warm daylight tones, crisp contrast, and accurate skin color. Ultra-detailed 8K resolution, sharp yet natural focus, crisp realism without halos or artificial sharpening. Authentic sporty-luxury influencer UGC aesthetic with premium editorial realism.

Style keywords: sporty chic luxury, elevated casual fashion, soft old-money aesthetic, luxury streetwear, polished feminine confidence, Pinterest luxury realism, premium influencer editorial, candid luxury UGC, fixed identity, same person consistency.` },
  { name: "Olivia Davis", image: "/sofia/s.webp", prompt: "Your prompt for Olivia Davis goes here..." },
  {
    name: "Sophia Taylor", image: "/sofia/soff.webp", prompt: `A high-quality intimate indoor lifestyle portrait of a glamorous young woman in her early 20s with a fair-to-light warm skin tone, photographed relaxing comfortably on a luxurious hotel bed in a modern premium suite at night. She sits casually against plush white pillows with soft relaxed posture, one hand lightly raised toward her lips while holding a potato chip in a playful candid moment, creating a polished yet spontaneous influencer aesthetic.
Maintain strict facial identity consistency with the reference image: identical facial structure, same eye shape and spacing, same nose proportions, same lip shape and fullness, same brows, same jawline softness, and same skin undertones—no facial alteration, no beautification drift, no identity morphing. Preserve the exact same subject.
Her long golden-blonde hair falls smoothly over her shoulders and chest in soft voluminous waves, with silky shine, realistic strands, and subtle flyaways. Her expression is relaxed, luxurious, and softly flirtatious—slightly parted lips, luminous eyes looking off-camera, calm confidence, effortless glamour.
She wears soft pink over-ear wireless headphones with realistic matte texture and subtle highlights, paired with translucent pink under-eye gel patches resting naturally beneath the eyes, enhancing the late-night self-care luxury vibe.
Warm ambient hotel lighting from wall sconces and bedside lamps casts rich golden highlights across her forehead, cheekbones, shoulders, collarbones, and hair, with gentle shadows contouring the jawline and neckline. The lighting feels intimate, cinematic, and naturally premium.
Emphasize ultra-realistic skin texture: visible pores, soft peach fuzz, subtle blush tones, natural skin sheen, faint freckles, tiny imperfections, and delicate facial texture—no smoothing, no airbrushing, no plastic skin effect.
She wears a fitted silky silver-white cropped tank top with subtle sheen, visible stretch texture, and realistic fabric folds, paired with delicate diamond jewelry—minimal necklace, bracelets, rings, and elegant wrist accessories catching warm highlights naturally.
In front of her rests an open sleek laptop on the bed with soft screen glow reflecting subtly on surrounding fabrics. Beside her are casual indulgent snacks—an open bag of potato chips, chocolate bars, and soda cans placed naturally on the bed and bedside table, reinforcing a cozy luxury binge-night aesthetic.
The background features premium hotel interior details: marble-textured walls, warm brass sconces, plush bedding, designer headboard upholstery, a sleek bedside phone, and subtle upscale decor. Soft shadows and warm tones create a rich modern luxury atmosphere.
Shot on a modern smartphone or mirrorless camera with a 28–35mm equivalent lens, close-to-medium framing, slightly elevated angle. Clean contemporary color grading with warm cinematic highlights and accurate skin tones. Ultra-detailed 8K resolution, sharp yet natural focus, crisp realism, no halos or artificial clarity. Authentic luxury influencer lifestyle UGC aesthetic with premium editorial realism.
Style keywords: luxury hotel vibe, cozy glam, late-night indulgence, self-care aesthetic, candid luxury, premium influencer realism, intimate editorial UGC, fixed identity, same person consistency.` },
  {
    name: "Isabella Moore",
    image: "/sofia/sofia.webp",
    prompt: `A high-quality indoor glamour portrait of a confident young woman in her early 20s with a warm light-to-medium skin tone, photographed seated elegantly indoors during nighttime in a luxury home or upscale apartment setting. She sits with poised posture on a modern upholstered chair, body angled softly toward the camera, one arm resting naturally across her waist while the other hand relaxes gently at her side, creating a polished, feminine, editorial silhouette with strong presence.

Maintain strict facial identity consistency with the reference image: identical facial structure, same eye shape and spacing, same nose proportions, same lip shape and fullness, same eyebrow density and placement, same jawline softness, and same skin undertones—no facial alteration, no beautification drift, no identity morphing. Preserve the exact same subject.

Her long dark brunette hair falls smoothly over her shoulders and back in soft silky layers, with rich shine, realistic strands, subtle volume, and delicate flyaways catching the light naturally. Hair frames the face elegantly, enhancing the portrait’s luxe glamour mood.

Her expression is composed, alluring, and confident—softly parted full lips, intense direct gaze toward the camera, relaxed brows, and refined feminine confidence. Makeup is polished yet realistic: softly defined eyes, elegant eyeliner, subtle contour warmth, natural blush, and softly glossy lips with authentic texture.

Bright direct flash photography illuminates the face, shoulders, collarbones, and hair evenly, creating luminous highlights on the cheekbones, nose bridge, lips, and skin contours while softly separating the subject from the darker background. Shadows remain clean and natural, producing a premium editorial flash-photography aesthetic.

Emphasize ultra-realistic skin texture: visible pores, soft peach fuzz, subtle natural skin sheen, faint freckles, delicate blush tones, tiny imperfections, and realistic skin depth—no smoothing, no airbrushing, no plastic skin effect. Skin should feel radiant, healthy, and lifelike under flash lighting.

She wears a fitted sage-green sleeveless body-contour dress with thin straps, visible stretch-knit texture, soft fabric sheen, realistic folds, and elegant draping that follows natural body lines. A delicate fine gold necklace rests softly at the collarbone, catching subtle highlights and adding understated luxury.

The background features refined interior elements—classic white framed glass doors, exposed brick texture, soft architectural contrast, and warm ambient shadows—creating a sophisticated upscale evening atmosphere. Background remains softly subdued while preserving environmental realism.

Shot on a modern smartphone or mirrorless camera with a 35–50mm equivalent lens, medium portrait framing, slightly eye-level perspective, premium direct flash aesthetic. Clean contemporary color grading with rich skin warmth, crisp contrast, and accurate tones. Ultra-detailed 8K resolution, sharp yet natural focus, crisp realism without halos or artificial sharpening. Authentic high-glam influencer UGC aesthetic with premium editorial realism.

Style keywords: night luxe, glamorous feminine energy, moody flash portrait, luxury editorial beauty, upscale indoor aesthetic, polished confidence, premium influencer realism, cinematic glam UGC, fixed identity, same person consistency.`
  },
  { name: "Mia Anderson", image: "/sofia/sofiaaa.webp", prompt: "Your prompt for Mia Anderson goes here..." },
  {
    name: "Charlotte White", image: "/sofia/sofiiiia.webp", prompt:

      `A high-quality intimate close-up selfie portrait of a young woman in her early 20s with a fair-to-light warm skin tone, photographed from a slightly elevated close angle in soft natural daylight near a bright window. The framing is tight on the face, shoulders, and upper chest, creating a warm, personal, beauty-focused portrait with effortless feminine energy.

Maintain strict facial identity consistency with the reference image: identical facial structure, same eye shape and spacing, same nose proportions, same lip shape and fullness, same eyebrow density and placement, same jawline softness, and same skin undertones—no facial alteration, no beautification drift, no identity morphing. Preserve the exact same subject.

Her rich medium-brown hair falls naturally in soft voluminous waves around her face and shoulders, with silky texture, realistic strands, subtle movement, and delicate flyaways illuminated softly by sunlight. Hair frames one side of the face gently, creating depth and softness.

Her expression is playful, warm, and intimate—a soft closed-lip smile with one eye gently winking toward the camera, relaxed brows, luminous eye detail, and naturally confident feminine charm. Lips appear soft, hydrated, and naturally textured.

Soft warm daylight illuminates her face evenly from a nearby window, creating luminous highlights across the cheekbones, nose bridge, lips, collarbones, and hair strands, while gentle shadows contour the jawline and neckline naturally. The lighting feels airy, flattering, and completely organic.

Emphasize ultra-realistic skin texture: visible pores, fine peach fuzz, soft natural blush across cheeks, subtle freckles, delicate skin sheen, faint redness, and tiny imperfections—no smoothing, no airbrushing, no plastic skin effect. Skin should feel alive, authentic, and radiant.

She wears a minimal elegant white halter-style textured top with soft woven fabric detail, natural folds, and gentle neckline structure. Around her neck rests a delicate gold chain necklace with a subtle pendant, catching tiny warm highlights naturally.

The softly blurred background is bright, minimal, and neutral-toned, with hints of soft interior textures, keeping full focus on the face while maintaining natural realism.

Shot on a modern smartphone or mirrorless camera with a 28–35mm equivalent lens, close portrait framing, slightly elevated angle. Clean contemporary color grading with warm highlights, soft contrast, and accurate skin tones. Ultra-detailed 8K resolution, sharp yet natural focus, crisp realism without halos or artificial clarity. Authentic clean-beauty influencer UGC aesthetic with premium editorial realism.

Style keywords: clean girl beauty, intimate close-up selfie, feminine soft glow, warm daylight portrait, fresh natural glam, luxury beauty realism, premium influencer UGC, fixed identity, same person consistency.` },
];

export default function ExploreClient() {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isUserPro, setIsUserPro] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsUserPro(localStorage.getItem("eromify_pro") === "true");
    const handler = () => setIsUserPro(localStorage.getItem("eromify_pro") === "true");
    window.addEventListener("eromify_pro_updated", handler);
    return () => window.removeEventListener("eromify_pro_updated", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header / Hero */}
      <section className="bg-white border-b border-slate-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1736cf] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
              Community
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10">
              Discover trending AI influencers
            </p>
          </div>

          {/* Poster Section */}
          <div className="relative w-full mx-auto rounded-3xl shadow-2xl max-w-5xl bg-slate-900 overflow-hidden">
            <Image
              src="/influencer.webp"
              alt="Trending Influencers"
              width={1600}
              height={900}
              className="w-full h-auto object-contain block"
            />
            {/* Overlay Button */}
            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10">
              <Link
                href="/tools/creator"
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold hover:bg-white hover:scale-105 transition-all shadow-lg text-sm md:text-base border border-slate-200/50"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#1736cf]" />
                Generate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {influencers.map((influencer, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 flex-1">
                <Image
                  src={influencer.image}
                  alt={influencer.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
              </div>
              <div className="p-4 text-center border-t border-slate-100 flex flex-col gap-3">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1736cf] transition-colors truncate">
                  {influencer.name}
                </h3>

                {isUserPro ? (
                  <button
                    onClick={() => setSelectedPrompt(influencer.prompt)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-xl text-sm transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#1736cf]" />
                    View Prompt
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/pricing")}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-sm transition-all border border-amber-200 flex items-center justify-center gap-1.5 group/lock"
                  >
                    <Lock className="w-3.5 h-3.5 group-hover/lock:hidden" />
                    <Crown className="w-3.5 h-3.5 hidden group-hover/lock:block text-amber-600" />
                    <span>Pro Only</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Prompt Modal */}
      {selectedPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedPrompt(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1736cf]" />
                Generation Prompt
              </h3>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 md:p-6 mb-6 border border-slate-100 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {selectedPrompt}
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setSelectedPrompt(null)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition-colors w-full sm:w-auto text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedPrompt) {
                    navigator.clipboard.writeText(selectedPrompt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="px-6 py-2.5 bg-[#1736cf] text-white rounded-full font-bold hover:bg-[#1430b8] transition-colors w-full sm:w-auto flex items-center justify-center gap-2 text-sm shadow-md"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Prompt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
