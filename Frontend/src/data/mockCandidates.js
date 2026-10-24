/**
 * Centralized Mock Candidate Data for StageLink
 *
 * Provides realistic performer profiles with complete personal,
 */
import { mockTalentProfiles } from './mockTalentDirectory';

export const initialCandidateProfile = {
  id: 'cand-1',
  fullName: 'Aanya Sharma',
  categories: ['Actor', 'Model'],
  headline: 'Actor • Model',
  location: 'Mumbai, India',
  country: 'India',
  city: 'Mumbai',
  dateOfBirth: '1998-03-12',
  age: 26,
  gender: 'Female',
  height: '165 cm',
  nationality: 'Indian',
  appearance: 'Fair',
  bodyType: 'Slim',
  hairColor: 'Black',
  eyeColor: 'Brown',
  contactEmail: 'aanya.sharma@example.com',
  phone: '+91 98201 23456',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
  profileCompletion: 85,
  verificationStatus: 'verified',
  isReviewed: true,
  contactPermissionGranted: true,
  status: 'active',
  registeredDate: '2026-09-15',
  shortlistedOpportunities: ['opp-1'],
  availabilityStatus: 'Available for Projects',
  availability: 'Available for Auditions',
  travelStatus: 'Open to travel internationally',
  datesFlexibility: 'Flexible with dates',
  unionStatus: 'CINTAA Registered / Actor Guild',
  experienceYears: '2+',
  experienceLevel: '2+ Years Experience',
  yearsOfExperience: 2,
  projectsCount: '15+',
  languagesCount: 3,
  locationDisplay: 'Mumbai',
  bio: 'Passionate actor and model with experience in films, web series and commercials. I love exploring diverse roles and bringing authentic characters to life.',
  languages: ['Hindi', 'English', 'Punjabi'],
  skills: [
    'Acting',
    'Modeling',
    'Dance',
    'Voice-over',
    'Improvisation',
    'Classical Dance',
  ],
  preferredProjectTypes: [
    'Films',
    'OTT / Web Series',
    'Advertisements',
    'Music Videos',
    'Fashion Shoots',
    'Theatre',
  ],
  skillsByCategory: {
    acting: [
      'Acting',
      'Improvisation',
      'Method Acting',
      'Monologue Delivery',
      'Dialogue Delivery',
    ],
    modeling: [
      'Modeling',
      'Commercial Print',
      'Fashion Shoots',
      'Ramp Walk',
      'Lookbook',
    ],
    dance: [
      'Dance',
      'Classical Dance',
      'Kathak Basics',
      'Bollywood Contemporary',
    ],
    voiceActing: [
      'Voice-over',
      'Hindi Diction',
      'English Narration',
      'Dubbing',
    ],
  },
  experience: [
    {
      id: 'proj-1',
      role: 'Lead - Riya',
      project: 'Mumbai Diaries (OTT Series)',
      type: 'OTT / Web Series',
      director: 'Karan Mehra',
      year: '2025',
      description: 'Lead protagonist in high-intensity drama series set in contemporary Mumbai.',
    },
    {
      id: 'proj-2',
      role: 'Principal Model',
      project: 'FabIndia Festive Campaign',
      type: 'Advertisements',
      director: 'Visual Edge Productions',
      year: '2025',
      description: 'Nationwide television and digital billboard campaign.',
    },
    {
      id: 'proj-3',
      role: 'Supporting Role - Aisha',
      project: 'Echoes of the Monsoon',
      type: 'Films',
      director: 'Ananya Roy',
      year: '2024',
      description: 'Critically acclaimed independent feature premiered at Mumbai Film Festival.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Whistling Woods International, Mumbai',
      degree: 'Diploma in Acting & Screen Arts',
      year: '2019 - 2021',
      notes: 'Specialization in Camera Acting, Voice Modulation & Stanislavski Technique.',
    },
  ],
  portfolio: {
    headshots: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    ],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    ],
    showreel: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Aanya Sharma - Official Acting Showreel',
      duration: '02:36',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    auditionClips: [
      {
        id: 'clip-1',
        title: 'Dramatic Scene',
        duration: '01:45',
        thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'clip-2',
        title: 'Commercial Audition',
        duration: '00:58',
        thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'clip-3',
        title: 'Monologue',
        duration: '01:20',
        thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
      },
    ],
    introVideo: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Aanya Sharma - Introduction',
      duration: '02:36',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    actingReel: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Official Acting Showreel',
      duration: '02:36',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    resume: {
      fileName: 'Aanya_Sharma_Actor_Resume.pdf',
      fileSize: '1.4 MB',
      uploadDate: 'October 2026',
      isLocalDemo: true,
      summary: 'Acting & Modeling portfolio resume highlighting commercial, OTT and fashion credits.',
    },
    instagram: '@aanyasharma',
  },
  instagram: '@aanyasharma',
  privacySettings: {
    showEmailPublicly: false,
    showPhonePublicly: false,
    showExactDob: true,
    profileVisibility: 'public',
  },
};

