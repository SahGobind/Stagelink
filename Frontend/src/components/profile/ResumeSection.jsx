import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  HardDrive,
  Info,
  X,
} from 'lucide-react';
import Button from '../common/Button';

const ResumeSection = ({ resume, candidate }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const defaultResume = {
    fileName: 'Sophia_Bennett_Acting_CV_2026.pdf',
    fileSize: '2.4 MB',
    uploadDate: 'October 2026',
    isLocalDemo: true,
  };

  const currentResume = resume?.fileName ? { ...defaultResume, ...resume } : defaultResume;

  const handleDownload = () => {
    // Generate simple text CV for local demo download
    const cvContent = `
======================================================
STARCAST TALENT REPRESENTATION RESUME
======================================================
Name: ${candidate?.fullName || 'Sophia Bennett'}
Headline: ${candidate?.headline || 'Film & Theatre Performer'}
Location: ${candidate?.location || 'London, UK / Los Angeles, CA'}
Playing Age / DOB: ${candidate?.dateOfBirth || '1998-05-14'}
Contact: ${candidate?.contactEmail || 'sophia.bennett@example.com'} | ${candidate?.phone || '+44 7700 900123'}

------------------------------------------------------
TRAINING & EDUCATION
------------------------------------------------------
${(candidate?.education || [])
  .map((e) => `• ${e.degree} - ${e.institution} (${e.year})\n  Notes: ${e.notes || ''}`)
  .join('\n\n')}

------------------------------------------------------
SELECT CREDITS & PROJECTS
------------------------------------------------------
${(candidate?.experience || [])
  .map((p) => `• ${p.role} in "${p.project}" (${p.year})\n  Type: ${p.type || ''} | Dir: ${p.director || ''}\n  ${p.description || ''}`)
  .join('\n\n')}

------------------------------------------------------
SKILLS & DISCIPLINES
------------------------------------------------------
Acting: ${(candidate?.skillsByCategory?.acting || []).join(', ')}
Dialects & Languages: ${(candidate?.languages || []).join(', ')}
Special Movement & Combat: ${(candidate?.skillsByCategory?.otherSkills || []).join(', ')}

======================================================
Generated via StarCast Performer Suite (Local Draft)
======================================================
    `.trim();

    const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentResume.fileName.replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-navy" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">Curriculum Vitae & Casting Resume</h2>
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Standard 2-page theatrical resume formatted for casting director review
          </p>
        </div>

        {/* Server Storage Safety Disclaimer */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-brand-text-secondary text-[11px] self-start sm:self-auto">
          <HardDrive className="w-3.5 h-3.5 text-gray-400" />
          <span>Local Browser Session</span>
        </div>
      </div>

      {/* Resume Card Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-brand-navy shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-brand-navy truncate max-w-xs sm:max-w-md">
                {currentResume.fileName}
              </h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              <span>{currentResume.fileSize}</span>
              <span className="mx-2">•</span>
              <span>Updated {currentResume.uploadDate}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-brand-border hover:border-gray-400 bg-white hover:bg-gray-50 text-xs font-semibold text-brand-navy shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>Preview CV</span>
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="flex-1 sm:flex-none space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* Prominent Disclaimer Notice */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/80 text-[11px] text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Privacy & Storage Notice:</strong> Resume files selected in StarCast are stored in your client draft session. In this demo, files are processed in your local browser and are never permanently uploaded to any remote server without prior authorization.
        </p>
      </div>

      {/* Theatrical CV Preview Modal */}
      {isPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-navy" />
                <h3 className="text-sm font-bold text-brand-navy">Theatrical Resume Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-black transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-black transition-colors"
                  aria-label="Close CV Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body - Styled Document Sheet */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-10 bg-gray-100/70 font-sans text-xs">
              <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-subtle border border-gray-200/80 max-w-xl mx-auto space-y-6 text-brand-navy">
                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-4">
                  <h1 className="text-xl font-bold font-serif tracking-wide uppercase">
                    {candidate?.fullName || 'Sophia Bennett'}
                  </h1>
                  <p className="text-xs text-gray-600 font-medium mt-1">
                    {candidate?.headline || 'Film & Theatre Performer'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {candidate?.location} • {candidate?.contactEmail} • {candidate?.phone}
                  </p>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-navy border-b border-gray-100 pb-1">
                    Selected Film & Theatre Credits
                  </h2>
                  <div className="space-y-2.5">
                    {(candidate?.experience || []).map((exp, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div>
                          <span className="font-bold">{exp.project}</span>
                          <span className="text-gray-500"> — {exp.role}</span>
                          <p className="text-gray-400 text-[10px]">{exp.type} {exp.director ? `| Dir: ${exp.director}` : ''}</p>
                        </div>
                        <span className="font-semibold text-gray-500">{exp.year}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-navy border-b border-gray-100 pb-1">
                    Education & Training
                  </h2>
                  <div className="space-y-2 text-[11px]">
                    {(candidate?.education || []).map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <span className="font-bold">{edu.institution}</span>
                          <p className="text-gray-600">{edu.degree}</p>
                        </div>
                        <span className="font-semibold text-gray-500">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-navy border-b border-gray-100 pb-1">
                    Special Skills & Dialects
                  </h2>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>Spoken Languages:</strong> {(candidate?.languages || []).join(', ')}
                    <br />
                    <strong>Acting & Movement:</strong> {(candidate?.skills || []).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">PDF Document • 2 Pages</span>
              <Button size="sm" onClick={handleDownload} className="space-x-1.5">
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
