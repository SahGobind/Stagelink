import React from 'react';
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
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { mockOpportunities } from '../../data/mockOpportunities';
import { mockTalentProfiles, FALLBACK_TALENT_AVATAR } from '../../data/mockTalentDirectory';
import { useAuth } from '../../context/AuthContext';

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

  // Curated list of top candidate profiles for continuous marquee
  const topCandidateProfiles = [
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
  ];

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
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-2.5 pb-6 sm:pt-4 sm:pb-8 border-b border-slate-200/80 cinematic-subtle-glow">
        <PageContainer className="py-0">
          {/* Dual Action Cards: Join as Performer (Left) & Join as Company & Production (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Card 1: For Artists & Performers */}
            <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-3d-floating hover:shadow-3d-card-hover hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden group specular-top flex flex-col justify-between">
              {/* Ambient Rose Light */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-black text-white flex items-center justify-center shadow-3d-button group-hover:scale-105 transition-transform duration-200 shrink-0">
                      <Sparkles className="w-5 h-5 text-rose-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                        For Artists &amp; Performers
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-950">
                        Test Your Talent
                      </h2>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100/90 border border-slate-200 rounded-full text-[10px] font-bold text-neutral-950 uppercase tracking-wider shadow-2xs">
                    Audition Hub
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Build your verified profile, submit self-tape auditions, and get discovered by top casting directors.
                </p>

                <div className="grid grid-cols-2 gap-2.5 py-1 text-[11px] text-slate-700 font-semibold">
                  <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Self-Tape Auditions</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Direct Callbacks</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 relative z-10">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/candidate/dashboard"
                      className="inline-flex items-center justify-center px-5 py-3 bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold rounded-xl shadow-3d-button-pink hover:shadow-3d-pink active:translate-y-0.5 transition-all gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Performer Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/candidate/profile"
                      className="text-xs font-semibold text-slate-600 hover:text-neutral-950 underline underline-offset-4 transition-colors"
                    >
                      View Profile →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup?role=candidate&redirect=/candidate/profile/setup"
                      className="inline-flex items-center justify-center px-5 py-3 bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold rounded-xl shadow-3d-button-pink hover:shadow-3d-pink active:translate-y-0.5 transition-all gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Join as Performer</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login?role=candidate&redirect=/candidate/dashboard"
                      className="text-xs font-semibold text-slate-600 hover:text-neutral-950 underline underline-offset-4 transition-colors"
                    >
                      Already registered? Log In →
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Card 2: For Company & Production */}
            <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-3d-floating hover:shadow-3d-card-hover hover:-translate-y-1 transition-all duration-300 space-y-4 relative overflow-hidden group specular-top flex flex-col justify-between">
              {/* Ambient Rose Light */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-black text-white flex items-center justify-center shadow-3d-button group-hover:scale-105 transition-transform duration-200 shrink-0">
                      <Building2 className="w-5 h-5 text-rose-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                        For Company &amp; Production
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-950">
                        Cast Top Talent
                      </h2>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100/90 border border-slate-200 rounded-full text-[10px] font-bold text-neutral-950 uppercase tracking-wider shadow-2xs">
                    Studio &amp; Production
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Post verified casting calls, evaluate candidate self-tapes, and cast performers directly with zero middlemen fees.
                </p>

                <div className="grid grid-cols-2 gap-2.5 py-1 text-[11px] text-slate-700 font-semibold">
                  <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Direct Casting Calls</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Verified Performer Pool</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 relative z-10">
                {isRecruiter ? (
                  <>
                    <Link
                      to="/post-job"
                      className="inline-flex items-center justify-center px-5 py-3 bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold rounded-xl shadow-3d-button-pink hover:shadow-3d-pink active:translate-y-0.5 transition-all gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Post a Casting Call</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/admin/dashboard"
                      className="text-xs font-semibold text-slate-600 hover:text-neutral-950 underline underline-offset-4 transition-colors"
                    >
                      Studio Dashboard →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup?role=recruiter&redirect=/post-job"
                      className="inline-flex items-center justify-center px-5 py-3 bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold rounded-xl shadow-3d-button-pink hover:shadow-3d-pink active:translate-y-0.5 transition-all gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Join as Company &amp; Production</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login?role=recruiter&redirect=/admin/dashboard"
                      className="text-xs font-semibold text-slate-600 hover:text-neutral-950 underline underline-offset-4 transition-colors"
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
      <section className="bg-neutral-50/70 py-5 sm:py-7 border-b border-neutral-200 overflow-hidden">
        <PageContainer className="py-0 space-y-5">
          {/* Track 1: Top Production Companies & Countries */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200/80 text-black text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Global Production Hubs & Discovered Talent</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-black tracking-tight">
                  Top Production Companies & Countries Casting on StageLink
                </h2>
              </div>
              <span className="text-xs font-medium text-neutral-500 hidden sm:inline">
                Hover card to pause • Direct opportunity access
              </span>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl py-1">
              {/* Edge gradient masks */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-neutral-50 via-neutral-50/80 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-neutral-50 via-neutral-50/80 to-transparent z-10" />

              <div className="flex animate-marquee-continuous py-2 gap-4 px-1">
                {[...TOP_PRODUCTION_COUNTRIES, ...TOP_PRODUCTION_COUNTRIES].map((country, index) => (
                  <div
                    key={`country-${index}`}
                    className="w-[270px] sm:w-[310px] md:w-80 shrink-0 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-subtle hover:shadow-card hover:border-black transition-all text-left flex flex-col justify-between group cursor-pointer h-[195px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-6 sm:w-9 sm:h-6.5 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs relative">
                            <img
                              src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                              alt={country.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span className="font-black text-[10px] text-neutral-700 select-none -z-10">
                              {country.code}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold font-serif text-black truncate group-hover:text-neutral-900 transition-colors">
                              {country.name}
                            </h3>
                            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block truncate">
                              {country.code} • Entertainment Hub
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-neutral-100 text-black text-[10px] font-bold rounded-full border border-neutral-200 shrink-0 whitespace-nowrap">
                          {country.badge}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-neutral-800 line-clamp-1">
                        {country.industry}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{country.hub}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold text-black flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-black" />
                        {country.activeCalls}
                      </span>
                      <Link
                        to={country.link}
                        className="text-xs font-bold text-black group-hover:underline flex items-center gap-1"
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
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-black tracking-tight">
                Top Candidate Profiles Casting on StageLink
              </h3>
              <span className="text-xs font-medium text-neutral-500 hidden sm:inline">
                Hover card to pause • Direct profile access
              </span>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl py-1">
              {/* Edge gradient masks */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-neutral-50 via-neutral-50/80 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-neutral-50 via-neutral-50/80 to-transparent z-10" />

              <div className="flex animate-marquee-continuous-reverse py-2 gap-4 px-1">
                {[...topCandidateProfiles, ...topCandidateProfiles].map((talent, index) => (
                  <div
                    key={`candidate-${talent.id}-${index}`}
                    className="w-[270px] sm:w-[310px] md:w-80 shrink-0 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-subtle hover:shadow-card hover:border-black transition-all text-left flex flex-col justify-between group cursor-pointer h-[195px]"
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
                            className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                          />
                          {talent.isFilmStar && (
                            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                              ★
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm sm:text-base font-bold font-serif text-black truncate group-hover:text-neutral-900 transition-colors">
                              {talent.fullName}
                            </h4>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[170px] ${
                                talent.isFilmStar
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                              }`}
                            >
                              {talent.isFilmStar ? '⭐ Film Star' : talent.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed min-h-[32px]">
                        {talent.headline}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{talent.location}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-medium text-neutral-500">
                        {talent.experienceYears ? `${talent.experienceYears} Exp` : talent.experienceLevel || 'Verified'}
                      </span>
                      <Link
                        to={`/talent/${talent.id}`}
                        className="text-xs font-bold text-black group-hover:underline flex items-center gap-1"
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
      <section className="py-5 sm:py-7 border-b border-slate-200/80 bg-slate-50/50">
        <PageContainer className="py-0">
          <div className="text-left mb-5 space-y-1">
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest block">
              Why Choose StageLink
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-950 tracking-tight">
              A Casting Platform Built Around You
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/85 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 transition-all duration-300 text-left space-y-3.5 specular-top group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-neutral-950 shadow-2xs group-hover:scale-105 group-hover:bg-rose-50/60 group-hover:text-brand-pink transition-all">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-950 font-serif">{b.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 3b. SPOTLIGHT TALENT SHOWCASE: INDIAN FILM STARS, MUSICIANS, DANCERS, GRAPHIC DESIGNERS, COMEDIANS, EUROPE */}
      <section className="py-5 sm:py-7 bg-neutral-50/60 border-b border-neutral-200">
        <PageContainer className="py-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 text-left gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-brand-pink text-xs font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Performer Showcase</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-black tracking-tight">
                Discover Artists Across Creative Disciplines &amp; Countries
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-xl">
                Explore Indian film stars, classical &amp; soundtrack musicians, professional dancers, key art graphic designers, and European performers ready for casting calls.
              </p>
            </div>

            <Link
              to={isRecruiter ? '/talent' : '/login?role=recruiter&redirect=/talent'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-brand-pink group self-start md:self-end"
            >
              <span>Explore All Verified Talent</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Indian Film Stars */}
            <Link
              to={isRecruiter ? '/talent?category=Film Stars&region=india' : '/login?role=recruiter&redirect=/talent'}
              className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:border-amber-400 hover:shadow-card transition-all flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center shadow-xs">
                    <Star className="w-6 h-6 fill-amber-950" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
                    🇮🇳 Indian Film Stars
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif text-black group-hover:text-amber-600 transition-colors">
                  Bollywood &amp; Pan-India Stars
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Leading screen actors and dramatic icons with blockbuster credits across Bollywood, South Indian cinema, and major OTT streaming originals.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-500">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Amitabh Bachchan</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Aamir Khan</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Akshay Kumar</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Shahid Kapoor</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-amber-600">
                <span>View Film Stars</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Musicians & Composers */}
            <Link
              to={isRecruiter ? '/talent?category=Musicians' : '/login?role=recruiter&redirect=/talent'}
              className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:border-purple-400 hover:shadow-card transition-all flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Music className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-extrabold uppercase tracking-wider">
                    🎵 Musicians &amp; Scores
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif text-black group-hover:text-purple-600 transition-colors">
                  Soundtracks &amp; Instrumentalists
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Playback vocalists, classical sitar masters, Italian cello soloists, and Berlin electronic sound designers crafting original film scores.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-500">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Aarav Mukherjee (🇮🇳)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Matteo Rossi (🇮🇹)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Lukas Weber (🇩🇪)</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-purple-600">
                <span>View Musicians</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Dancers & Choreographers */}
            <Link
              to={isRecruiter ? '/talent?category=Dancers' : '/login?role=recruiter&redirect=/talent'}
              className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:border-rose-400 hover:shadow-card transition-all flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
                    💃 Dancers &amp; Movement
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif text-black group-hover:text-rose-600 transition-colors">
                  Kathak, Bollywood &amp; Ballet
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Classical Kathak and Bharatanatyam soloists, Bollywood choreographers, Paris Opera-trained ballet dancers, and Spanish Flamenco performers.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-500">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Ananya Iyer (🇮🇳)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Camille Laurent (🇫🇷)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Elena Gómez (🇪🇸)</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-rose-600">
                <span>View Dancers</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Graphic Designers */}
            <Link
              to={isRecruiter ? '/talent?category=Graphic Designers' : '/login?role=recruiter&redirect=/talent'}
              className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:border-sky-400 hover:shadow-card transition-all flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Palette className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-900 border border-sky-200 text-[10px] font-extrabold uppercase tracking-wider">
                    🎨 Graphic Designers
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif text-black group-hover:text-sky-600 transition-colors">
                  Key Art &amp; Movie Posters
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Film poster compositors, theatrical key art directors, typography artists, and 3D opening title sequence motion designers.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-500">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Arjun Varma (🇮🇳)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Sofia Lindqvist (🇸🇪)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Julian Moreau (🇫🇷)</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-sky-600">
                <span>View Graphic Designers</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 5. Comedians */}
            <Link
              to={isRecruiter ? '/talent?category=Comedians' : '/login?role=recruiter&redirect=/talent'}
              className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:border-emerald-400 hover:shadow-card transition-all flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Smile className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                    🎭 Comedians &amp; Satire
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif text-black group-hover:text-emerald-600 transition-colors">
                  Stand-Up &amp; Character Comedy
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Touring stand-up comedians, Netflix comedy special performers, British satire artists, and physical comedy specialists for feature comedies.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-500">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Kunal Mathur (🇮🇳)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Oliver Wright (🇬🇧)</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">Manon Dubois (🇫🇷)</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-emerald-600">
                <span>View Comedians</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 6. European Countries */}
            <Link
              to={isRecruiter ? '/talent?region=europe' : '/login?role=recruiter&redirect=/talent'}
              className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:border-blue-400 hover:shadow-card transition-all flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
                    🇪🇺 European Countries
                  </span>
                </div>
                <h3 className="text-base font-bold font-serif text-black group-hover:text-blue-600 transition-colors">
                  International European Roster
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Verified talent from across the United Kingdom, France, Germany, Italy, Spain, Ireland, and Sweden for cross-border and co-productions.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-500">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">🇬🇧 UK</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">🇫🇷 France</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">🇩🇪 Germany</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">🇮🇹 Italy</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">🇪🇸 Spain</span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md">🇸🇪 Sweden</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-blue-600">
                <span>View European Talent</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* 4 & 5. OPPORTUNITIES (ONLY ACCESSIBLE AFTER REGISTRATION & LOGIN) */}
      {isAuthenticated && (
        <>


          {/* 5. FEATURED CASTINGS */}
          <section>
            <PageContainer>
              <div className="flex items-end justify-between mb-8">
                <div className="text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight">
                    Featured Opportunities
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">
                    Hand-picked opportunities from trusted production houses and studios.
                  </p>
                </div>
                <Link
                  to="/opportunities"
                  className="text-xs font-bold text-black hover:text-neutral-700 flex items-center gap-1 group"
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
        </>
      )}

      {/* 6. HOW IT WORKS (4 STEPS) */}
      <section className="bg-slate-50/70 py-5 sm:py-7 border-b border-slate-200/80">
        <PageContainer className="py-0">
          <div className="text-left mb-5 space-y-1">
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest block">
              The Journey
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-950 tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
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
                  className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/85 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative text-left group specular-top"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-neutral-950 shadow-2xs group-hover:scale-105 group-hover:bg-rose-50/60 group-hover:text-brand-pink transition-all">
                        <Icon className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <span className="text-2xl font-bold font-serif text-slate-300 group-hover:text-neutral-950 transition-colors">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-950 font-serif mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                    {step.num === '01' && (
                      <Link
                        to={isAuthenticated ? '/candidate/profile/setup' : '/signup?redirect=/candidate/profile/setup'}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-pink hover:underline mt-4 group"
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

    </div>
  );
};

export default HomePage;
