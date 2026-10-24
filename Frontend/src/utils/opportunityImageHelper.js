/**
 * Opportunity Image Helper
 * Provides curated, verified cinematic images, category smart defaults,
 * and robust fallback resolution so opportunity images never show broken icons.
 */

export const CINEMATIC_PRESETS = [
  {
    id: 'film-classic',
    label: 'Feature Film / Cinema',
    category: 'Film & TV',
    url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    description: '35mm cinema camera and reels',
  },
  {
    id: 'cinema-theatre',
    label: 'Theatrical Release',
    category: 'Film & TV',
    url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    description: 'Cinema projector and audience seats',
  },
  {
    id: 'web-series',
    label: 'Web Series / OTT',
    category: 'Web Series',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    description: 'Modern studio cameras and lighting set',
  },
  {
    id: 'commercial',
    label: 'Commercial / TVC',
    category: 'Advertisements',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    description: 'Brand advertisement and lifestyle production',
  },
  {
    id: 'theatre-stage',
    label: 'Theatre / Stage Play',
    category: 'Theatre',
    url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    description: 'Dramatic stage spotlight and curtains',
  },
  {
    id: 'music-video',
    label: 'Music Video',
    category: 'Music Videos',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant neon concert and musical performance',
  },
  {
    id: 'modeling-fashion',
    label: 'Fashion / Print Shoot',
    category: 'Modeling',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    description: 'High fashion editorial runway and studio',
  },
  {
    id: 'digital-social',
    label: 'YouTube / Social / UGC',
    category: 'Digital Content & Social Media',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Digital creator and content studio setup',
  },
  {
    id: 'corporate-training',
    label: 'Corporate Film / Training',
    category: 'Corporate & Training',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: 'Modern corporate architecture and business production',
  },
  {
    id: 'gaming-mocap',
    label: 'Game / Motion Capture',
    category: 'Gaming & Motion Capture',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'High-tech gaming and motion capture technology',
  },
  {
    id: 'documentary',
    label: 'Documentary Production',
    category: 'Documentary',
    url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
    description: 'Documentary location shooting',
  },
];

const KNOWN_BROKEN_PATTERNS = [
  'via.placeholder.com',
  'placeholder.com',
];

/**
 * Checks if an image URL is empty, missing, or known to 404
 */
export const isBrokenImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) return true;
  return KNOWN_BROKEN_PATTERNS.some((pattern) => url.includes(pattern));
};

/**
 * Resolves the best matching preset based on category and type strings
 */
export const getCategoryFallbackImage = (category = '', type = '') => {
  const query = `${category} ${type}`.toLowerCase();

  if (query.includes('theatre') || query.includes('theater') || query.includes('stage') || query.includes('play')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'theatre-stage').url;
  }
  if (query.includes('game') || query.includes('motion capture') || query.includes('mocap')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'gaming-mocap').url;
  }
  if (query.includes('corporate') || query.includes('training') || query.includes('recruitment')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'corporate-training').url;
  }
  if (query.includes('youtube') || query.includes('tiktok') || query.includes('ugc') || query.includes('influencer')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'digital-social').url;
  }
  if (query.includes('music') || query.includes('song') || query.includes('concert') || query.includes('live event')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'music-video').url;
  }
  if (query.includes('ad') || query.includes('commercial') || query.includes('brand') || query.includes('tvc') || query.includes('campaign')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'commercial').url;
  }
  if (query.includes('model') || query.includes('fashion') || query.includes('shoot') || query.includes('photography') || query.includes('lifestyle')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'modeling-fashion').url;
  }
  if (query.includes('web') || query.includes('series') || query.includes('ott') || query.includes('digital')) {
    return CINEMATIC_PRESETS.find((p) => p.id === 'web-series').url;
  }

  // Default to cinematic feature film
  return CINEMATIC_PRESETS[0].url;
};

/**
 * Validates and returns a safe, beautiful image for an opportunity
 */
export const resolveOpportunityImage = (opportunity) => {
  if (opportunity?.image && !isBrokenImageUrl(opportunity.image)) {
    return opportunity.image;
  }
  return getCategoryFallbackImage(
    opportunity?.productionCategory || opportunity?.category,
    opportunity?.productionType || opportunity?.type
  );
};