export const mockCandidates = [
  initialCandidateProfile,
  {
    id: 'cand-2',
    fullName: 'Alexander Vance',
    headline: 'Screen Actor & Voiceover Specialist | Intense Psychological Roles',
    location: 'New York, NY / Los Angeles, CA',
    dateOfBirth: '1995-11-20',
    gender: 'Male',
    height: "6'1\" (185 cm)",
    eyeColor: 'Blue',
    hairColor: 'Dark Brown',
    contactEmail: 'alex.vance@example.com',
    phone: '+1 (212) 555-0198',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 88,
    verificationStatus: 'verified',
    isReviewed: true,
    contactPermissionGranted: false, // Private contact protected
    status: 'active',
    registeredDate: '2026-09-22',
    shortlistedOpportunities: ['opp-2'],
    availability: 'Available for Castings & Auditions',
    travelStatus: 'US Domestic & Europe Travel Ready',
    unionStatus: 'SAG-AFTRA Eligible',
    experienceLevel: '5+ Years / Experienced',
    yearsOfExperience: 5,
    bio: 'Versatile character actor known for intense screen presence, grounded dramatic depth, and multilingual voice capabilities. Experienced in television procedurals, indie features, and AAA videogame performance capture.',
    languages: ['English (General American, Southern)', 'French (Fluent)', 'German (Basic)'],
    skillsByCategory: {
      acting: ['Screen Combat', 'Improv', 'Method Acting', 'Police Tactical Handling'],
      modeling: ['Commercial Print', 'Editorial Lookbook'],
      dance: ['Social Ballroom', 'Stage Movement'],
      singing: ['Baritone', 'Folk'],
      theatre: ['Off-Broadway', 'Contemporary Drama'],
      voiceActing: ['Commercial VO', 'Videogame Characters', 'French Accent'],
      otherSkills: ['Firearms Safety Training', 'Martial Arts (Muay Thai)', 'Motorcycle License'],
    },
    skills: ['Screen Combat', 'Voice Acting', 'French Fluent', 'Firearms Training', 'Improv', 'Muay Thai'],
    experience: [
      {
        id: 'proj-201',
        role: 'Antagonist - Roman',
        project: 'Undercurrent (Crime Drama Feature)',
        type: 'Independent Feature',
        director: 'David Fincher Protégé Series',
        year: '2024',
        description: 'Lead antagonist role exploring high-tension psychological criminal investigation.',
      },
      {
        id: 'proj-202',
        role: 'Detective Miller',
        project: 'City Limits (Season 2)',
        type: 'Television Series',
        director: 'CBS Studios',
        year: '2023',
        description: 'Recurring police detective in three episodes.',
      },
    ],
    education: [
      {
        id: 'edu-201',
        institution: 'Tisch School of the Arts (NYU)',
        degree: 'BFA in Drama',
        year: '2015 - 2019',
        notes: 'Graduated with honors in on-camera acting and scene study.',
      },
    ],
    portfolio: {
      headshots: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      ],
      introVideo: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Alexander Vance - Introduction Slate',
        duration: '0:55',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      },
      actingReel: {
        url: 'https://vimeo.com/76979871',
        title: 'Action & Drama Showreel',
        duration: '2:15',
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      },
      resume: {
        fileName: 'Alexander_Vance_Resume_2026.pdf',
        fileSize: '1.8 MB',
        uploadDate: 'September 2026',
        isLocalDemo: true,
      },
    },
    privacySettings: {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    },
  },
  {
    id: 'cand-3',
    fullName: 'Riya Sen',
    headline: 'Contemporary Film Actress | Classical Kathak & Screen Performer',
    location: 'Mumbai, India',
    dateOfBirth: '2001-08-19',
    gender: 'Female',
    height: "5'6\" (168 cm)",
    eyeColor: 'Dark Brown',
    hairColor: 'Black',
    contactEmail: 'riya.sen@example.com',
    phone: '+91 98200 44551',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 92,
    verificationStatus: 'pending_review',
    isReviewed: false,
    contactPermissionGranted: false, // Private contact protected
    status: 'pending_review',
    registeredDate: '2026-10-11', // Recent registration
    shortlistedOpportunities: [],
    availability: 'Available Immediately for Screen Tests',
    travelStatus: 'Pan-India & International Travel Ready',
    unionStatus: 'CINTAA Registered',
    experienceLevel: '3+ Years / Mid-Level',
    yearsOfExperience: 3,
    bio: 'Trained at FTII Pune in film acting and voice modulation. Accomplished Kathak dancer with 8 years of classical training. Featured in critically acclaimed web series and major commercial campaigns across Mumbai.',
    languages: ['Hindi (Native)', 'English (Fluent)', 'Bengali (Fluent)', 'Marathi (Conversational)'],
    skillsByCategory: {
      acting: ['Method Acting', 'Emotional Scene Study', 'Improvisation', 'Monologue Delivery'],
      modeling: ['Commercial Print', 'Ethnic Wear Modeling'],
      dance: ['Kathak (Senior Diploma)', 'Bollywood Choreography', 'Semi-Classical'],
      singing: ['Indian Classical Vocal Basics'],
      theatre: ['Prithvi Theatre Repertory', 'Street Plays'],
      voiceActing: ['Hindi Narration', 'Commercial Dubbing'],
      otherSkills: ['Yoga Certified', 'Stage Movement'],
    },
    skills: ['Method Acting', 'Kathak Dance', 'Hindi Diction', 'Voice Modulation', 'Prithvi Theatre'],
    experience: [
      {
        id: 'proj-301',
        role: 'Supporting Lead - Ananya',
        project: 'Borders of Silence (Mini-Series)',
        type: 'OTT Drama',
        director: 'Anurag Kashyap Associates',
        year: '2025',
        description: 'Played an idealistic college activist in 6-part political thriller.',
      },
    ],
    education: [
      {
        id: 'edu-301',
        institution: 'Film and Television Institute of India (FTII)',
        degree: 'Diploma in Screen Acting',
        year: '2021 - 2023',
        notes: 'Graduated top of class in screen presence and dialogue delivery.',
      },
    ],
    portfolio: {
      headshots: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      ],
      introVideo: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Riya Sen - Audition Slate & Monologue',
        duration: '1:05',
        thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      },
      actingReel: {
        url: 'https://vimeo.com/76979871',
        title: 'Riya Sen - Dance & Dramatic Reel',
        duration: '2:10',
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      },
      resume: {
        fileName: 'Riya_Sen_Acting_CV.pdf',
        fileSize: '1.2 MB',
        uploadDate: 'October 2026',
        isLocalDemo: true,
      },
    },
    privacySettings: {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    },
  },
  {
    id: 'cand-4',
    fullName: 'Marcus Brody',
    headline: 'Action Stunt Performer & Screen Actor | Martial Arts Specialist',
    location: 'Toronto, Canada / London, UK',
    dateOfBirth: '1992-04-12',
    gender: 'Male',
    height: "6'2\" (188 cm)",
    eyeColor: 'Brown',
    hairColor: 'Black',
    contactEmail: 'marcus.brody@example.com',
    phone: '+1 (416) 555-0812',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 100,
    verificationStatus: 'verified',
    isReviewed: true,
    contactPermissionGranted: true,
    status: 'active',
    registeredDate: '2026-08-30',
    shortlistedOpportunities: ['opp-2'],
    availability: 'Available for Action Features & International Units',
    travelStatus: 'Valid Canadian & British Passports',
    unionStatus: 'ACTRA / Equity UK',
    experienceLevel: '8+ Years / Senior',
    yearsOfExperience: 8,
    bio: 'Seasoned stunt actor and martial artist with over 8 years in major action film franchises. Black belt in Brazilian Jiu-Jitsu and Judo. Certified high-fall and wirework specialist with extensive experience working alongside international second unit directors.',
    languages: ['English (Native)', 'Japanese (Conversational)'],
    skillsByCategory: {
      acting: ['Action Screen Acting', 'Dialogue Delivery under Physical Duress'],
      modeling: ['Athletic / Fitness Commercials'],
      dance: ['Capoeira Movement'],
      singing: [],
      theatre: ['Fight Choreographer'],
      voiceActing: ['Combat Exertions & Grunts'],
      otherSkills: ['High Falls (40ft)', 'Wirework', 'Precision Driving', 'BJJ Black Belt'],
    },
    skills: ['Action Stunts', 'Screen Combat', 'Wirework', 'BJJ Black Belt', 'Precision Driving'],
    experience: [
      {
        id: 'proj-401',
        role: 'Stunt Double / Mercenary Lead',
        project: 'Apex Protocol (Feature)',
        type: 'Studio Action Blockbuster',
        director: 'Universal Pictures Canada Unit',
        year: '2025',
        description: 'Performed hand-to-hand fight sequences and wirework stunts.',
      },
    ],
    education: [
      {
        id: 'edu-401',
        institution: 'Toronto Stunt Academy',
        degree: 'Professional Action Stunt Certification',
        year: '2016',
        notes: 'High falls, fire burns, and stunt rigging safety.',
      },
    ],
    portfolio: {
      headshots: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [],
      introVideo: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Marcus Brody - Stunt Reel & Physical Slate',
        duration: '1:45',
        thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      },
      actingReel: {
        url: 'https://vimeo.com/76979871',
        title: 'Marcus Brody - Action & Choreography Reel',
        duration: '3:00',
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      },
      resume: {
        fileName: 'Marcus_Brody_Stunt_CV_2026.pdf',
        fileSize: '3.1 MB',
        uploadDate: 'August 2026',
        isLocalDemo: true,
      },
    },
    privacySettings: {
      showEmailPublicly: true,
      showPhonePublicly: true,
      showExactDob: false,
      profileVisibility: 'public',
    },
  },
  {
    id: 'cand-5',
    fullName: 'Elena Rostova',
    headline: 'European Dramatic Performer | Physical Theatre & Avant-Garde Cinema',
    location: 'Berlin, Germany / Paris, France',
    dateOfBirth: '1997-03-25',
    gender: 'Female',
    height: "5'7\" (170 cm)",
    eyeColor: 'Green',
    hairColor: 'Blonde',
    contactEmail: 'elena.rostova@example.com',
    phone: '+49 30 901820',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 75,
    verificationStatus: 'pending_review',
    isReviewed: false,
    contactPermissionGranted: false,
    status: 'pending_review',
    registeredDate: '2026-10-09', // Recent registration
    shortlistedOpportunities: [],
    availability: 'Available for European Co-Productions',
    travelStatus: 'Schengen Citizen / Worldwide Passport',
    unionStatus: 'BFFS Germany',
    experienceLevel: '4+ Years / Mid-Level',
    yearsOfExperience: 4,
    bio: 'Berlin-based bilingual dramatic artist specializing in auteur cinema and intense arthouse roles. Strong foundation in physical theatre, movement notation, and expressive emotional range.',
    languages: ['German (Native)', 'Russian (Native)', 'English (Fluent)', 'French (Fluent)'],
    skillsByCategory: {
      acting: ['Physical Theatre', 'Method Acting', 'Avant-Garde Cinema'],
      modeling: ['Editorial Avant-Garde'],
      dance: ['Contemporary Movement'],
      singing: ['Alto Vocals'],
      theatre: ['Volksbühne Berlin Guest Artist'],
      voiceActing: ['German & Russian Voice Dubbing'],
      otherSkills: ['Stage Combat Basics'],
    },
    skills: ['Physical Theatre', 'German Native', 'Contemporary Dance', 'Russian Native', 'Avant-Garde'],
    experience: [
      {
        id: 'proj-501',
        role: 'Co-Lead - Katja',
        project: 'Winter in Leipzig',
        type: 'European Independent Feature',
        director: 'ZDF / Arte Co-Production',
        year: '2024',
        description: 'Berlinale Panorama selection drama centered on post-reunification youth.',
      },
    ],
    education: [
      {
        id: 'edu-501',
        institution: 'Ernst Busch Academy of Dramatic Arts',
        degree: 'Master in Dramatic Acting',
        year: '2018 - 2022',
        notes: 'Berlin conservatory training.',
      },
    ],
    portfolio: {
      headshots: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [],
      introVideo: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Elena Rostova - Slate & Language Sample',
        duration: '1:10',
        thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      },
      actingReel: null,
      resume: {
        fileName: 'Elena_Rostova_Acting_Vita.pdf',
        fileSize: '1.5 MB',
        uploadDate: 'October 2026',
        isLocalDemo: true,
      },
    },
    privacySettings: {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    },
  },
  {
    id: 'cand-6',
    fullName: 'Devansh Patel',
    headline: 'Commercial Screen Actor & Improv Comedian | Fresh Screen Presence',
    location: 'Delhi / Mumbai, India',
    dateOfBirth: '2003-01-10',
    gender: 'Male',
    height: "5'10\" (178 cm)",
    eyeColor: 'Brown',
    hairColor: 'Black',
    contactEmail: 'devansh.patel@example.com',
    phone: '+91 99111 88220',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 60,
    verificationStatus: 'unverified',
    isReviewed: false,
    contactPermissionGranted: false,
    status: 'unverified',
    registeredDate: '2026-10-12', // Recent registration
    shortlistedOpportunities: [],
    availability: 'Open for Auditions and Commercial Campaigns',
    travelStatus: 'Delhi & Mumbai Local',
    unionStatus: 'Non-Union',
    experienceLevel: '1-2 Years / Junior',
    yearsOfExperience: 1,
    bio: 'Energetic newcomer with background in improv comedy and digital brand advertisements. Natural conversational timing and youth appeal.',
    languages: ['Hindi (Native)', 'English (Fluent)', 'Gujarati (Native)'],
    skillsByCategory: {
      acting: ['Improv Comedy', 'Commercial Acting', 'Spontaneous Delivery'],
      modeling: ['Lifestyle Commercial Modeling'],
      dance: ['Street Dance'],
      singing: [],
      theatre: ['College Drama Society'],
      voiceActing: ['Energetic VO'],
      otherSkills: ['Cricket', 'Badminton'],
    },
    skills: ['Commercial Acting', 'Improv Comedy', 'Hindi Diction', 'Lifestyle Modeling'],
    experience: [],
    education: [
      {
        id: 'edu-601',
        institution: 'Barry John Acting Studio',
        degree: 'Certificate in Screen Acting',
        year: '2025',
        notes: 'Weekend intensive diploma course.',
      },
    ],
    portfolio: {
      headshots: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [],
      introVideo: null,
      actingReel: null,
      resume: null,
    },
    privacySettings: {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    },
  },
  {
    id: 'cand-7',
    fullName: 'Chloe Dupont',
    headline: 'High-Fashion Runway Model & Commercial Performer',
    location: 'Paris, France / Los Angeles, CA',
    dateOfBirth: '1999-07-18',
    gender: 'Female',
    height: "5'11\" (180 cm)",
    eyeColor: 'Blue',
    hairColor: 'Honey Blonde',
    contactEmail: 'chloe.dupont@example.com',
    phone: '+33 1 42 68 55 00',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 85,
    verificationStatus: 'verified',
    isReviewed: true,
    contactPermissionGranted: true,
    status: 'active',
    registeredDate: '2026-09-04',
    shortlistedOpportunities: ['opp-4'],
    availability: 'Fashion Weeks & International Luxury Commercials',
    travelStatus: 'Worldwide Travel Ready',
    unionStatus: 'Union Eligible',
    experienceLevel: '5+ Years / Experienced',
    yearsOfExperience: 5,
    bio: 'International runway model and commercial screen actress. Walked for Paris & Milan Fashion Weeks. Experienced in high-end luxury brand commercials, cosmetic brand lookbooks, and music videos.',
    languages: ['French (Native)', 'English (Fluent)', 'Italian (Conversational)'],
    skillsByCategory: {
      acting: ['High-Fashion Screen Expression', 'Editorial Presence'],
      modeling: ['Haute Couture Runway', 'Beauty Macro', 'Editorial Print'],
      dance: ['Runway Pacing', 'Contemporary'],
      singing: [],
      theatre: [],
      voiceActing: ['French Accent Voiceover'],
      otherSkills: ['Pilates Instructor Certified'],
    },
    skills: ['High-Fashion Runway', 'Editorial Print', 'Commercial Screen', 'French Native'],
    experience: [
      {
        id: 'proj-701',
        role: 'Principal Model',
        project: 'Maison Lumière Global Fragrance',
        type: 'Commercial Campaign',
        director: 'Studio Vogue Paris',
        year: '2025',
        description: 'Worldwide television and digital campaign broadcast across 40 countries.',
      },
    ],
    education: [
      {
        id: 'edu-701',
        institution: 'Paris Model & Performance Academy',
        degree: 'Professional Runway & On-Camera Diploma',
        year: '2019',
        notes: 'Distinction in photographic movement and lighting alignment.',
      },
    ],
    portfolio: {
      headshots: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      ],
      introVideo: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Chloe Dupont - Commercial Slate 2026',
        duration: '0:45',
        thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      },
      actingReel: null,
      resume: {
        fileName: 'Chloe_Dupont_Portfolio_CompCard.pdf',
        fileSize: '4.2 MB',
        uploadDate: 'September 2026',
        isLocalDemo: true,
      },
    },
    privacySettings: {
      showEmailPublicly: true,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    },
  },
  {
    id: 'cand-8',
    fullName: "Liam O'Connor",
    headline: 'Musical Theatre Performer & Stage Actor | Tenor Vocalist',
    location: 'Dublin, Ireland / London, UK',
    dateOfBirth: '2000-06-30',
    gender: 'Male',
    height: "5'9\" (175 cm)",
    eyeColor: 'Hazel',
    hairColor: 'Red / Auburn',
    contactEmail: 'liam.oconnor@example.com',
    phone: '+353 1 496 0123',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 50,
    verificationStatus: 'unverified',
    isReviewed: false,
    contactPermissionGranted: false,
    status: 'unverified',
    registeredDate: '2026-10-10', // Recent registration
    shortlistedOpportunities: [],
    availability: 'Repertory Theatre & Musical Tours',
    travelStatus: 'Ireland & UK Touring Available',
    unionStatus: 'Equity UK',
    experienceLevel: '2+ Years / Junior',
    yearsOfExperience: 2,
    bio: 'Dynamic musical theatre performer and tenor vocalist. Experienced in Dublin fringe repertory, ensemble singing, and energetic movement.',
    languages: ['English (Irish Native, RP)', 'Irish Gaelic (Fluent)'],
    skillsByCategory: {
      acting: ['Musical Theatre Acting', 'Classical Stage Movement'],
      modeling: [],
      dance: ['Tap Dance', 'Jazz Dance Basics'],
      singing: ['Tenor (High G)', 'Folk Vocalist', 'Choral Harmony'],
      theatre: ['Abbey Theatre Youth Ensemble'],
      voiceActing: ['Irish Dialect Voiceover'],
      otherSkills: ['Acoustic Guitar', 'Bodhrán Player'],
    },
    skills: ['Musical Theatre', 'Tenor Vocalist', 'Irish Diction', 'Stage Movement', 'Acoustic Guitar'],
    experience: [],
    education: [
      {
        id: 'edu-801',
        institution: 'The Lir National Academy of Dramatic Art (Trinity College)',
        degree: 'Foundation Diploma in Acting & Theatre',
        year: '2023 - 2024',
        notes: 'Specialization in vocal projection and musical performance.',
      },
    ],
    portfolio: {
      headshots: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [],
      introVideo: null,
      actingReel: null,
      resume: null,
    },
    privacySettings: {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    },
  },
];

