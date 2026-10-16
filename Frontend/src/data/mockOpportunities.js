export const OPPORTUNITY_CATEGORIES = [
  {
    id: 'films',
    name: 'Films',
    description: 'Explore roles in feature films',
    count: '120+ Opportunities',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'web-series',
    name: 'Web Series',
    description: 'Exciting digital content',
    count: '200+ Opportunities',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'advertisements',
    name: 'Advertisements',
    description: 'Brand campaigns & commercials',
    count: '180+ Opportunities',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'music-videos',
    name: 'Music Videos',
    description: 'Be part of creative visuals',
    count: '90+ Opportunities',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'modeling',
    name: 'Modeling',
    description: 'Fashion shows & shoots',
    count: '150+ Opportunities',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'theatre',
    name: 'Theatre',
    description: 'Stage performances',
    count: '80+ Opportunities',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
  },
];

export const mockOpportunities = [
  {
    id: 'opp-1',
    title: 'Female Lead — Web Series',
    category: 'Web Series',
    categoryKey: 'web-series',
    productionCompany: 'Rising Star Productions',
    companyLogo: 'R',
    location: 'Mumbai, India',
    ageRange: '22 - 30',
    experience: '1+ Year',
    compensation: '₹4,50,000 - ₹6,00,000',
    postedTime: 'Posted 2 days ago',
    postedDate: '2026-10-08',
    deadline: '20 Oct 2026',
    status: 'open',
    languages: 'Hindi, English',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'An acclaimed OTT crime-thriller series in pre-production by Rising Star Productions. The project will stream across major platforms and follows an intricate investigation into high-profile art trafficking across South Asia.',
    roleDescription: 'Dr. Tanya Roy is an astute forensic investigator who is sharp-witted, relentless, and fiercely independent. She balances emotional restraint with explosive dedication to uncover the truth.',
    requirementsSummary: 'Age 22-30 • 1+ yr exp • Hindi & English fluency • Mumbai shoot',
    requirements: [
      'Prior acting experience in web series, television, or indie feature films',
      'Fluent dialogue delivery in conversational Hindi and English',
      'Available for full 45-day shooting schedule in Mumbai and Pune',
      'Comfortable with intense dramatic scenes and subtle physical action',
      'Valid passport for brief overseas shooting leg if required'
    ],
    castingTeam: {
      name: 'Rohan Mehra',
      title: 'Lead Casting Director',
      company: 'Rising Star Studios & Talents',
      bio: 'Over 12 years scouting talent across Bollywood and leading OTT original series.',
      email: 'casting@risingstar.in',
      verified: true
    },
    roles: [
      { name: 'Dr. Tanya Roy', ageRange: '22 - 30', gender: 'Female', description: 'Intelligent, ambitious investigative journalist uncovering urban mysteries.' }
    ],
    tags: ['Web Series', 'Lead Role', 'OTT Streaming', 'Thriller'],
  },
  {
    id: 'opp-2',
    title: 'Brand Advertisement Lead',
    category: 'Advertisements',
    categoryKey: 'advertisements',
    productionCompany: 'Vogue Media India',
    companyLogo: 'V',
    location: 'Delhi, India',
    ageRange: '20 - 28',
    experience: 'Freshers OK',
    compensation: '₹1,20,000 / Shoot',
    postedTime: 'Posted 3 days ago',
    postedDate: '2026-10-07',
    deadline: '28 Oct 2026',
    status: 'open',
    languages: 'Hindi, English',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'National multi-platform television and digital commercial campaign for a premium skincare and wellness brand celebrating authenticity and joyful confidence.',
    roleDescription: 'The campaign lead embodies genuine warmth, spontaneous expressions, and radiant camera charisma. Must be comfortable speaking directly to camera and interacting in dynamic lifestyle scenes.',
    requirementsSummary: 'Age 20-28 • Freshers welcome • Clear screen presence • 2-day shoot',
    requirements: [
      'Freshers and experienced performers both warmly encouraged to apply',
      'Strong camera presence and natural, unforced expressions',
      'Available for 2-day shoot schedule in New Delhi',
      'No exclusive conflicting brand commitments in skincare/beauty'
    ],
    castingTeam: {
      name: 'Sunita Chawla',
      title: 'Commercial Casting Head',
      company: 'Vogue Media Adworks',
      bio: 'Casting veteran specializing in top FMCG and luxury fashion commercials.',
      email: 'adcasting@voguemedia.in',
      verified: true
    },
    roles: [
      { name: 'Lead Campaign Model', ageRange: '20 - 28', gender: 'Female', description: 'Graceful, modern, energetic persona.' }
    ],
    tags: ['Commercial', 'Skincare', 'National TV', 'Digital Ad'],
  },
  {
    id: 'opp-3',
    title: 'Supporting Role — Feature Film',
    category: 'Films',
    categoryKey: 'films',
    productionCompany: 'Dharma Motion Works',
    companyLogo: 'D',
    location: 'Hyderabad, India',
    ageRange: '18 - 35',
    experience: '1+ Year',
    compensation: '₹3,00,000 - ₹5,00,000',
    postedTime: 'Posted 1 week ago',
    postedDate: '2026-10-03',
    deadline: '05 Nov 2026',
    status: 'open',
    languages: 'Telugu, Hindi, English',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'Major theatrical feature film directed by a National Award-winning filmmaker. A multi-generational family drama set across Telangana and Andhra Pradesh with cinematic pan-Indian release.',
    roleDescription: 'Ananya is the quick-witted, fiercely protective younger sister who serves as the emotional anchor of the family through trials of inheritance and modern ambitions.',
    requirementsSummary: 'Age 18-35 • 1+ yr exp • Telugu & Hindi fluency • Dramatic range',
    requirements: [
      'Demonstrated on-screen or theatre performance background',
      'Comfortable delivering dialogues in authentic Telugu and Hindi',
      'Available for schedule split between Hyderabad and outdoor locations',
      'Strong improvisational instincts and chemistry during auditions'
    ],
    castingTeam: {
      name: 'Vikram Reddy',
      title: 'South India Casting Associate',
      company: 'Dharma Regional Castings',
      bio: 'Bridging talent across Tollywood and Hindi mainstream cinema.',
      email: 'vikram@dharmamotion.com',
      verified: true
    },
    roles: [
      { name: 'Ananya', ageRange: '18 - 35', gender: 'Female', description: 'Devoted sister with sharp wit and complex emotional arc.' }
    ],
    tags: ['Theatrical Film', 'Supporting Lead', 'Pan-India', 'Drama'],
  },
  {
    id: 'opp-4',
    title: 'Female Actor — Romantic Music Video',
    category: 'Music Videos',
    categoryKey: 'music-videos',
    productionCompany: 'T-Series Visual Lab',
    companyLogo: 'T',
    location: 'Goa, India',
    ageRange: '18 - 28',
    experience: 'Freshers OK',
    compensation: '₹1,50,000',
    postedTime: 'Posted 3 days ago',
    postedDate: '2026-10-07',
    deadline: '15 Nov 2026',
    status: 'open',
    languages: 'Hindi, Punjabi',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'Cinematic music video for a high-profile acoustic ballad release by leading playback artists. Shot entirely on location across coastal Goa and Portuguese heritage architecture.',
    roleDescription: 'Dreamy, nostalgic lead capturing the warmth, heartbreak, and resilience of young love through expressive eyes, graceful movement, and emotive close-ups.',
    requirementsSummary: 'Age 18-28 • Freshers OK • Hindi & Punjabi • Emotive expressions',
    requirements: [
      'Expressive facial acting and graceful rhythmic movement',
      'Comfortable with outdoor beach shoots and varied lighting conditions',
      'Available for 4 days in Goa (travel and stay fully accommodated)',
    ],
    castingTeam: {
      name: 'Ayesha Kapoor',
      title: 'Visual Content Producer',
      company: 'T-Series Audio & Visuals',
      bio: 'Curating fresh faces for top trending music videos in India.',
      email: 'ayesha.casting@tseries.com',
      verified: true
    },
    roles: [
      { name: 'Music Video Lead', ageRange: '18 - 28', gender: 'Female', description: 'Cinematic, dreamy presence.' }
    ],
    tags: ['Music Video', 'Romantic', 'Trending', 'Pop Ballad'],
  },
  {
    id: 'opp-5',
    title: 'Lead Role — Festival Short Film',
    category: 'Films',
    categoryKey: 'films',
    productionCompany: 'Cannes Indie Collective',
    companyLogo: 'C',
    location: 'Bangalore, India',
    ageRange: '20 - 32',
    experience: '1+ Year',
    compensation: null, // Indie / festival project without monetary compensation to test "compensation only when provided"
    postedTime: 'Posted 4 days ago',
    postedDate: '2026-10-06',
    deadline: '22 Nov 2026',
    status: 'open',
    languages: 'English, Kannada, Hindi',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'An international film festival submission exploring artificial intelligence, personal ethics, and memory loss in modern Bengaluru. Focus on nuanced psychological tension.',
    roleDescription: 'Maya is a bio-ethics researcher facing a deep moral crisis when proprietary memory-preservation algorithms threaten human agency.',
    requirementsSummary: 'Age 20-32 • 1+ yr exp • English & Kannada • Intimate acting workshop',
    requirements: [
      'Strong monologue delivery and psychological subtlety',
      'Available for 4-day intensive rehearsal and 5-day shoot',
      'Open to indie festival participation agreements with backend laurels'
    ],
    castingTeam: {
      name: 'Arjun Swaminathan',
      title: 'Independent Filmmaker & Director',
      company: 'Bangalore Indie Wave',
      bio: 'Award-winning short filmmaker premiered at IFFI and NYIFF.',
      email: 'arjun@indiecollective.org',
      verified: false
    },
    roles: [
      { name: 'Maya', ageRange: '20 - 32', gender: 'Female', description: 'Tech researcher confronting deep ethical dilemma.' }
    ],
    tags: ['Short Film', 'Festival Selection', 'Indie', 'Psychological'],
  },
  {
    id: 'opp-6',
    title: 'Fashion Show Runway Model',
    category: 'Modeling',
    categoryKey: 'modeling',
    productionCompany: 'Lakme Fashion Showcase',
    companyLogo: 'L',
    location: 'Mumbai, India',
    ageRange: '18 - 30',
    experience: 'Freshers OK',
    compensation: '₹2,00,000',
    postedTime: 'Posted 5 days ago',
    postedDate: '2026-10-05',
    deadline: '10 Nov 2026',
    status: 'open',
    languages: 'English, Hindi',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'High couture winter collection showcase featuring premier South Asian fashion designers with international media coverage and runway recordings.',
    roleDescription: 'Runway model comfortable carrying elaborate bridal couture, structural modern silhouettes, and brisk choreographed walks on live television stage.',
    requirementsSummary: 'Age 18-30 • Freshers OK • 5ft 7in+ • Runway poise',
    requirements: [
      'Height: 5ft 7in and above preferred',
      'Poised runway posture and walking technique',
      'Available for fitting days and final show weekend in Mumbai'
    ],
    castingTeam: {
      name: 'Natasha Singhal',
      title: 'Runway Director & Model Scout',
      company: 'Lakme Model Operations',
      bio: 'Fashion director responsible for flagship fashion weeks in Mumbai and Delhi.',
      email: 'scout@lakmefashion.in',
      verified: true
    },
    roles: [
      { name: 'Runway Model', ageRange: '18 - 30', gender: 'Female', description: 'Editorial and couture runway walking.' }
    ],
    tags: ['Fashion Week', 'Runway', 'Editorial', 'High Couture'],
  },
  {
    id: 'opp-7',
    title: 'Lead Theatre Actor — Shakespeare Adapt',
    category: 'Theatre',
    categoryKey: 'theatre',
    productionCompany: 'Prithvi Theatre Repertory',
    companyLogo: 'P',
    location: 'Mumbai, India',
    ageRange: '24 - 38',
    experience: '3+ Years',
    compensation: '₹1,80,000 / Production Run',
    postedTime: 'Posted 6 days ago',
    postedDate: '2026-10-04',
    deadline: '18 Nov 2026',
    status: 'open',
    languages: 'Hindi, English, Urdu',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'A contemporary Hindustani adaptation of Hamlet set against modern royal feuds. Running for a full 24-show seasonal residency at iconic cultural venues.',
    roleDescription: 'Haider / Hamlet: Intense poetic eloquence, commanding voice projection, and stamina for high-energy 120-minute uninterrupted stage acts.',
    requirementsSummary: 'Age 24-38 • 3+ yrs stage exp • Hindustani & Urdu • Prithvi residency',
    requirements: [
      '3+ years active stage or conservatory drama experience',
      'Impeccable diction in Hindi and Urdu',
      'Physical stamina for intensive movement choreography',
      'Full commitment to 3-week daily rehearsal schedule'
    ],
    castingTeam: {
      name: 'Devashish Sen',
      title: 'Artistic Director',
      company: 'Prithvi Stage Guild',
      bio: 'National School of Drama alumnus with 20+ acclaimed directorial productions.',
      email: 'theatre@prithvistage.org',
      verified: true
    },
    roles: [
      { name: 'Haider', ageRange: '24 - 38', gender: 'Male / Non-binary', description: 'Philosophical prince wrestling with betrayal.' }
    ],
    tags: ['Theatre', 'Live Stage', 'Shakespeare Adapt', 'Prithvi'],
  },
  {
    id: 'opp-8',
    title: 'Antagonist Role — Crime Drama Series',
    category: 'Web Series',
    categoryKey: 'web-series',
    productionCompany: 'Excel Entertainment Digital',
    companyLogo: 'E',
    location: 'Delhi, India',
    ageRange: '30 - 45',
    experience: '3+ Years',
    compensation: '₹7,50,000 - ₹10,00,000',
    postedTime: 'Posted 1 day ago',
    postedDate: '2026-10-09',
    deadline: '30 Oct 2026',
    status: 'open',
    languages: 'Hindi, Punjabi',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'High stakes political mafia drama unfolding across North India. Intense narrative following power struggles in infrastructure cartels.',
    roleDescription: 'Sardar Baldev Singh: Charismatic, cold, calculative kingpin who speaks softly but wields immense political influence.',
    requirementsSummary: 'Age 30-45 • 3+ yrs exp • Hindi & Punjabi • Commanding presence',
    requirements: [
      'Proven screen experience playing nuanced gray/antagonist characters',
      'Flawless Punjabi and colloquial North Indian Hindi diction',
      'Available for 60-day shoot across NCR, Chandigarh, and Lucknow'
    ],
    castingTeam: {
      name: 'Kavish Sinha',
      title: 'Casting Director',
      company: 'Excel Digital Talent Division',
      bio: 'Leading casting professional behind acclaimed web franchises.',
      email: 'kavish@exceldigital.in',
      verified: true
    },
    roles: [
      { name: 'Baldev Singh', ageRange: '30 - 45', gender: 'Male', description: 'Ruthless strategic cartel leader.' }
    ],
    tags: ['Web Series', 'Antagonist', 'Crime Drama', 'OTT Major'],
  },
  {
    id: 'opp-9',
    title: 'Lead Performer — Regional Drama Film',
    category: 'Films',
    categoryKey: 'films',
    productionCompany: 'Bengal Cinema Guild',
    companyLogo: 'B',
    location: 'Kolkata, India',
    ageRange: '22 - 32',
    experience: '1+ Year',
    compensation: '₹2,50,000',
    postedTime: 'Posted 2 weeks ago',
    postedDate: '2026-09-26',
    deadline: '01 Oct 2026',
    status: 'closed', // Closed / Expired opportunity
    languages: 'Bengali, Hindi',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'A sensitive coming-of-age feature about classical musicians navigating the transition into the modern digital streaming era.',
    roleDescription: 'Subhadra: An accomplished sarod player torn between ancestral musical purity and contemporary collaboration.',
    requirementsSummary: 'Age 22-32 • 1+ yr exp • Bengali fluency • Classical music familiarity',
    requirements: [
      'Basic familiarity with Indian classical instruments',
      'Fluent spoken Bengali',
      'Theatre or independent film background'
    ],
    castingTeam: {
      name: 'Soumitra Mukherjee',
      title: 'Guild Casting Lead',
      company: 'Bengal Cinema Guild',
      bio: 'Championing regional cinema talents across national showcases.',
      email: 'soumitra@bengalcinema.org',
      verified: true
    },
    roles: [
      { name: 'Subhadra', ageRange: '22 - 32', gender: 'Female', description: 'Gifted classical musician facing artistic dilemmas.' }
    ],
    tags: ['Regional Film', 'Bengali Cinema', 'Drama', 'Classical Music'],
  },
  {
    id: 'opp-10',
    title: 'Commercial Model — Athletic Apparel',
    category: 'Advertisements',
    categoryKey: 'advertisements',
    productionCompany: 'Red Chillies Commercials',
    companyLogo: 'R',
    location: 'Mumbai, India',
    ageRange: '20 - 30',
    experience: 'Freshers OK',
    compensation: '₹90,000 / Shoot',
    postedTime: 'Posted 1 day ago',
    postedDate: '2026-10-09',
    deadline: '12 Nov 2026',
    status: 'open',
    languages: 'Hindi, English',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    ],
    description: 'High-energy national campaign for a leading street-style and athletic apparel brand targeting youth and fitness enthusiasts.',
    roleDescription: 'Dynamic model with athletic build, confident stance, and natural flair for urban movement.',
    requirementsSummary: 'Age 20-30 • Freshers OK • Athletic movement • 1-day shoot',
    requirements: [
      'Athletic or dancer background preferred',
      'Comfortable with motion shoots and slow-motion video captures',
      'Single day shoot in Mumbai'
    ],
    castingTeam: {
      name: 'Pooja Bhatia',
      title: 'Ad Casting Associate',
      company: 'Red Chillies Talents',
      bio: 'Leading ad-film talent coordinator.',
      email: 'pooja@redchillies.in',
      verified: true
    },
    roles: [
      { name: 'Urban Athlete', ageRange: '20 - 30', gender: 'Male / Female', description: 'Energetic street-style performer.' }
    ],
    tags: ['Commercial', 'Athletic', 'Streetwear', 'Fashion'],
  }
];
