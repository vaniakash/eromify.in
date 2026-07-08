'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LayoutTemplate, Search, Filter } from 'lucide-react';
import { TemplateModal } from './TemplateModal';

const MOCK_TEMPLATES = [
  { id: '1', src: '/avatar/sofia.webp', alt: 'Sofia Template 1', category: 'Female' },
  // More templates will be added later
];

export function TemplateGalleryClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof MOCK_TEMPLATES[0] | null>(null);
  const [filter, setFilter] = useState('All');

  const filteredTemplates = filter === 'All' 
    ? MOCK_TEMPLATES 
    : MOCK_TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="flex flex-col min-h-full bg-[#0a0a0f]">
      {/* Header Area */}
      <div className="px-8 py-8 border-b border-white/5 bg-[#0d0d14] sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              Template Gallery
            </h1>
            <p className="text-slate-400 text-sm">
              Choose a base AI model template for your influencers.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search templates..."
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all w-full md:w-64"
              />
            </div>
            <button className="h-[42px] px-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="max-w-screen-2xl mx-auto mt-6 flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {['All', 'Female', 'Male', 'Anime', 'Realistic', '3D Render'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                filter === cat 
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-8 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="group cursor-pointer relative rounded-2xl overflow-hidden bg-[#151520] aspect-[3/4] border border-white/5 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300"
            >
              <Image 
                src={template.src}
                alt={template.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button className="w-full py-2 bg-white/20 backdrop-blur-md text-white font-bold text-sm rounded-lg hover:bg-white/30 transition-colors">
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 font-medium">No templates found for "{filter}"</p>
          </div>
        )}
      </div>

      <TemplateModal 
        template={selectedTemplate} 
        onClose={() => setSelectedTemplate(null)} 
      />
    </div>
  );
}
