import React, { useState } from 'react';
import {
  Video,
  FileText,
  ExternalLink,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  X,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const PortfolioModal = ({ isOpen, onClose, candidate, application }) => {
  if (!candidate && !application) return null;

  const cand = candidate || application.candidate || {};
  const portfolio = cand.portfolio || cand.portfolio_data || {};
  const submitted = application?.submittedMaterials || application?.submitted_materials || {};

  const headshots = [
    ...(portfolio.headshots || []),
    ...(portfolio.portfolioPhotos || []),
    ...(submitted.headshot ? [submitted.headshot] : []),
  ];
  const uniqueHeadshots = Array.from(new Set(headshots)).filter(Boolean);

  const actingReel = portfolio.actingReel || portfolio.acting_reel || submitted.videoAudition;
  const introVideo = portfolio.introVideo || portfolio.intro_video;
  const resume = portfolio.resume || submitted.resume;

  const [activeTab, setActiveTab] = useState('media');
  const [selectedImage, setSelectedImage] = useState(uniqueHeadshots[0] || cand.avatar);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Portfolio & Media — ${cand.fullName || application?.candidateName}`}
      size="xl"
    >
      <div className="space-y-6 text-xs text-left max-h-[80vh] overflow-y-auto">
        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'media'
                ? 'border-brand-pink text-brand-pink'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Showreels &amp; Video Auditions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('headshots')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'headshots'
                ? 'border-brand-pink text-brand-pink'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Headshots &amp; Photos ({uniqueHeadshots.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'resume'
                ? 'border-brand-pink text-brand-pink'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Theatrical Resume
          </button>
        </div>

        {/* TAB 1: SHOWREELS & VIDEOS */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            {actingReel ? (
              <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-xs">
                      {actingReel.title || 'Dramatic Showreel / Monologue Callback'}
                    </span>
                  </div>
                  <a
                    href={actingReel.url || actingReel}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-pink-300"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-neutral-200">
                      {actingReel.title || 'Official Audition Reel'}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {actingReel.duration ? `Duration: ${actingReel.duration}` : 'Full HD 1080p'} • Hosted on Vimeo/Cloud
                    </p>
                  </div>
                  <a
                    href={actingReel.url || actingReel}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors"
                  >
                    Play Video Reel
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-500">
                <Video className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                <p className="font-bold text-xs text-neutral-800">No active video reel provided</p>
                <p className="text-[11px]">Candidate has not uploaded a video showreel or callback self-tape link.</p>
              </div>
            )}

            {introVideo && (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-brand-pink flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-xs">
                      {introVideo.title || 'Personality Slate / Introduction'}
                    </h5>
                    <p className="text-[10px] text-neutral-500">
                      {introVideo.duration ? `Length: ${introVideo.duration}` : 'Brief character monologue slate'}
                    </p>
                  </div>
                </div>
                <a
                  href={introVideo.url || introVideo}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-800 text-[11px] font-bold shadow-2xs"
                >
                  Watch Slate
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HEADSHOTS GALLERY */}
        {activeTab === 'headshots' && (
          <div className="space-y-4">
            {uniqueHeadshots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uniqueHeadshots.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className="group relative aspect-3/4 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={`Headshot ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 text-white text-[10px] font-bold">
                      Headshot #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-500">
                <ImageIcon className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                <p className="font-bold text-xs text-neutral-800">No headshots in gallery</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESUME DOCUMENT */}
        {activeTab === 'resume' && (
          <div className="space-y-4">
            {resume ? (
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-neutral-900 text-xs">
                      {resume.fileName || `${cand.fullName || 'Candidate'}_Resume_2026.pdf`}
                    </h5>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {resume.fileSize || '2.1 MB'} • Theatrical &amp; Screen Resume (Verified)
                    </p>
                  </div>
                </div>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Sample verified PDF resume downloaded for casting review.');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Resume</span>
                </a>
              </div>
            ) : (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-500">
                <FileText className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                <p className="font-bold text-xs text-neutral-800">No casting resume uploaded</p>
                <p className="text-[11px]">Candidate has not uploaded a PDF or Word resume document.</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} variant="outline" className="text-xs">
            Close Portfolio
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PortfolioModal;