export const sophiaCandidateProfile = {
  id: 'cand-sophia',
  fullName: 'Sophia Bennett',
  categories: ['Actor', 'Voice Artist'],
  headline: 'Actor • Dramatic Screen & Stage Performer',
  location: 'London, UK / Mumbai',
  country: 'United Kingdom',
  city: 'London',
  dateOfBirth: '2001-04-15',
  age: 25,
  gender: 'Female',
  height: "5'8\" (173 cm)",
  nationality: 'British / Overseas Citizen',
  appearance: 'Light',
  bodyType: 'Athletic / Slim',
  hairColor: 'Auburn / Brown',
  eyeColor: 'Hazel Green',
  contactEmail: 'sophia.bennett@example.com',
  phone: '+44 7700 900123',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  coverImage: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1600&q=80',
  profileCompletion: 90,
  verificationStatus: 'verified',
  isReviewed: true,
  contactPermissionGranted: true,
  status: 'active',
  registeredDate: '2026-09-20',
  shortlistedOpportunities: ['opp-1', 'opp-2'],
  availabilityStatus: 'Available for Projects',
  availability: 'Available for Auditions & Callbacks',
  travelStatus: 'Open to travel internationally',
  datesFlexibility: 'Flexible with dates',
  unionStatus: 'Equity UK & SAG-AFTRA Eligible',
  experienceYears: '4+',
  experienceLevel: '4+ Years Experience',
  yearsOfExperience: 4,
  projectsCount: '12+',
  languagesCount: 2,
  locationDisplay: 'London / Mumbai',
  bio: 'Classical and contemporary screen actress trained at LAMDA. Experienced in independent period dramas, psychological thrillers, and voiceover performance capture.',
  languages: ['English (RP & General American)', 'French (Fluent)'],
  skills: [
    'Screen Acting',
    'Stage Combat',
    'Voice Modulation',
    'Period Dialects',
    'Meisner Technique',
    'Choral Singing',
  ],
  preferredProjectTypes: [
    'Films',
    'OTT / Web Series',
    'Theatre',
    'Advertisements',
  ],
  skillsByCategory: {
    acting: [
      'Screen Acting',
      'Stage Combat',
      'Meisner Technique',
      'Classical Text',
      'Monologue Delivery',
    ],
    voiceActing: [
      'Voice-over',
      'RP British Accent',
      'American Accent',
      'French Accent',
      'Videogame VO',
    ],
  },
  experience: [
    {
      id: 'proj-sophia-1',
      role: 'Lead - Claire Ashton',
      project: 'The Velvet Horizon (Feature Film)',
      type: 'Films',
      director: 'Elena Rostova',
      year: '2025',
      description: 'Lead protagonist in post-war European mystery feature selected for London Film Festival.',
    },
    {
      id: 'proj-sophia-2',
      role: 'Supporting Role - Dr. Tanya Roy',
      project: 'Mumbai Diaries (OTT Series)',
      type: 'OTT / Web Series',
      director: 'Claire Moreau',
      year: '2026',
      description: 'Series regular role as forensic investigator in high-stakes crime procedural.',
    },
  ],
  education: [
    {
      id: 'edu-sophia-1',
      institution: 'London Academy of Music & Dramatic Art (LAMDA)',
      degree: 'BA (Hons) Professional Acting',
      year: '2020 - 2023',
      notes: 'Graduated with distinction in Classical Theatre and Screen Performance.',
    },
  ],
  portfolio: {
    headshots: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    ],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    ],
    showreel: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Sophia Bennett - Drama & Screen Reel',
      duration: '02:18',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    },
    introVideo: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Sophia Bennett - Introduction',
      duration: '01:30',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    },
    actingReel: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Official Drama Showreel',
      duration: '02:18',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    },
    resume: {
      fileName: 'Sophia_Bennett_Acting_Resume.pdf',
      fileSize: '1.2 MB',
      uploadDate: 'October 2026',
      isLocalDemo: true,
      summary: 'Professional acting resume with London West End and screen drama credits.',
    },
  },
  privacySettings: {
    showEmailPublicly: false,
    showPhonePublicly: false,
    showExactDob: true,
    profileVisibility: 'public',
  },
};

