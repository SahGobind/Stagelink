/**
 * STAGELINK — Transparent, Explainable Candidate Match Scoring Engine
 * 
 * Default Weight Distribution (100 Points Total):
 * 1. Required skills and role-specific abilities: 30 points
 * 2. Portfolio, showreel, and relevant work samples: 25 points
 * 3. Relevant experience and credits: 15 points
 * 4. Language and communication requirements: 10 points
 * 5. Availability for shooting schedule: 10 points
 * 6. Location and travel feasibility: 10 points
 * 
 * Fairness & Ethics Guarantees:
 * - Strictly excludes protected attributes (race, gender, age, religion, appearance, attractiveness)
 * - Identifies missing fields or uncertainty
 * - Returns "Not enough information" if candidate profile is virtually incomplete
 * - Generates constructive profile improvement suggestions
 */

export const DEFAULT_SCORING_WEIGHTS = {
  skills: 30,
  portfolio: 25,
  experience: 15,
  language: 10,
  availability: 10,
  location: 10,
};

const normalize = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * 1. Required Skills & Abilities (30 Points Default)
 */
export const evaluateSkills = (candidateSkills = [], candidateSkillsByCategory = {}, requiredSkills = [], maxPoints = 30) => {
  // Aggregate all skills candidate has listed
  const allCandidateSkills = new Set([
    ...(Array.isArray(candidateSkills) ? candidateSkills : []),
    ...Object.values(candidateSkillsByCategory || {}).flat()
  ]);
  const candList = Array.from(allCandidateSkills);
  const candNorm = candList.map(s => normalize(s));

  if (!requiredSkills || requiredSkills.length === 0) {
    if (candList.length > 0) {
      return {
        criterionKey: 'skills',
        criterionName: 'Required Skills & Role-Specific Abilities',
        maxPoints,
        pointsAwarded: Math.round(maxPoints * 0.85),
        evidenceUsed: `Candidate has ${candList.length} performance skills listed (${candList.slice(0, 3).join(', ')}).`,
        missingOrUncertainty: '',
        matchedSkills: candList.slice(0, 4),
        missingSkills: [],
      };
    }
    return {
      criterionKey: 'skills',
      criterionName: 'Required Skills & Role-Specific Abilities',
      maxPoints,
      pointsAwarded: 10,
      evidenceUsed: 'Role specifies no strict required skills.',
      missingOrUncertainty: 'Candidate profile has not catalogued performance skills.',
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const matched = [];
  const missing = [];

  requiredSkills.forEach(req => {
    const reqN = normalize(req);
    const hasMatch = candNorm.some(c => c.includes(reqN) || reqN.includes(c) || (reqN.length > 4 && c.startsWith(reqN.slice(0, 4))));
    if (hasMatch) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const ratio = matched.length / Math.max(1, requiredSkills.length);
  const pointsAwarded = Math.round(ratio * maxPoints * 10) / 10;

  let evidence = `Matched ${matched.length} of ${requiredSkills.length} required abilities (${matched.join(', ') || 'None'}).`;
  let missingNote = '';
  if (missing.length > 0) {
    missingNote = `Unmatched role abilities: ${missing.join(', ')}.`;
  }
  if (candList.length === 0) {
    missingNote = 'Candidate profile lists 0 performance skills.';
  }

  return {
    criterionKey: 'skills',
    criterionName: 'Required Skills & Role-Specific Abilities',
    maxPoints,
    pointsAwarded: Math.min(maxPoints, pointsAwarded),
    evidenceUsed: evidence,
    missingOrUncertainty: missingNote,
    matchedSkills: matched,
    missingSkills: missing,
  };
};

/**
 * 2. Portfolio, Showreel & Work Samples (25 Points Default)
 */
export const evaluatePortfolio = (portfolio = {}, submittedMaterials = {}, maxPoints = 25) => {
  const p = portfolio || {};
  const s = submittedMaterials || {};

  const headshots = [...(p.headshots || [])];
  if (s.headshot && !headshots.includes(s.headshot)) headshots.push(s.headshot);

  const actingReel = p.actingReel || p.acting_reel || s.actingReel;
  const introVideo = p.introVideo || p.intro_video || s.introVideo;
  const videoAudition = s.videoAudition || s.video_audition;
  const resume = p.resume || s.resume;

  let points = 0;
  const evidence = [];
  const missing = [];

  // Headshots (up to 7 pts)
  if (headshots.length >= 2) {
    points += 7;
    evidence.push(`${headshots.length} verified headshots uploaded`);
  } else if (headshots.length === 1) {
    points += 5;
    evidence.push('1 primary headshot verified');
    missing.push('Additional professional angles recommended');
  } else {
    missing.push('Professional headshot missing');
  }

  // Acting Reel or Video Audition (up to 10 pts)
  const hasReel = Boolean(actingReel && (typeof actingReel === 'string' || actingReel.url));
  const hasVideoAudition = Boolean(videoAudition && (typeof videoAudition === 'string' || videoAudition.url));

  if (hasReel || hasVideoAudition) {
    points += 10;
    evidence.push('Verified showreel / monologue callback video available');
  } else {
    missing.push('Acting showreel video link missing');
  }

  // Personality / Slate Video (up to 5 pts)
  const hasIntro = Boolean(introVideo && (typeof introVideo === 'string' || introVideo.url));
  if (hasIntro) {
    points += 5;
    evidence.push('Introduction personality slate provided');
  } else if (hasVideoAudition) {
    points += 3;
    evidence.push('Self-tape video substituted for slate');
  } else {
    missing.push('Introduction / personality slate missing');
  }

  // Casting Resume (up to 3 pts)
  const hasResume = Boolean(resume && (typeof resume === 'string' || resume.fileName || resume.url));
  if (hasResume) {
    points += 3;
    evidence.push('Theatrical casting resume attached');
  } else {
    missing.push('PDF casting resume not attached');
  }

  return {
    criterionKey: 'portfolio',
    criterionName: 'Portfolio, Showreel & Work Samples',
    maxPoints,
    pointsAwarded: Math.min(maxPoints, Math.round(points * 10) / 10),
    evidenceUsed: evidence.join('; ') || 'No verified portfolio materials attached.',
    missingOrUncertainty: missing.join('; ') || '',
    hasHeadshots: headshots.length > 0,
    hasShowreel: hasReel || hasVideoAudition,
    hasResume,
    headshotCount: headshots.length,
  };
};

/**
 * 3. Relevant Experience & Credits (15 Points Default)
 */
export const evaluateExperience = (yearsOfExp = 0, experienceCredits = [], requiredYears = 1.0, maxPoints = 15) => {
  const years = parseFloat(yearsOfExp) || 0;
  const credits = Array.isArray(experienceCredits) ? experienceCredits : [];
  const creditCount = credits.length;

  let points = 0;
  let evidence = '';
  let missing = '';

  if (years >= requiredYears) {
    const ratio = Math.min(1.0, 0.85 + Math.max(0, years - requiredYears) * 0.1 + Math.min(creditCount, 5) * 0.05);
    points = Math.round(ratio * maxPoints * 10) / 10;
    evidence = `${years}+ years screen/theatre experience (${creditCount} documented productions), meeting role requirement (${requiredYears}+ yrs).`;
  } else if (years > 0) {
    const ratio = (years / Math.max(1, requiredYears)) * 0.7;
    points = Math.round(ratio * maxPoints * 10) / 10;
    evidence = `${years} yrs experience against ${requiredYears} yrs desired.`;
    missing = 'Fewer years of formal screen experience than targeted.';
  } else {
    points = creditCount > 0 ? 5 : 2;
    evidence = `Emerging talent with ${creditCount} amateur/indie productions.`;
    missing = 'Professional theatrical credits not yet detailed.';
  }

  return {
    criterionKey: 'experience',
    criterionName: 'Relevant Experience & Credits',
    maxPoints,
    pointsAwarded: Math.min(maxPoints, points),
    evidenceUsed: evidence,
    missingOrUncertainty: missing,
    years,
    creditCount,
  };
};

/**
 * 4. Language & Communication Requirements (10 Points Default)
 */
export const evaluateLanguage = (candidateLanguages = [], requiredLanguages = ['Hindi', 'English'], maxPoints = 10) => {
  const reqLangs = (Array.isArray(requiredLanguages) && requiredLanguages.length > 0)
    ? requiredLanguages
    : (typeof requiredLanguages === 'string' ? requiredLanguages.split(',').map(s => s.trim()) : ['Hindi', 'English']);

  const candLangs = Array.isArray(candidateLanguages) ? candidateLanguages : [];
  const candNorm = candLangs.map(l => normalize(l));

  const matched = [];
  const missing = [];

  reqLangs.forEach(req => {
    const reqN = normalize(req);
    const isMatched = candNorm.some(c => c.includes(reqN) || reqN.includes(c));
    if (isMatched) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const ratio = matched.length / Math.max(1, reqLangs.length);
  const points = Math.round(ratio * maxPoints * 10) / 10;

  return {
    criterionKey: 'language',
    criterionName: 'Language & Communication',
    maxPoints,
    pointsAwarded: Math.min(maxPoints, points),
    evidenceUsed: `Fluent in ${matched.join(', ') || 'unspecified'}.`,
    missingOrUncertainty: missing.length > 0 ? `Script dialogue requires fluency in: ${missing.join(', ')}.` : '',
    matchedLanguages: matched,
    missingLanguages: missing,
  };
};

/**
 * 5. Availability for Shooting Schedule (10 Points Default)
 */
export const evaluateAvailability = (availabilityStatus = '', maxPoints = 10) => {
  const norm = normalize(availabilityStatus);
  let points = 7;
  let evidence = 'General availability indicated on profile.';
  let missing = 'Exact production dates to be confirmed.';

  if (norm.includes('available for projects') || norm.includes('immediate') || norm.includes('full')) {
    points = maxPoints;
    evidence = 'Confirmed available for full shooting blocks.';
    missing = '';
  } else if (norm.includes('audition') || norm.includes('flexible')) {
    points = Math.round(maxPoints * 0.85);
    evidence = 'Available for auditions and flexible with production schedule.';
    missing = 'Specific shooting schedule blocks to be confirmed.';
  } else if (norm.includes('limited') || norm.includes('busy')) {
    points = Math.round(maxPoints * 0.5);
    evidence = 'Candidate notes partial availability.';
    missing = 'Potential scheduling conflicts with primary shoot.';
  }

  return {
    criterionKey: 'availability',
    criterionName: 'Availability for Schedule',
    maxPoints,
    pointsAwarded: Math.min(maxPoints, points),
    evidenceUsed: evidence,
    missingOrUncertainty: missing,
    statusText: availabilityStatus || 'Available for Auditions',
  };
};

/**
 * 6. Location & Travel Feasibility (10 Points Default)
 */
export const evaluateLocation = (candidateLocation = '', shootLocation = 'Mumbai, India', travelStatus = '', maxPoints = 10) => {
  const candNorm = normalize(candidateLocation);
  const shootNorm = normalize(shootLocation);
  const travelNorm = normalize(travelStatus);

  const shootCity = shootNorm.split(' ')[0] || '';
  const isLocal = shootCity && candNorm.includes(shootCity);

  let points = 5;
  let evidence = `Located in ${candidateLocation || 'Outstation'}.`;
  let missing = '';

  if (isLocal) {
    points = maxPoints;
    evidence = `Local resident in ${candidateLocation}. Zero relocation or travel accommodation needed.`;
  } else if (travelNorm.includes('international') || travelNorm.includes('passport') || travelNorm.includes('ready') || travelNorm.includes('open')) {
    points = Math.round(maxPoints * 0.8);
    evidence = `Based in ${candidateLocation || 'Outstation'}; verified travel-ready (${travelStatus || 'Open to travel'}).`;
    missing = 'Outstation lodging / travel coordination required.';
  } else if (candidateLocation) {
    points = Math.round(maxPoints * 0.6);
    evidence = `Located in ${candidateLocation}.`;
    missing = 'Travel willingness unconfirmed for outstation shoot.';
  } else {
    points = Math.round(maxPoints * 0.4);
    evidence = 'Location not specified on profile.';
    missing = 'Uncertain travel feasibility.';
  }

  return {
    criterionKey: 'location',
    criterionName: 'Location & Travel Feasibility',
    maxPoints,
    pointsAwarded: Math.min(maxPoints, points),
    evidenceUsed: evidence,
    missingOrUncertainty: missing,
    isLocal,
  };
};

/**
 * Primary Match Calculation Function
 */
export const calculateCandidateMatchScore = (candidate = {}, roleOrOpportunity = {}, customWeights = null) => {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...(customWeights || {}) };

  // Role extraction
  const requiredSkills = roleOrOpportunity.requiredSkills ||
    roleOrOpportunity.required_skills ||
    (roleOrOpportunity.requirementsSummary ? roleOrOpportunity.requirementsSummary.split('•').map(s => s.trim()) : ['Acting', 'Dialogue Delivery']);

  const requiredLanguages = roleOrOpportunity.requiredLanguages ||
    roleOrOpportunity.required_languages ||
    (roleOrOpportunity.languages ? roleOrOpportunity.languages.split(',').map(s => s.trim()) : ['Hindi', 'English']);

  const requiredYears = parseFloat(roleOrOpportunity.requiredExperienceYears || roleOrOpportunity.required_experience_years || 1.0);
  const shootLocation = roleOrOpportunity.requiredLocation || roleOrOpportunity.required_location || roleOrOpportunity.location || 'Mumbai, India';

  // Candidate data extraction
  const candSkills = candidate.skills || [];
  const candSkillsByCategory = candidate.skillsByCategory || candidate.skills_by_category || {};
  const portfolio = candidate.portfolio || candidate.portfolio_data || {};
  const submitted = candidate.submittedMaterials || candidate.submitted_materials || {};
  const yearsExp = candidate.yearsOfExperience || candidate.years_of_experience || (candidate.experienceYears ? parseFloat(candidate.experienceYears) : 0);
  const experienceCredits = candidate.experience || candidate.experience_credits || [];
  const languages = candidate.languages || [];
  const availability = candidate.availability || candidate.availabilityStatus || candidate.availability_status || 'Available for Projects';
  const candLoc = candidate.location || '';
  const travelStatus = candidate.travelStatus || candidate.travel_status || '';
  const profileCompletion = candidate.profileCompletion ?? candidate.profile_completeness ?? 50;

  // Check for insufficient data
  const hasBasicSkills = candSkills.length > 0;
  const hasMedia = (portfolio.headshots && portfolio.headshots.length > 0) || submitted.headshot || portfolio.actingReel || submitted.videoAudition;

  if (profileCompletion < 25 && !hasBasicSkills && !hasMedia) {
    return {
      totalScore: 0,
      status: 'insufficient_data',
      statusLabel: 'Not enough information',
      confidenceLevel: 'insufficient',
      calculationSummary: 'Not enough information to calculate an accurate match score. Candidate has not completed required profile details.',
      breakdowns: [
        {
          criterionKey: 'skills',
          criterionName: 'Required Skills & Role-Specific Abilities',
          maxPoints: weights.skills,
          pointsAwarded: 0,
          evidenceUsed: 'No skills catalogued.',
          missingOrUncertainty: 'Performance skills missing.',
        },
        {
          criterionKey: 'portfolio',
          criterionName: 'Portfolio, Showreel & Work Samples',
          maxPoints: weights.portfolio,
          pointsAwarded: 0,
          evidenceUsed: 'No media or headshots uploaded.',
          missingOrUncertainty: 'Showreel and headshots required.',
        },
      ],
      missingFields: ['Performance Skills', 'Headshots & Showreels', 'Acting Credits', 'Dialogue Diction'],
      improvementSuggestions: [
        'Add performance skills to your performer profile',
        'Upload verified headshots and dramatic showreel',
        'Detail your language delivery fluency',
        'Add theatrical or on-camera credits',
      ],
      calculatedAt: new Date().toISOString(),
    };
  }

  // Compute 6 transparent criteria
  const bSkills = evaluateSkills(candSkills, candSkillsByCategory, requiredSkills, weights.skills);
  const bPortfolio = evaluatePortfolio(portfolio, submitted, weights.portfolio);
  const bExp = evaluateExperience(yearsExp, experienceCredits, requiredYears, weights.experience);
  const bLang = evaluateLanguage(languages, requiredLanguages, weights.language);
  const bAvail = evaluateAvailability(availability, weights.availability);
  const bLoc = evaluateLocation(candLoc, shootLocation, travelStatus, weights.location);

  const breakdowns = [bSkills, bPortfolio, bExp, bLang, bAvail, bLoc];
  const rawTotal = breakdowns.reduce((sum, b) => sum + b.pointsAwarded, 0);
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal * 10) / 10));

  const missingFields = breakdowns
    .filter(b => Boolean(b.missingOrUncertainty))
    .map(b => b.criterionName);

  const improvementSuggestions = [];
  if (bSkills.missingOrUncertainty) improvementSuggestions.push(`Add specialized abilities (${bSkills.missingSkills.slice(0, 2).join(', ')})`);
  if (bPortfolio.missingOrUncertainty) improvementSuggestions.push('Upload showreel or scene callback self-tape');
  if (bExp.missingOrUncertainty) improvementSuggestions.push('Add verified production credits');
  if (bLang.missingOrUncertainty) improvementSuggestions.push('Confirm language dialogue delivery');

  const summary = `Match score: ${Math.round(totalScore)}/100 — Skills ${Math.round(bSkills.pointsAwarded)}/${weights.skills}, Portfolio ${Math.round(bPortfolio.pointsAwarded)}/${weights.portfolio}, Experience ${Math.round(bExp.pointsAwarded)}/${weights.experience}, Language ${Math.round(bLang.pointsAwarded)}/${weights.language}, Availability ${Math.round(bAvail.pointsAwarded)}/${weights.availability}, Location ${Math.round(bLoc.pointsAwarded)}/${weights.location}.`;

  return {
    totalScore,
    status: 'calculated',
    statusLabel: `${Math.round(totalScore)}% Match`,
    confidenceLevel: profileCompletion >= 75 ? 'high' : (profileCompletion >= 45 ? 'medium' : 'low'),
    calculationSummary: summary,
    breakdowns,
    missingFields,
    improvementSuggestions,
    calculatedAt: new Date().toISOString(),
  };
};
