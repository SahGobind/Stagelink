import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const PortfolioGallery = ({
  headshots = [],
  portfolioPhotos = [],
  photos = [], // fallback if flat array passed
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'headshots' | 'editorial'
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Normalize images
  const allHeadshots =
    headshots.length > 0
      ? headshots
      : photos.length > 0
      ? photos
      : [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        ];

  const allEditorial =
    portfolioPhotos.length > 0
      ? portfolioPhotos
      : [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        ];

  const displayedList =
    activeTab === 'headshots'
      ? allHeadshots.map((url, i) => ({ url, category: 'Headshot', title: `Headshot #${i + 1}` }))
      : activeTab === 'editorial'
      ? allEditorial.map((url, i) => ({ url, category: 'Editorial & Character Look', title: `Look #${i + 1}` }))
      : [
          ...allHeadshots.map((url, i) => ({ url, category: 'Headshot', title: `Headshot #${i + 1}` })),
          ...allEditorial.map((url, i) => ({ url, category: 'Editorial & Look', title: `Look #${i + 1}` })),
        ];

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : displayedList.length - 1));
    }
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev < displayedList.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-navy" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">Portfolio & Lookbook</h2>
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Industry standard 8x10 headshots, character tests, and production stills
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            All ({displayedList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('headshots')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'headshots'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Headshots ({allHeadshots.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('editorial')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'editorial'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Looks ({allEditorial.length})
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayedList.map((item, index) => (
          <div
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-2xs hover:shadow-card cursor-pointer transition-all duration-300"
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <span className="self-end p-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-300">{item.category}</p>
                <p className="text-xs font-semibold text-white truncate">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client-Side disclaimer note */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
        <span>Click any image to expand high-resolution preview</span>
        <span>Client session preview • 8x10 Portrait Standard</span>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && displayedList[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous image */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next image */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image Container */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayedList[lightboxIndex].url}
              alt={displayedList[lightboxIndex].title}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="text-center mt-4 text-white">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                {displayedList[lightboxIndex].category} ({lightboxIndex + 1} of{' '}
                {displayedList.length})
              </span>
              <h3 className="text-base font-semibold">{displayedList[lightboxIndex].title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioGallery;
