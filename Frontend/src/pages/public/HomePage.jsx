import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  UserCheck,
  Search,
  Send,
  MessageCircle,
  ShieldCheck,
  Video,
  Sparkles,
  Award,
  Building2,
  Briefcase,
  CheckCircle2,
  Film,
  UserPlus,
  Music,
  Palette,
  Smile,
  Globe,
  Star,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { mockOpportunities } from '../../data/mockOpportunities';
import { mockTalentProfiles, FALLBACK_TALENT_AVATAR } from '../../data/mockTalentDirectory';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';

export const TOP_PRODUCTION_COUNTRIES = [
  {
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    industry: 'Bollywood, South Cinema & OTT',
    hub: 'Mumbai, Hyderabad, Chennai, Bengaluru',
    activeCalls: '180+ Active Calls',
    badge: 'Premier Film Hub',
    link: '/opportunities?search=India',
  },
  {
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    industry: 'Hollywood & Global Streamers',
    hub: 'Los Angeles, New York, Atlanta',
    activeCalls: '240+ Active Calls',
    badge: 'Global Production Hub',
    link: '/opportunities?search=USA',
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    industry: 'British Film, BBC & Pinewood',
    hub: 'London, Pinewood, Bristol',
    activeCalls: '135+ Active Calls',
    badge: 'Theatrical & Prestige',
    link: '/opportunities?search=UK',
  },
  {
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    industry: 'Cannes Arthouse & French Cinema',
    hub: 'Paris, Cannes, Lyon',
    activeCalls: '85+ Active Calls',
    badge: 'European Auteur Hub',
    link: '/opportunities?search=France',
  },
  {
    name: 'South Korea',
    code: 'KR',
    flag: '🇰🇷',
    industry: 'K-Drama & Chungmuro Studios',
    hub: 'Seoul, Busan',
    activeCalls: '110+ Active Calls',
    badge: 'Global Hallyu Wave',
    link: '/opportunities?search=Korea',
  },
  {
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    industry: 'Studio Babelsberg & Co-Productions',
    hub: 'Berlin, Munich, Cologne',
    activeCalls: '75+ Active Calls',
    badge: 'European Cinema Base',
    link: '/opportunities?search=Germany',
  },
  {
    name: 'Italy',
    code: 'IT',
    flag: '🇮🇹',
    industry: 'Cinecittà & Neorealist Heritage',
    hub: 'Rome, Milan, Venice',
    activeCalls: '65+ Active Calls',
    badge: 'Cine & Fashion Capital',
    link: '/opportunities?search=Italy',
  },
  {
    name: 'Spain',
    code: 'ES',
    flag: '🇪🇸',
    industry: 'Spanish OTT Originals & Cinema',
    hub: 'Madrid, Barcelona, Valencia',
    activeCalls: '90+ Active Calls',
    badge: 'Rapid-Growth Hub',
    link: '/opportunities?search=Spain',
  },
  {
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    industry: 'Hollywood North & VFX Studios',
    hub: 'Vancouver, Toronto, Montreal',
    activeCalls: '115+ Active Calls',
    badge: 'VFX & Feature Base',
    link: '/opportunities?search=Canada',
  },
  {
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    industry: 'Toho, Anime & Contemporary Screen',
    hub: 'Tokyo, Kyoto, Osaka',
    activeCalls: '70+ Active Calls',
    badge: 'Animation & Film',
    link: '/opportunities?search=Japan',
  },
  {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    industry: 'Pacific Feature Studios & Fox Studios',
    hub: 'Sydney, Melbourne, Gold Coast',
    activeCalls: '60+ Active Calls',
    badge: 'Pacific Production Hub',
    link: '/opportunities?search=Australia',
  },
  {
    name: 'Sweden',
    code: 'SE',
    flag: '🇸🇪',
    industry: 'Nordic Noir & Scandinavian Studios',
    hub: 'Stockholm, Gothenburg',
    activeCalls: '45+ Active Calls',
    badge: 'Nordic Cinema & Music',
    link: '/opportunities?search=Sweden',
  },
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const isRecruiter = isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin' || user?.role === 'super_admin');
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'Is it free for artists to sign up and apply for roles?',
      a: 'Yes, basic performer registration and applying to standard casting calls is completely free on StageLink. We believe every talented artist deserves direct access to legitimate opportunities.',
    },
    {
      q: 'How does StageLink verify casting calls and production houses?',
      a: 'Every production house and casting call posted on StageLink undergoes manual review by our team. We verify the production entity, project legitimacy, and ensure safe audition standards before public listing.',
    },
    {
      q: 'Can beginners or unrepresented actors apply?',
      a: 'Absolutely. Many casting calls on StageLink specifically seek fresh faces and debut performers across student films, commercials, and independent feature projects.',
    },
    {
      q: 'How do video auditions and self-tapes work?',
      a: 'When applying for a role with video requirements, you can paste unlisted YouTube/Vimeo links or upload video files directly. Casting teams can review your tape with synchronized notes.',
    },
    {
      q: 'What should I include in my acting profile?',
      a: 'We recommend at least 3 professional headshots (close-up, profile, full-body), an accurate physical breakdown, your training background, past production credits, and a link to your latest showreel.',
    },
  ];

  // Curated list of top candidate profiles for continuous marquee, dynamically updated with newly published artists
  const [topCandidateProfiles, setTopCandidateProfiles] = useState(() => [
    // Iconic Indian Film Stars
    ...mockTalentProfiles.filter((t) => t.isFilmStar),
    // Plus featured top verified candidates across disciplines
    ...mockTalentProfiles.filter(
      (t) =>
        !t.isFilmStar &&
        [
          'cand-1',
          'cand-2',
          'cand-3',
          'cand-4',
          'cand-5',
          'cand-6',
          'cand-arjun-design',
          'cand-kunal-comedy',
          'cand-camille',
          'cand-matteo',
        ].includes(t.id)
    ),
  ]);

  useEffect(() => {
    let isMounted = true;
    candidateService.getAll(true).then((liveTalent) => {
      if (isMounted && Array.isArray(liveTalent) && liveTalent.length > 0) {
        const dbCandidates = liveTalent.filter((t) => t.isPublished || (t.id && t.id.startsWith('usr-')));
        const stars = mockTalentProfiles.filter((t) => t.isFilmStar);
        const existingIds = new Set(dbCandidates.map((c) => c.id));
        const remaining = mockTalentProfiles.filter((t) => !existingIds.has(t.id) && !t.isFilmStar);
        setTopCandidateProfiles([...stars, ...dbCandidates, ...remaining.slice(0, 6)]);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Join',
      desc: 'Performers build verified showreels and acting portfolios, while production houses post casting calls with role criteria.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Discover',
      desc: 'Performers explore curated casting calls, while casting directors scout and filter top matching talent.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Audition',
      desc: 'Performers submit digital self-tape auditions and tailored pitches, while production teams evaluate submissions with zero middlemen.',
      icon: Send,
    },
    {
      num: '04',
      title: 'Cast',
      desc: 'Direct communication for audition callbacks, live screening requests, and final role casting between performers and studios.',
      icon: MessageCircle,
    },
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: '100% Verified Castings',
      desc: 'Every production call undergoes rigorous screening to ensure legitimate, safe, and professional opportunities.',
    },
    {
      icon: Sparkles,
      title: 'Direct Director Reach',
      desc: 'Eliminate middlemen and put your portfolio straight into the hands of casting directors and studio producers.',
    },
    {
      icon: Video,
      title: 'Seamless Video Auditions',
      desc: 'Upload self-tapes and digital showreels with ease, keeping all casting interactions organized in one place.',
    },
    {
      icon: Award,
      title: 'Career Growth & Discovery',
      desc: 'Gain exposure across feature films, OTT streaming series, national commercials, and theatre productions.',
    },
  ];

  return (
    <div>
      {/* 1. HERO SECTION MATCHING SCREENSHOT */}
      <section className="relative overflow-hidden bg-[#111214] pt-6 pb-8 sm:pt-8 sm:pb-10 border-b border-neutral-800/80">
        {/* Ambient warm glow in top-right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#FA5A36]/15 via-[#FA5A36]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 left-1/4 w-[350px] h-[350px] bg-[#FA5A36]/5 rounded-full blur-3xl pointer-events-none" />

        <PageContainer className="py-0 relative z-10">
          {/* Top row: Left has Headline + Subtitle; Right has Artist Badge (Web view only) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 text-left">
            {/* Headline and Subtitle (Compact spacing) */}
            <div className="max-w-3xl space-y-3 sm:space-y-3.5">
              <span className="text-[#FA5A36] font-bold tracking-widest text-xs uppercase block font-sans">
                THE CREATIVE INDUSTRY, CONNECTED
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white leading-[1.1] font-sans">
                Where talent meets <br className="hidden sm:inline" />
                <span className="text-[#FA5A36]">the next big idea.</span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed font-normal">
                StageLink brings artists and production companies together. Showcase your work, discover creative talent, and make the right connections for what comes next.
              </p>
            </div>

            {/* Web View Only Badge (Hidden on mobile, visible only in desktop/web view) */}
            <div className="hidden lg:flex items-center justify-center shrink-0 lg:pr-8 xl:pr-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#FA5A36]/15 rounded-3xl blur-2xl group-hover:bg-[#FA5A36]/25 transition-all duration-300 pointer-events-none" />
                <img
                  src="/hero-artist-badge.png"
                  alt="StageLink Artist"
                  className="relative z-10 w-28 h-28 xl:w-32 xl:h-32 object-contain rounded-3xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Dual Action Gateway Cards: For Artists (Left) & For Production (Right) Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-left pt-6 sm:pt-7">
            {/* Card 1: For Artists & Performers */}
            <div className="bg-[#18191C]/90 rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-xl hover:border-[#FA5A36]/40 hover:-translate-y-0.5 transition-all duration-300 space-y-4 relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FA5A36]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 text-[#FA5A36] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block font-sans">
                      For Artists &amp; Performers
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-sans text-white">
                      Test Your Talent
                    </h2>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3 relative z-10">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/candidate/dashboard"
                      className="inline-flex items-center justify-center px-4 py-2.5 bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FA5A36]/30 active:translate-y-0.5 transition-all gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Performer Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/candidate/profile"
                      className="text-xs font-semibold text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
                    >
                      View Profile →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup?role=candidate&redirect=/candidate/profile/setup"
                      className="inline-flex items-center justify-center px-4 py-2.5 bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FA5A36]/30 active:translate-y-0.5 transition-all gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Join as Performer</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login?role=candidate&redirect=/candidate/dashboard"
                      className="text-xs font-semibold text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
                    >
                      Already registered? Log In →
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Card 2: For Company & Production */}
            <div className="bg-[#18191C]/90 rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-xl hover:border-[#FA5A36]/40 hover:-translate-y-0.5 transition-all duration-300 space-y-4 relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FA5A36]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 text-[#FA5A36] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block font-sans">
                      For Company &amp; Production
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-sans text-white">
                      Hire Top Talent
                    </h2>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3 relative z-10">
                {isRecruiter ? (
                  <>
                    <Link
                      to="/post-job"
                      className="inline-flex items-center justify-center px-4 py-2.5 bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FA5A36]/30 active:translate-y-0.5 transition-all gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Post a Casting Call</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/admin/dashboard"
                      className="text-xs font-semibold text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
                    >
                      Studio Dashboard →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup?role=recruiter&redirect=/post-job"
                      className="inline-flex items-center justify-center px-4 py-2.5 bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FA5A36]/30 active:translate-y-0.5 transition-all gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Join as Company &amp; Production</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login?role=recruiter&redirect=/admin/dashboard"
                      className="text-xs font-semibold text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
                    >
                      Already registered? Log In →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. TOP PRODUCTION COUNTRIES/COMPANIES & TOP CANDIDATES (CONTINUOUS SCROLLING MARQUEE) */}
      <section className="bg-[#0E0F12] py-8 sm:py-10 border-b border-neutral-800/80 overflow-hidden">
        <PageContainer className="py-0 space-y-6">
          {/* Track 1: Top Production Companies & Countries */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <Globe className="w-3.5 h-3.5 text-[#FA5A36]" />
                  <span>Global Production Hubs & Discovered Talent</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                  Top Production Companies on StageLink
                </h2>
              </div>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl py-1">
              {/* Edge gradient masks */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0E0F12] via-[#0E0F12]/80 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0E0F12] via-[#0E0F12]/80 to-transparent z-10" />

              <div className="flex animate-marquee-continuous py-2 gap-4 px-1">
                {[...TOP_PRODUCTION_COUNTRIES, ...TOP_PRODUCTION_COUNTRIES].map((country, index) => (
                  <div
                    key={`country-${index}`}
                    className="w-[270px] sm:w-[310px] md:w-80 shrink-0 bg-[#18191C] p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-2xl hover:shadow-card hover:border-[#FA5A36]/50 transition-all text-left flex flex-col justify-between group cursor-pointer h-[195px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-6 sm:w-9 sm:h-6.5 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs relative">
                            <img
                              src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                              alt={country.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span className="font-black text-[10px] text-neutral-400 select-none -z-10">
                              {country.code}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold font-sans text-white truncate group-hover:text-[#FA5A36] transition-colors">
                              {country.name}
                            </h3>
                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block truncate">
                              {country.code} • Entertainment Hub
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] font-bold rounded-full border border-neutral-700 shrink-0 whitespace-nowrap">
                          {country.badge}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-neutral-300 line-clamp-1">
                        {country.industry}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FA5A36] shrink-0" />
                        <span className="truncate">{country.hub}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-[#FA5A36]" />
                        {country.activeCalls}
                      </span>
                      <Link
                        to={country.link}
                        className="text-xs font-bold text-[#FA5A36] group-hover:underline flex items-center gap-1"
                      >
                        <span>View Roles</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Track 2: Top Candidate Profiles / Performers */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-left">
              <h3 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                Top Candidate Profiles Casting on StageLink
              </h3>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl py-1">
              {/* Edge gradient masks */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0E0F12] via-[#0E0F12]/80 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0E0F12] via-[#0E0F12]/80 to-transparent z-10" />

              <div className="flex animate-marquee-continuous-reverse py-2 gap-4 px-1">
                {[...topCandidateProfiles, ...topCandidateProfiles].map((talent, index) => (
                  <div
                    key={`candidate-${talent.id}-${index}`}
                    className="w-[270px] sm:w-[310px] md:w-80 shrink-0 bg-[#18191C] p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-2xl hover:shadow-card hover:border-[#FA5A36]/50 transition-all text-left flex flex-col justify-between group cursor-pointer h-[195px]"
                  >
                    <div>
                      <div className="flex items-start gap-2.5 sm:gap-3 mb-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={talent.avatar || FALLBACK_TALENT_AVATAR}
                            alt={talent.fullName}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_TALENT_AVATAR;
                            }}
                            className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl object-cover border border-neutral-700 shadow-2xs"
                          />
                          {talent.isFilmStar && (
                            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                              ★
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm sm:text-base font-bold font-sans text-white truncate group-hover:text-[#FA5A36] transition-colors">
                              {talent.fullName}
                            </h4>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[170px] ${
                                talent.isFilmStar
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                              }`}
                            >
                              {talent.isFilmStar ? '⭐ Film Star' : talent.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed min-h-[32px]">
                        {talent.headline}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400">
                        <MapPin className="w-3 h-3 text-[#FA5A36] shrink-0" />
                        <span className="truncate">{talent.location}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-medium text-neutral-400">
                        {talent.experienceYears ? `${talent.experienceYears} Exp` : talent.experienceLevel || 'Verified'}
                      </span>
                      <Link
                        to={`/talent/${talent.id}`}
                        className="text-xs font-bold text-[#FA5A36] group-hover:underline flex items-center gap-1"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 3. PLATFORM BENEFITS SECTION */}
      <section className="py-10 sm:py-14 border-b border-neutral-800/80 bg-[#111214]">
        <PageContainer className="py-0">
          <div className="text-left mb-8 space-y-1">
            <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
              Why Choose StageLink
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
              A Casting Platform Built Around You
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="bg-[#18191C] p-6 sm:p-7 rounded-3xl border border-neutral-800 shadow-2xl hover:border-[#FA5A36]/50 hover:-translate-y-1 transition-all duration-300 text-left space-y-3.5 specular-top group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-[#FA5A36] shadow-md group-hover:scale-105 group-hover:bg-[#FA5A36]/10 transition-all">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-sans">{b.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 3b. SPOTLIGHT TALENT SHOWCASE: INDIAN FILM STARS, MUSICIANS, DANCERS, GRAPHIC DESIGNERS, COMEDIANS, EUROPE (ONLY ACCESSIBLE AFTER LOGIN) */}
      {isAuthenticated && (
        <section className="py-10 sm:py-14 bg-[#0E0F12] border-b border-neutral-800/80">
          <PageContainer className="py-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-left gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FA5A36]/15 border border-[#FA5A36]/30 text-[#FA5A36] text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Performer Showcase</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
                  Discover Artists Across Creative Disciplines &amp; Countries
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                  Explore Indian film stars, classical &amp; soundtrack musicians, professional dancers, key art graphic designers, and European performers ready for casting calls.
                </p>
              </div>

              <Link
                to={isRecruiter ? '/talent' : '/candidate/dashboard'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FA5A36] hover:text-[#FA5A36]/80 group self-start md:self-end"
              >
                <span>Explore All Verified Talent</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Indian Film Stars */}
              <Link
                to={isRecruiter ? '/talent?category=Film Stars&region=india' : '/candidate/dashboard'}
                className="group bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-2xl hover:border-amber-400/60 hover:-translate-y-1 transition-all flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center shadow-xs">
                      <Star className="w-6 h-6 fill-amber-950" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                      🇮🇳 Indian Film Stars
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-sans text-white group-hover:text-amber-400 transition-colors">
                    Bollywood &amp; Pan-India Stars
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Leading screen actors and dramatic icons with blockbuster credits across Bollywood, South Indian cinema, and major OTT streaming originals.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-400">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Amitabh Bachchan</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Aamir Khan</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Akshay Kumar</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Shahid Kapoor</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <span>View Film Stars</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* 2. Musicians & Composers */}
              <Link
                to={isRecruiter ? '/talent?category=Musicians' : '/candidate/dashboard'}
                className="group bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-2xl hover:border-purple-400/60 hover:-translate-y-1 transition-all flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Music className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-400/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                      🎵 Musicians &amp; Scores
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-sans text-white group-hover:text-purple-400 transition-colors">
                    Soundtracks &amp; Instrumentalists
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Playback vocalists, classical sitar masters, Italian cello soloists, and Berlin electronic sound designers crafting original film scores.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-400">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Aarav Mukherjee (🇮🇳)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Matteo Rossi (🇮🇹)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Lukas Weber (🇩🇪)</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
                  <span>View Musicians</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* 3. Dancers & Choreographers */}
              <Link
                to={isRecruiter ? '/talent?category=Dancers' : '/candidate/dashboard'}
                className="group bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-2xl hover:border-rose-400/60 hover:-translate-y-1 transition-all flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-rose-400/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                      💃 Dancers &amp; Movement
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-sans text-white group-hover:text-rose-400 transition-colors">
                    Kathak, Bollywood &amp; Ballet
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Classical Kathak and Bharatanatyam soloists, Bollywood choreographers, Paris Opera-trained ballet dancers, and Spanish Flamenco performers.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-400">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Ananya Iyer (🇮🇳)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Camille Laurent (🇫🇷)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Elena Gómez (🇪🇸)</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300">
                  <span>View Dancers</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* 4. Graphic Designers */}
              <Link
                to={isRecruiter ? '/talent?category=Graphic Designers' : '/candidate/dashboard'}
                className="group bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-2xl hover:border-sky-400/60 hover:-translate-y-1 transition-all flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Palette className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-sky-400/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                      🎨 Graphic Designers
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-sans text-white group-hover:text-sky-400 transition-colors">
                    Key Art &amp; Movie Posters
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Film poster compositors, theatrical key art directors, typography artists, and 3D opening title sequence motion designers.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-400">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Arjun Varma (🇮🇳)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Sofia Lindqvist (🇸🇪)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Julian Moreau (🇫🇷)</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300">
                  <span>View Graphic Designers</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* 5. Comedians */}
              <Link
                to={isRecruiter ? '/talent?category=Comedians' : '/candidate/dashboard'}
                className="group bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-2xl hover:border-emerald-400/60 hover:-translate-y-1 transition-all flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Smile className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                      🎭 Comedians &amp; Satire
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-sans text-white group-hover:text-emerald-400 transition-colors">
                    Stand-Up &amp; Character Comedy
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Touring stand-up comedians, Netflix comedy special performers, British satire artists, and physical comedy specialists for feature comedies.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-400">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Kunal Mathur (🇮🇳)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Oliver Wright (🇬🇧)</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">Manon Dubois (🇫🇷)</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                  <span>View Comedians</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* 6. European Countries */}
              <Link
                to={isRecruiter ? '/talent?region=europe' : '/candidate/dashboard'}
                className="group bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-2xl hover:border-blue-400/60 hover:-translate-y-1 transition-all flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-400/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                      🇪🇺 European Countries
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-sans text-white group-hover:text-blue-400 transition-colors">
                    International European Roster
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Verified talent from across the United Kingdom, France, Germany, Italy, Spain, Ireland, and Sweden for cross-border and co-productions.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-400">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">🇬🇧 UK</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">🇫🇷 France</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">🇩🇪 Germany</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">🇮🇹 Italy</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">🇪🇸 Spain</span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">🇸🇪 Sweden</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                  <span>View European Talent</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </PageContainer>
        </section>
      )}

      {/* 4 & 5. OPPORTUNITIES (ONLY ACCESSIBLE AFTER REGISTRATION & LOGIN) */}
      {isAuthenticated && (
        <section className="py-10 sm:py-14 bg-[#111214]">
          <PageContainer>
            <div className="flex items-end justify-between mb-8">
              <div className="text-left">
                <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
                  Featured Opportunities
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Hand-picked opportunities from trusted production houses and studios.
                </p>
              </div>
              <Link
                to="/opportunities"
                className="text-xs font-bold text-[#FA5A36] hover:text-[#FA5A36]/80 flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockOpportunities.slice(0, 4).map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      {/* 6. HOW IT WORKS (4 STEPS) */}
      <section className="bg-[#0E0F12] py-10 sm:py-14 border-b border-neutral-800/80">
        <PageContainer className="py-0">
          <div className="text-left mb-8 space-y-1">
            <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
              The Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-normal">
              A unified casting workflow for performers to get discovered and production houses to cast top verified talent.
            </p>
          </div>

          {/* Connected Steps Row with 3D Depth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-[#18191C] p-6 sm:p-7 rounded-3xl border border-neutral-800 shadow-2xl hover:border-[#FA5A36]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative text-left group specular-top"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-[#FA5A36] shadow-md group-hover:scale-105 group-hover:bg-[#FA5A36]/10 transition-all">
                        <Icon className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <span className="text-2xl font-bold font-sans text-neutral-600 group-hover:text-white transition-colors">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white font-sans mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                    {step.num === '01' && (
                      <Link
                        to={isAuthenticated ? '/candidate/profile/setup' : '/signup?redirect=/candidate/profile/setup'}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FA5A36] hover:underline mt-4 group"
                      >
                        <span>Start Profile Setup</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 sm:py-20 bg-[#121212] border-t border-neutral-800/80">
        <PageContainer maxWidth="lg">
          <div className="mb-10 space-y-2 text-left">
            <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#18191C] rounded-2xl border border-neutral-800 overflow-hidden transition-all duration-150"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-[#FA5A36] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-[#FA5A36]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/80 mt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

    </div>
  );
};

export default HomePage;