export const rohitCandidateProfile = {
  id: 'cand-rohit',
  fullName: 'Rohit Verma',
  categories: ['Actor', 'Model'],
  headline: 'Action Performer • Screen Actor • Commercial Model',
  location: 'Delhi, India / Mumbai',
  country: 'India',
  city: 'Delhi',
  dateOfBirth: '1997-09-05',
  age: 29,
  gender: 'Male',
  height: "5'11\" (180 cm)",
  nationality: 'Indian',
  appearance: 'Medium / Olive',
  bodyType: 'Athletic / Muscular',
  hairColor: 'Dark Brown',
  eyeColor: 'Dark Brown',
  contactEmail: 'rohit.verma@example.com',
  phone: '+91 98111 87654',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
  profileCompletion: 85,
  verificationStatus: 'verified',
  isReviewed: true,
  contactPermissionGranted: true,
  status: 'active',
  registeredDate: '2026-09-25',
  shortlistedOpportunities: ['opp-2'],
  availabilityStatus: 'Available for Projects',
  availability: 'Available for Shoots & Auditions',
  travelStatus: 'Ready to travel PAN-India & overseas',
  datesFlexibility: 'Flexible with dates',
  unionStatus: 'CINTAA Registered',
  experienceYears: '3+',
  experienceLevel: '3+ Years Experience',
  yearsOfExperience: 3,
  projectsCount: '10+',
  languagesCount: 3,
  locationDisplay: 'Delhi / Mumbai',
  bio: 'Dynamic action performer and screen actor trained in martial arts (Taekwondo Black Belt), screen combat, and high-energy commercial campaigns.',
  languages: ['Hindi', 'English', 'Punjabi'],
  skills: [
    'Screen Combat',
    'Martial Arts',
    'Stunt Work',
    'Commercial Modeling',
    'Hindi Diction',
    'Fitness Modeling',
  ],
  preferredProjectTypes: [
    'Films',
    'OTT / Web Series',
    'Advertisements',
    'Music Videos',
  ],
  skillsByCategory: {
    acting: [
      'Screen Combat',
      'Action Choreography',
      'Intense Drama',
      'Hindi Diction',
    ],
    modeling: [
      'Fitness Modeling',
      'Commercial Print',
      'Ramp Walk',
    ],
  },
  experience: [
    {
      id: 'proj-rohit-1',
      role: 'Action Lead - Kabir',
      project: 'Shadow Strike (Action Thriller)',
      type: 'OTT / Web Series',
      director: 'Rohan Sen',
      year: '2025',
      description: 'Performed all martial arts and tactical stunt sequences for high-octane mini-series.',
    },
  ],
  education: [
    {
      id: 'edu-rohit-1',
      institution: 'Barry John Acting Studio, Mumbai',
      degree: 'Diploma in Film & Screen Acting',
      year: '2021 - 2022',
      notes: 'Intensive screen acting, body movement, and voice projection.',
    },
  ],
  portfolio: {
    headshots: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
    showreel: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Rohit Verma - Action & Drama Showreel',
      duration: '02:05',
      thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
    introVideo: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Rohit Verma - Introduction',
      duration: '01:15',
      thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
    actingReel: {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Action Stunt Reel',
      duration: '02:05',
      thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
    resume: {
      fileName: 'Rohit_Verma_Action_Resume.pdf',
      fileSize: '1.1 MB',
      uploadDate: 'October 2026',
      isLocalDemo: true,
      summary: 'Action actor and stunt performer resume with martial arts certifications.',
    },
  },
  privacySettings: {
    showEmailPublicly: false,
    showPhonePublicly: false,
    showExactDob: true,
    profileVisibility: 'public',
  },
};

/**
 * Storage helpers for candidate profile synchronization
 */
export const CANDIDATE_PROFILE_STORAGE_KEY = 'starcast_candidate_profile';
export const CANDIDATE_PROFILES_MAP_STORAGE_KEY = 'starcast_candidate_profiles_map';
export const CANDIDATES_LIST_STORAGE_KEY = 'starcast_admin_candidates_list';
export const PROFILE_WIZARD_DRAFT_KEY = 'starcast_profile_wizard_draft';

// Profile resolution helper
const resolveCurrentAuthUser = () => {
  try {
    const raw = localStorage.getItem('starcast_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const normalizeCandidateKey = (userOrKey) => {
  if (!userOrKey) return 'aanya-sharma';
  if (typeof userOrKey === 'string') {
    return userOrKey.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  // Try ID, email, or fullName
  const rawKey = userOrKey.id || userOrKey.email || userOrKey.fullName || 'aanya-sharma';
  return String(rawKey).toLowerCase().replace(/[^a-z0-9]/g, '-');
};

const getSeededProfileForUser = (user) => {
  if (!user) return initialCandidateProfile;
  const identifier = `${user.id || ''} ${user.email || ''} ${user.fullName || ''}`.toLowerCase();
  if (identifier.includes('sophia') || identifier.includes('sarah@')) {
    return sophiaCandidateProfile;
  }
  if (identifier.includes('rohit')) {
    return rohitCandidateProfile;
  }
  if (identifier.includes('aanya')) {
    return initialCandidateProfile;
  }
  // Construct fresh profile specifically for this candidate name!
  const candidateName = user.fullName || 'Candidate Performer';
  const locationCity = user.location ? user.location.split(',')[0].trim() : 'Mumbai';
  const locationCountry = user.location && user.location.includes(',') ? user.location.split(',')[1].trim() : 'India';

  return {
    ...initialCandidateProfile,
    id: user.id || `cand-${Date.now()}`,
    fullName: candidateName,
    categories: ['Actor'],
    headline: `${candidateName} • Performer`,
    location: user.location || 'Mumbai, India',
    city: locationCity,
    country: locationCountry,
    dateOfBirth: user.dateOfBirth || '2000-01-01',
    age: user.dateOfBirth ? Math.max(16, new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) : 24,
    gender: 'Other',
    contactEmail: user.email || '',
    phone: user.phoneNumber || user.phone || '',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    profileCompletion: 40,
    verificationStatus: 'in_review',
    bio: `Hello, I'm ${candidateName}. Passionate performer eager to take on meaningful acting, commercial, and creative roles.`,
    skills: ['Acting', 'Voice-over'],
    experience: [],
    education: [],
    portfolio: {
      headshots: [
        user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      ],
      portfolioPhotos: [],
      introVideo: null,
      actingReel: null,
      resume: null,
    },
    privacySettings: {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    },
  };
};

export const getCandidatesList = () => {
  try {
    const stored = localStorage.getItem(CANDIDATES_LIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [initialCandidateProfile, sophiaCandidateProfile, rohitCandidateProfile, ...mockCandidates.slice(1)];
};

export const updateCandidateInList = (id, updates) => {
  const currentList = getCandidatesList();
  const updatedList = currentList.map((c) => (c.id === id ? { ...c, ...updates } : c));
  try {
    localStorage.setItem(CANDIDATES_LIST_STORAGE_KEY, JSON.stringify(updatedList));
  } catch {
    // ignore
  }
  return updatedList;
};

export const getCandidateById = (id) => {
  const list = getCandidatesList();
  const found = list.find((c) => c.id === id);
  if (found) return found;

  // Check mockTalentProfiles
  const talent = mockTalentProfiles?.find((t) => t.id === id);
  if (talent) {
    return {
      ...initialCandidateProfile,
      ...talent,
      fullName: talent.fullName,
      headline: talent.headline,
      bio: talent.bio,
      location: talent.location,
      city: talent.city,
      country: talent.country,
      avatar: talent.avatar,
      coverImage: talent.coverImage || initialCandidateProfile.coverImage,
      categories: talent.categories || [talent.category],
      skills: talent.skills || initialCandidateProfile.skills,
      languages: talent.languages || initialCandidateProfile.languages,
      portfolio: {
        headshots: [talent.avatar, initialCandidateProfile.avatar],
        portfolioPhotos: [talent.avatar],
        introVideo: {
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          title: `${talent.fullName} - Audition Reel`,
          duration: '01:30',
          thumbnail: talent.avatar,
        },
        actingReel: {
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          title: `${talent.fullName} - Highlights Slate`,
          duration: '02:00',
          thumbnail: talent.avatar,
        },
      },
    };
  }

  return list[0];
};

/**
 * Returns candidate profile isolated by candidate name / account.
 * Whenever candidate A signs in, only profile for candidate A is visible.
 * If candidate B signs in, profile for candidate B is visible.
 */
export const getCandidateProfile = (userParam) => {
  try {
    const activeUser = userParam || resolveCurrentAuthUser();
    const key = normalizeCandidateKey(activeUser);

    const storedMapRaw = localStorage.getItem(CANDIDATE_PROFILES_MAP_STORAGE_KEY);
    const storedMap = storedMapRaw ? JSON.parse(storedMapRaw) : {};

    if (storedMap[key]) {
      return storedMap[key];
    }

    // Also check single legacy key if fullName matches
    const singleRaw = localStorage.getItem(CANDIDATE_PROFILE_STORAGE_KEY);
    if (singleRaw) {
      const parsedSingle = JSON.parse(singleRaw);
      if (
        activeUser?.fullName &&
        parsedSingle.fullName?.toLowerCase() === activeUser.fullName.toLowerCase()
      ) {
        return parsedSingle;
      }
    }

    // Initialize with candidate-specific seeded profile
    const seed = getSeededProfileForUser(activeUser);
    storedMap[key] = seed;
    localStorage.setItem(CANDIDATE_PROFILES_MAP_STORAGE_KEY, JSON.stringify(storedMap));
    return seed;
  } catch {
    return initialCandidateProfile;
  }
};

/**
 * Saves candidate profile isolated by candidate name / account.
 */
export const saveCandidateProfile = (updatedProfile, userParam) => {
  try {
    const activeUser = userParam || resolveCurrentAuthUser();
    const key = normalizeCandidateKey(activeUser || updatedProfile);

    const storedMapRaw = localStorage.getItem(CANDIDATE_PROFILES_MAP_STORAGE_KEY);
    const storedMap = storedMapRaw ? JSON.parse(storedMapRaw) : {};

    const current = getCandidateProfile(activeUser);
    const merged = {
      ...current,
      ...updatedProfile,
      fullName: updatedProfile.fullName || current.fullName || activeUser?.fullName || 'Candidate',
    };

    storedMap[key] = merged;
    localStorage.setItem(CANDIDATE_PROFILES_MAP_STORAGE_KEY, JSON.stringify(storedMap));

    // Also update legacy single key for backwards compatibility
    localStorage.setItem(CANDIDATE_PROFILE_STORAGE_KEY, JSON.stringify(merged));

    // Update in candidates list
    if (merged.id) {
      updateCandidateInList(merged.id, merged);
    }

    // Trigger local update event for react components
    window.dispatchEvent(new CustomEvent('starcast_profile_updated', { detail: merged }));

    return merged;
  } catch (error) {
    console.error('Failed to save candidate profile:', error);
    return updatedProfile;
  }
};

export const getWizardDraft = () => {
  try {
    const stored = localStorage.getItem(PROFILE_WIZARD_DRAFT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const saveWizardDraft = (draftData) => {
  try {
    localStorage.setItem(PROFILE_WIZARD_DRAFT_KEY, JSON.stringify({
      ...draftData,
      lastSavedAt: new Date().toISOString(),
    }));
    return true;
  } catch {
    return false;
  }
};

export const clearWizardDraft = () => {
  try {
    localStorage.removeItem(PROFILE_WIZARD_DRAFT_KEY);
  } catch {
    // ignore
  }
};

/**
 * Derives accurate profile completion percentage and missing items from actual profile sections.
 */
export const calculateProfileCompletion = (profile) => {
  if (!profile) {
    return {
      percentage: 0,
      missingSections: ['Personal Information', 'Professional Information', 'Skills', 'Portfolio', 'Resume'],
      isComplete: false,
      sections: [],
    };
  }

  const sections = [
    {
      id: 'personal',
      name: 'Personal Information',
      complete: Boolean(
        profile.fullName &&
        profile.dateOfBirth &&
        profile.location &&
        profile.languages?.length > 0 &&
        profile.avatar
      ),
      weight: 20,
      step: 1,
      hint: 'Name, birth date, location, languages, profile photo',
    },
    {
      id: 'professional',
      name: 'Professional Credits & Bio',
      complete: Boolean(
        profile.headline &&
        profile.bio &&
        profile.experienceLevel &&
        profile.experience?.length > 0 &&
        profile.education?.length > 0
      ),
      weight: 20,
      step: 2,
      hint: 'Headline, bio, previous projects, and acting education',
    },
    {
      id: 'skills',
      name: 'Performance Skills',
      complete: Boolean(profile.skills?.length > 0),
      weight: 20,
      step: 3,
      hint: 'Acting, dialects, movement, or vocal disciplines',
    },
    {
      id: 'portfolio',
      name: 'Headshots & Showreels',
      complete: Boolean(
        profile.portfolio?.headshots?.length > 0 &&
        (profile.portfolio?.introVideo?.url || profile.portfolio?.introVideo) &&
        (profile.portfolio?.actingReel?.url || profile.portfolio?.actingReel)
      ),
      weight: 20,
      step: 4,
      hint: 'At least one headshot and intro video or acting reel',
    },
    {
      id: 'resume',
      name: 'Casting Resume Document',
      complete: Boolean(profile.portfolio?.resume?.fileName || profile.portfolio?.resume),
      weight: 20,
      step: 4,
      hint: 'PDF or Word theatrical resume document',
    },
  ];

  let percentage = 0;
  const missingSections = [];

  sections.forEach((section) => {
    if (section.complete) {
      percentage += section.weight;
    } else {
      missingSections.push(section);
    }
  });

  return {
    percentage: Math.min(100, Math.round(percentage)),
    sections,
    missingSections,
    isComplete: percentage >= 100,
  };
};
