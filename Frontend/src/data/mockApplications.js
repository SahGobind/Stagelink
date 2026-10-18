/**
 * Centralized Mock Application Data for StageLink
 *
 * Provides realistic application state shared across Admin and Candidate portals.
 * Persists changes in localStorage so status transitions immediately update My Applications.
 */

export const mockApplications = [
  {
    id: 'app-1',
    opportunityId: 'opp-1',
    opportunityTitle: 'Female Lead — Web Series',
    productionCompany: 'Rising Star Productions',
    location: 'Mumbai, India',
    candidateId: 'cand-1',
    candidateName: 'Sophia Bennett',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'Film & Theatre Artist | Classical & Contemporary Dramatic Performer',
    candidateLocation: 'London, UK',
    candidateExperience: '6+ Years / Senior',
    roleAppliedFor: 'Dr. Tanya Roy',
    status: 'interview',
    appliedDate: '2026-10-09',
    coverMessage: 'I am deeply passionate about Dr. Tanya Roy’s complex psychological journey. Having trained at RADA and performed in psychological screen dramas, I bring both emotional gravity and nuanced precision to this forensic investigator role.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Sophia_Bennett_Resume_2026.pdf',
        fileSize: '2.4 MB',
      },
      videoAudition: {
        title: 'Scene 4 Callback Monologue',
        url: 'https://vimeo.com/76979871',
        duration: '2:15',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-09T10:15:00Z',
        note: 'Audition packet submitted with showreel and headshots.',
        changedBy: 'Sophia Bennett (Candidate)',
      },
      {
        status: 'under_review',
        changedAt: '2026-10-10T11:30:00Z',
        note: 'Screened by Lead Casting Director Rohan Mehra.',
        changedBy: 'Admin / Casting Director',
      },
      {
        status: 'shortlisted',
        changedAt: '2026-10-11T16:00:00Z',
        note: 'Shortlisted for primary callback reads.',
        changedBy: 'Admin / Casting Director',
      },
      {
        status: 'interview',
        changedAt: '2026-10-12T09:45:00Z',
        note: 'Invited for live chemistry read callback on Oct 20.',
        changedBy: 'Admin / Casting Director',
      },
    ],
    internalNotes: [
      {
        id: 'note-1',
        text: 'Exceptional intensity in the Scene 4 self-tape. Voice modulation matches the director’s vision perfectly.',
        author: 'Rohan Mehra (Casting Lead)',
        createdAt: '2026-10-11T16:20:00Z',
      },
    ],
    interviewDetails: {
      date: '2026-10-20',
      time: '14:30 IST',
      mode: 'Studio Chemistry Read (Mumbai / Video Callback)',
      notes: 'Prepare Scene 4 and spontaneous interrogation improvisation.',
    },
    notes: 'Director invited you to submit a Scene 4 self-tape callback by Oct 20.',
  },
  {
    id: 'app-2',
    opportunityId: 'opp-2',
    opportunityTitle: 'Supporting Lead — Cyber Noir Series',
    productionCompany: 'Nova Stream Studios',
    location: 'Delhi, India',
    candidateId: 'cand-1',
    candidateName: 'Sophia Bennett',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'Film & Theatre Artist | Classical & Contemporary Dramatic Performer',
    candidateLocation: 'London, UK',
    candidateExperience: '6+ Years / Senior',
    roleAppliedFor: 'Detective Marcus Kane',
    status: 'under_review',
    appliedDate: '2026-10-07',
    coverMessage: 'Enclosed is my dramatic monologue reel and combat certification for the Cyber Noir series. I have extensive experience in high-tension drama.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Sophia_Bennett_Resume_2026.pdf',
        fileSize: '2.4 MB',
      },
      videoAudition: {
        title: 'Action Stunt Slate & Noir Monologue',
        url: 'https://vimeo.com/76979871',
        duration: '1:45',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-07T14:20:00Z',
        note: 'Audition packet submitted.',
        changedBy: 'Sophia Bennett (Candidate)',
      },
      {
        status: 'under_review',
        changedAt: '2026-10-08T09:00:00Z',
        note: 'Initial review underway with production studio team.',
        changedBy: 'Admin / Casting Director',
      },
    ],
    internalNotes: [
      {
        id: 'note-2',
        text: 'Solid presence. Let us wait for the showrunner to review the British dialect tape.',
        author: 'Priya Sharma (Admin)',
        createdAt: '2026-10-08T10:15:00Z',
      },
    ],
    notes: 'Headshot, dramatic monologue reel, and resume packet received.',
  },
  {
    id: 'app-3',
    opportunityId: 'opp-3',
    opportunityTitle: 'Lead Performer — "The Velvet Horizon"',
    productionCompany: 'Auteur Pictures',
    location: 'London, UK',
    candidateId: 'cand-1',
    candidateName: 'Sophia Bennett',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'Film & Theatre Artist | Classical & Contemporary Dramatic Performer',
    candidateLocation: 'London, UK',
    candidateExperience: '6+ Years / Senior',
    roleAppliedFor: 'Elena Ward',
    status: 'shortlisted',
    appliedDate: '2026-10-03',
    coverMessage: 'As a London-based performer with period drama background, "The Velvet Horizon" resonates with my stage repertory training.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Sophia_Bennett_Resume_2026.pdf',
        fileSize: '2.4 MB',
      },
      videoAudition: {
        title: 'Period Monologue - Chekhov / Ibsen',
        url: 'https://vimeo.com/76979871',
        duration: '2:50',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-03T11:00:00Z',
        note: 'Application submitted.',
        changedBy: 'Sophia Bennett (Candidate)',
      },
      {
        status: 'under_review',
        changedAt: '2026-10-04T15:30:00Z',
        note: 'Reviewed by Auteur Pictures casting associates.',
        changedBy: 'Admin / Casting Director',
      },
      {
        status: 'shortlisted',
        changedAt: '2026-10-06T18:00:00Z',
        note: 'Added to executive shortlist for producer review.',
        changedBy: 'Admin / Casting Director',
      },
    ],
    internalNotes: [
      {
        id: 'note-3',
        text: 'Top candidate for Elena Ward. The director will hold live chemistry reads next week.',
        author: 'Marcus Vance (Producer)',
        createdAt: '2026-10-06T18:30:00Z',
      },
    ],
    notes: 'Shortlisted by executive producers for live studio chemistry read.',
  },
  {
    id: 'app-4',
    opportunityId: 'opp-4',
    opportunityTitle: 'Commercial Lead — National Luxury Campaign',
    productionCompany: 'Vanguard Media Group',
    location: 'New York, NY',
    candidateId: 'cand-1',
    candidateName: 'Sophia Bennett',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'Film & Theatre Artist | Classical & Contemporary Dramatic Performer',
    candidateLocation: 'London, UK',
    candidateExperience: '6+ Years / Senior',
    roleAppliedFor: 'Principal Lookbook Model',
    status: 'applied',
    appliedDate: '2026-10-11',
    coverMessage: 'Experienced in luxury editorial print and high-fashion commercial spots.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Sophia_Bennett_Resume_2026.pdf',
        fileSize: '2.4 MB',
      },
      videoAudition: {
        title: 'Commercial Movement Slate',
        url: 'https://vimeo.com/76979871',
        duration: '1:10',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-11T09:20:00Z',
        note: 'Application submitted.',
        changedBy: 'Sophia Bennett (Candidate)',
      },
    ],
    internalNotes: [],
    notes: 'Composite card and voiceover sample submitted.',
  },
  {
    id: 'app-5',
    opportunityId: 'opp-2',
    opportunityTitle: 'Supporting Lead — Cyber Noir Series',
    productionCompany: 'Nova Stream Studios',
    location: 'Delhi, India',
    candidateId: 'cand-2',
    candidateName: 'Alexander Vance',
    candidateAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'Dramatic & Action Actor | Screen Combat & Physical Theatre Specialist',
    candidateLocation: 'New York, NY',
    candidateExperience: '8+ Years / Senior',
    roleAppliedFor: 'Antagonist Roman',
    status: 'under_review',
    appliedDate: '2026-10-10',
    coverMessage: 'I specialize in intense antagonists and screen combat choreography.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Alexander_Vance_Resume.pdf',
        fileSize: '1.8 MB',
      },
      videoAudition: {
        title: 'Combat Slate & Villain Dialogue',
        url: 'https://vimeo.com/76979871',
        duration: '2:00',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-10T08:30:00Z',
        note: 'Action reel and headshots submitted.',
        changedBy: 'Alexander Vance',
      },
      {
        status: 'under_review',
        changedAt: '2026-10-11T12:00:00Z',
        note: 'Under review by fight director.',
        changedBy: 'Admin',
      },
    ],
    internalNotes: [
      {
        id: 'note-5',
        text: 'Physically very imposing and agile. High probability of casting for Roman.',
        author: 'Casting Director',
        createdAt: '2026-10-11T14:00:00Z',
      },
    ],
    notes: 'Action slate and combat reel submitted for psychological villain role.',
  },
  {
    id: 'app-6',
    opportunityId: 'opp-1',
    opportunityTitle: 'Female Lead — Web Series',
    productionCompany: 'Rising Star Productions',
    location: 'Mumbai, India',
    candidateId: 'cand-3',
    candidateName: 'Riya Sen',
    candidateAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'Lead Actress & Classical Kathak Performer | Hindi & Bengali Feature Cinema',
    candidateLocation: 'Mumbai, India',
    candidateExperience: '5 Years / Mid-Level',
    roleAppliedFor: 'Ananya Sharma',
    status: 'selected',
    appliedDate: '2026-10-02',
    coverMessage: 'Delighted to audition for Ananya Sharma. Hindi and Bengali native fluency with classical dance training.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Riya_Sen_Acting_Bio.pdf',
        fileSize: '1.9 MB',
      },
      videoAudition: {
        title: 'Emotional Dramatic Monologue (Hindi)',
        url: 'https://vimeo.com/76979871',
        duration: '2:30',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-02T10:00:00Z',
        note: 'Application received.',
        changedBy: 'Riya Sen',
      },
      {
        status: 'under_review',
        changedAt: '2026-10-03T11:00:00Z',
        note: 'Screened by casting team.',
        changedBy: 'Admin',
      },
      {
        status: 'interview',
        changedAt: '2026-10-05T14:00:00Z',
        note: 'In-person screen test completed.',
        changedBy: 'Director',
      },
      {
        status: 'selected',
        changedAt: '2026-10-08T17:30:00Z',
        note: 'Officially selected for Ananya Sharma role. Contract drafted.',
        changedBy: 'Executive Producer',
      },
    ],
    internalNotes: [
      {
        id: 'note-6',
        text: 'Selected unanimously by the producers. Excellent screen presence.',
        author: 'Rohan Mehra',
        createdAt: '2026-10-08T17:45:00Z',
      },
    ],
    notes: 'Officially selected for the role of Ananya Sharma.',
  },
  {
    id: 'app-7',
    opportunityId: 'opp-2',
    opportunityTitle: 'Supporting Lead — Cyber Noir Series',
    productionCompany: 'Nova Stream Studios',
    location: 'Delhi, India',
    candidateId: 'cand-4',
    candidateName: 'Marcus Brody',
    candidateAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'SAG-AFTRA Action & Stunt Actor | Tactical Firearms & Precision Driving',
    candidateLocation: 'Los Angeles, CA',
    candidateExperience: '7 Years / Senior',
    roleAppliedFor: 'Lead Stunt Double / Tactical Operative',
    status: 'shortlisted',
    appliedDate: '2026-10-08',
    coverMessage: 'Tactical stunt driver and martial artist with certified firearms handling.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Marcus_Brody_Stunt_Resume.pdf',
        fileSize: '3.1 MB',
      },
      videoAudition: {
        title: 'Tactical Combat Reel 2026',
        url: 'https://vimeo.com/76979871',
        duration: '1:55',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-08T09:15:00Z',
        note: 'Stunt packet received.',
        changedBy: 'Marcus Brody',
      },
      {
        status: 'shortlisted',
        changedAt: '2026-10-10T14:30:00Z',
        note: 'Shortlisted by second-unit director.',
        changedBy: 'Admin',
      },
    ],
    internalNotes: [
      {
        id: 'note-7',
        text: 'Clearance verified for overseas stunt work.',
        author: 'Admin',
        createdAt: '2026-10-10T15:00:00Z',
      },
    ],
    notes: 'Second-unit fight coordinator approved stunt portfolio.',
  },
  {
    id: 'app-8',
    opportunityId: 'opp-3',
    opportunityTitle: 'Lead Performer — "The Velvet Horizon"',
    productionCompany: 'Auteur Pictures',
    location: 'London, UK',
    candidateId: 'cand-5',
    candidateName: 'Elena Rostova',
    candidateAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'European Art-House Film Actor | Method Actress | German & English Fluent',
    candidateLocation: 'Berlin, Germany',
    candidateExperience: '6 Years / Senior',
    roleAppliedFor: 'Katja Vane',
    status: 'not_selected',
    appliedDate: '2026-10-01',
    coverMessage: 'Honored to submit my tape for Katja Vane.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Elena_Rostova_Resume.pdf',
        fileSize: '2.0 MB',
      },
      videoAudition: {
        title: 'European Scene Study',
        url: 'https://vimeo.com/76979871',
        duration: '2:10',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-01T12:00:00Z',
        note: 'Application submitted.',
        changedBy: 'Elena Rostova',
      },
      {
        status: 'under_review',
        changedAt: '2026-10-03T16:00:00Z',
        note: 'Reviewed by casting directors.',
        changedBy: 'Admin',
      },
      {
        status: 'not_selected',
        changedAt: '2026-10-05T11:00:00Z',
        note: 'Role required distinct West End accent profile; candidate retained for future casting calls.',
        changedBy: 'Admin',
      },
    ],
    internalNotes: [
      {
        id: 'note-8',
        text: 'Talented performer but accent does not fit the 1920s British setting. Saved for Berlin project.',
        author: 'Marcus Vance',
        createdAt: '2026-10-05T11:15:00Z',
      },
    ],
    notes: 'Retained in talent database for upcoming international productions.',
  },
  {
    id: 'app-9',
    opportunityId: 'opp-4',
    opportunityTitle: 'Commercial Lead — National Luxury Campaign',
    productionCompany: 'Vanguard Media Group',
    location: 'New York, NY',
    candidateId: 'cand-7',
    candidateName: 'Chloe Dupont',
    candidateAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    candidateHeadline: 'High-Fashion Editorial Model & Commercial Screen Artist | Paris & NYC',
    candidateLocation: 'Paris, France',
    candidateExperience: '5 Years / Mid-Level',
    roleAppliedFor: 'Principal Lookbook Model',
    status: 'shortlisted',
    appliedDate: '2026-10-06',
    coverMessage: 'Paris Fashion Week editorial model ready for luxury commercial campaign shoots.',
    submittedMaterials: {
      headshot: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      resume: {
        fileName: 'Chloe_Dupont_Portfolio_Book.pdf',
        fileSize: '4.2 MB',
      },
      videoAudition: {
        title: 'Runway & Commercial Slate',
        url: 'https://vimeo.com/76979871',
        duration: '1:20',
      },
    },
    statusHistory: [
      {
        status: 'applied',
        changedAt: '2026-10-06T15:30:00Z',
        note: 'Lookbook materials received.',
        changedBy: 'Chloe Dupont',
      },
      {
        status: 'shortlisted',
        changedAt: '2026-10-08T18:00:00Z',
        note: 'Top 3 finalists for New York shoot.',
        changedBy: 'Admin',
      },
    ],
    internalNotes: [
      {
        id: 'note-9',
        text: 'Brand marketing team loves the high-fashion aesthetic.',
        author: 'Admin',
        createdAt: '2026-10-08T18:20:00Z',
      },
    ],
    notes: 'Paris Fashion Week comp card selected for top 3 lookbook callbacks.',
  },
];

