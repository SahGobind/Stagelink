import React, { useState } from 'react';
import { Play, Film, ExternalLink, X } from 'lucide-react';

const VideoReelsSection = ({ introVideo, actingReel }) => {
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const defaultIntro = {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Performer Introduction Slate & Pitch (60s)',
    duration: '1:02',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    description: 'Casual slate detailing primary accents, height, recent availability, and personal artistic statement.',
  };

  const defaultReel = {
    url: 'https://vimeo.com/76979871',
    title: 'Dramatic & Action Showreel 2025/2026',
    duration: '2:45',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    description: 'Compilation of high-intensity dramatic monologues, screen combat choreography, and television guest arcs.',
  };

  const currentIntro = introVideo?.url ? { ...defaultIntro, ...introVideo } : defaultIntro;
  const currentReel = actingReel?.url ? { ...defaultReel, ...actingReel } : defaultReel;

  const openVideo = (video, type) => {
    setActiveVideoModal({ ...video, type });
  };

  const closeVideo = () => setActiveVideoModal(null);

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-navy" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">Video Showreels & Audition Tapes</h2>
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Verified video slates and dramatic clips reviewed directly by casting directors
          </p>
        </div>
        <span className="text-xs font-semibold text-brand-navy bg-gray-100 px-3 py-1 rounded-full">
          2 Clips Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intro Video Card */}
        <div className="group border border-gray-200/80 rounded-2xl p-4 bg-gray-50/50 hover:bg-white hover:border-gray-400 hover:shadow-card transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-xs">
              <img
                src={currentIntro.thumbnail || defaultIntro.thumbnail}
                alt="Intro Video Thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => openVideo(currentIntro, 'Introduction Slate')}
                  className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  aria-label="Play Introduction Video"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                {currentIntro.duration}
              </span>
              <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                Intro Slate
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-brand-navy">{currentIntro.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {currentIntro.description}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => openVideo(currentIntro, 'Introduction Slate')}
              className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Watch Slate</span>
            </button>
            <a
              href={currentIntro.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-[11px]"
            >
              <span>Source Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Acting Reel Card */}
        <div className="group border border-gray-200/80 rounded-2xl p-4 bg-gray-50/50 hover:bg-white hover:border-gray-400 hover:shadow-card transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-xs">
              <img
                src={currentReel.thumbnail || defaultReel.thumbnail}
                alt="Acting Reel Thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => openVideo(currentReel, 'Dramatic Showreel')}
                  className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  aria-label="Play Acting Showreel"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                {currentReel.duration}
              </span>
              <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                Dramatic Reel
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-brand-navy">{currentReel.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {currentReel.description}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => openVideo(currentReel, 'Dramatic Showreel')}
              className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Watch Reel</span>
            </button>
            <a
              href={currentReel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-[11px]"
            >
              <span>Source Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Video Player Preview Modal */}
      {activeVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={closeVideo}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 text-white">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  {activeVideoModal.type}
                </span>
                <h3 className="text-sm sm:text-base font-bold">{activeVideoModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={closeVideo}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Close video player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport / Demo Simulator */}
            <div className="relative aspect-video bg-black flex items-center justify-center text-white">
              <div className="text-center p-8 space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-white">
                  <Film className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold">Simulated StageLink Media Stream</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Playing {activeVideoModal.title} from host link:
                  </p>
                  <p className="text-[11px] text-zinc-300 font-mono mt-1 break-all bg-black/50 p-2 rounded-lg border border-zinc-800">
                    {activeVideoModal.url}
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href={activeVideoModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors"
                  >
                    <span>Open in External Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950 text-xs text-zinc-400 flex items-center justify-between">
              <span>Duration: {activeVideoModal.duration}</span>
              <span>Client-side playback simulator</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoReelsSection;