const STORAGE_KEY = 'starcast_applications';

export const getAllApplications = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return mockApplications;
};

export const getCandidateApplications = () => {
  return getAllApplications();
};

export const getApplicationById = (id) => {
  const all = getAllApplications();
  return all.find((a) => a.id === id) || null;
};

export const getApplicationsByCandidateId = (candidateId) => {
  const all = getAllApplications();
  return all.filter((a) => a.candidateId === candidateId);
};

export const saveCandidateApplication = (newApp) => {
  try {
    const current = getAllApplications();
    const updated = [newApp, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return mockApplications;
  }
};

/**
 * Updates status of an application, logs to history/timeline, and persists to localStorage.
 */
export const updateApplicationStatus = (applicationId, newStatus, internalNote = '', details = null) => {
  const current = getAllApplications();
  const timestamp = new Date().toISOString();

  const updated = current.map((app) => {
    if (app.id !== applicationId) return app;

    // Build history entry
    const newHistoryEntry = {
      status: newStatus,
      changedAt: timestamp,
      note: internalNote || `Status updated to ${newStatus.replace('_', ' ')} by Admin.`,
      changedBy: 'StageLink Admin',
    };

    // Build internal note entry if provided
    const newNotes = [...(app.internalNotes || [])];
    if (internalNote && internalNote.trim()) {
      newNotes.unshift({
        id: `note-${Date.now()}`,
        text: internalNote.trim(),
        author: 'Admin',
        createdAt: timestamp,
      });
    }

    const merged = {
      ...app,
      status: newStatus,
      statusHistory: [...(app.statusHistory || []), newHistoryEntry],
      internalNotes: newNotes,
    };

    if (details) {
      if (details.interviewDetails) {
        merged.interviewDetails = details.interviewDetails;
      }
      if (details.notes) {
        merged.notes = details.notes;
      }
    }

    return merged;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save updated application:', e);
  }

  return updated;
};

/**
 * Adds an internal note to an application and persists to localStorage.
 */
export const addApplicationInternalNote = (applicationId, noteText, author = 'Admin') => {
  if (!noteText || !noteText.trim()) return getAllApplications();

  const current = getAllApplications();
  const timestamp = new Date().toISOString();

  const updated = current.map((app) => {
    if (app.id !== applicationId) return app;

    const newNote = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      author,
      createdAt: timestamp,
    };

    return {
      ...app,
      internalNotes: [newNote, ...(app.internalNotes || [])],
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save internal note:', e);
  }

  return updated;
};
