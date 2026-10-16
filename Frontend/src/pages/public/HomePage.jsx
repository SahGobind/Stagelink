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
  Lock,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { OPPORTUNITY_CATEGORIES, mockOpportunities } from '../../data/mockOpportunities';
import { useAuth } from '../../context/AuthContext';

const PRODUCTION_COMPANIES = [
  {
    name: 'Netflix Studios',
    type: 'Global OTT & Film',
    activeCalls: '28 Active Roles',
    location: 'Mumbai & Los Angeles',
    badge: 'Verified Studio',
  },
  {
    name: 'Dharma Productions',
    type: 'Feature Film House',
    activeCalls: '14 Active Roles',
    location: 'Mumbai',
    badge: 'Premier Partner',
  },
  {
    name: 'Yash Raj Films',
    type: 'Theatrical Productions',
    activeCalls: '19 Active Roles',
    location: 'Mumbai & UK',
    badge: 'Premier Partner',
  },
  {
    name: 'A24 Films',
    type: 'Independent Cinema',
    activeCalls: '9 Active Roles',
    location: 'Global / Remote',
    badge: 'Verified Studio',
  },
  {
    name: 'Red Chillies Ent.',
    type: 'Cinema & VFX Studio',
    activeCalls: '12 Active Roles',
    location: 'Mumbai',
    badge: 'Premier Partner',
  },
  {
    name: 'Excel Entertainment',
    type: 'Web Series & Features',
    activeCalls: '11 Active Roles',
    location: 'Mumbai & Goa',
    badge: 'Verified Studio',
  },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const steps = [
    {
      num: '01',
      title: 'Create Your Profile',
      desc: 'Sign up and build your verified professional acting portfolio, headshots, and showreels.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Discover Opportunities',
      desc: 'Filter casting calls by production type, character profile, compensation, and location.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Apply for Roles',
      desc: 'Submit your tailored pitch, cover notes, and self-tape auditions with a single click.',
      icon: Send,
    },
    {
      num: '04',
      title: 'Connect with Casting Teams',
      desc: 'Receive direct audition callbacks, live screening requests, and casting notifications.',
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
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-8 pb-12 lg:pt-14 lg:pb-16 border-b border-neutral-200">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-xs font-bold text-black uppercase tracking-widest block">
                A Platform for Talented Artists & Performers
              </span>

              <h1 className="text-4xl sm:text-6xl font-bold font-serif text-black leading-[1.1] tracking-tight">
                Your Talent. <br />
                Your Next Role. <br />
                <span className="text-black italic font-serif">New Stories.</span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-lg">
                StarCast connects aspiring and seasoned performers directly with visionary directors, film productions, OTT series, and commercial casting agencies.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to={isAuthenticated ? '/candidate/profile/setup' : '/signup?redirect=/candidate/profile/setup'}
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Performer Profile</span>
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/opportunities"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-neutral-50 text-black border border-neutral-300 text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore Opportunities</span>
                  </Link>
                )}
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-neutral-600 hover:text-black text-xs font-bold transition-colors"
                >
                  <span>How StarCast Works →</span>
                </Link>
              </div>
            </div>

            {/* Right Side: TEST YOUR TALENT & PRODUCTION Feature Cards */}
            <div className="lg:col-span-6 space-y-5 text-left">
              {/* Feature 1: TEST YOUR TALENT */}
              <div className="bg-neutral-50 rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-subtle hover:border-black/30 transition-all space-y-4 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                        For Artists & Performers
                      </span>
                      <h2 className="text-xl font-bold font-serif text-black">
                        Test Your Talent
                      </h2>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-[10px] font-bold text-black uppercase tracking-wider">
                    Audition Hub
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Put your acting skills to the test. Sign up to build your verified performer profile, upload self-tape auditions, and connect directly with casting directors.
                </p>

                <div className="grid grid-cols-2 gap-2 py-1 text-[11px] text-neutral-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>Self-Tape Auditions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>Direct Director Reach</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  {isAuthenticated ? (
                    <Link
                      to="/candidate/profile/setup"
                      className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create / Edit Your Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/signup?from=test-your-talent&redirect=/candidate/profile/setup"
                        className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up to Create Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/login?redirect=/candidate/profile/setup"
                        className="text-xs font-medium text-neutral-600 hover:text-black underline underline-offset-4"
                      >
                        Already have an account? Log In →
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Feature 2: PRODUCTION */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-subtle hover:border-black/30 transition-all space-y-4 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                        For Casting Directors & Studios
                      </span>
                      <h2 className="text-xl font-bold font-serif text-black">
                        Production
                      </h2>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-[10px] font-bold text-black uppercase tracking-wider">
                    Studio Portal
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Post casting calls for your upcoming feature film, web series, or TV commercial. Access 5,000+ verified performers, review auditions, and complete secure payment.
                </p>

                <div className="grid grid-cols-2 gap-2 py-1 text-[11px] text-neutral-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>5,000+ Verified Artists</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>Instant Payment & Publish</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  {isAuthenticated ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Studio Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/post-job"
                        className="text-xs font-medium text-neutral-600 hover:text-black underline underline-offset-4"
                      >
                        Post a Casting Call →
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/signup?from=production&role=admin&redirect=/admin/dashboard"
                        className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up to Create Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/login?redirect=/admin/dashboard"
                        className="text-xs font-medium text-neutral-600 hover:text-black underline underline-offset-4"
                      >
                        Already have an account? Log In →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Demo Stats Metrics Strip */}
          <div className="mt-14 pt-8 border-t border-neutral-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-serif text-black">5,000+</p>
                <p className="text-xs text-neutral-600 mt-0.5 font-medium">Talented Artists</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-serif text-black">300+</p>
                <p className="text-xs text-neutral-600 mt-0.5 font-medium">Production Houses</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-serif text-black">1,000+</p>
                <p className="text-xs text-neutral-600 mt-0.5 font-medium">Casting Opportunities</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-serif text-black">95%</p>
                <p className="text-xs text-neutral-600 mt-0.5 font-medium">Success Stories</p>
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 mt-3 text-left">
              * Platform metrics shown for demonstration purposes.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* 2. PRODUCTION COMPANIES LISTED SECTION */}
      <section className="bg-neutral-50/70 py-14 border-y border-neutral-200">
        <PageContainer>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-left gap-4">
            <div>
              <span className="text-xs font-bold text-black uppercase tracking-widest block">
                Production Companies & Studios
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight mt-1">
                Top Production Houses Casting on StarCast
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-xl">
                Leading film studios, OTT platforms, and commercial production houses discover and cast professional talent every day.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/post-job"
                className="inline-flex items-center px-5 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Post a Job as Production House</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Production Houses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTION_COMPANIES.map((company, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:shadow-card transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 bg-neutral-100 text-black text-[10px] font-bold rounded-full border border-neutral-200">
                      {company.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-serif text-black">{company.name}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{company.type} • {company.location}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-black flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-black" />
                    {company.activeCalls}
                  </span>
                  {isAuthenticated ? (
                    <Link
                      to="/opportunities"
                      className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                    >
                      <span>View Castings</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      to="/login?redirect=/opportunities"
                      className="text-xs font-bold text-neutral-700 hover:text-black hover:underline flex items-center gap-1"
                    >
                      <span>Login to View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Banner for Production Houses to Post Job & Go to Payment */}
          <div className="mt-10 bg-black text-white rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-left">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                For Casting Directors & Studios
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                Looking to Cast for Your Next Film, Series, or Commercial?
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Fill in your role breakdown, select your listing tier, and proceed to our secure payment gateway to publish your casting call instantly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
              <Link
                to="/post-job"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-neutral-100 text-black text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
              >
                <span>List a Job / Casting Call</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 3. PLATFORM BENEFITS SECTION */}
      <section>
        <PageContainer>
          <div className="text-left mb-8 space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              Why Choose StarCast
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight">
              A Casting Platform Built Around You
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle hover:shadow-card transition-all duration-200 text-left space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-black font-serif">{b.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 4 & 5. OPPORTUNITIES (ONLY ACCESSIBLE AFTER REGISTRATION & LOGIN) */}
      {isAuthenticated ? (
        <>
          {/* 4. EXPLORE OPPORTUNITIES (CATEGORY ROW) */}
          <section>
            <PageContainer>
              <div className="flex items-end justify-between mb-8">
                <div className="text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight">
                    Explore Opportunities
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">
                    Find roles that match your talent and passion across all entertainment mediums.
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

              {/* Category Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {OPPORTUNITY_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/opportunities?category=${cat.id}`}
                    className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-4/3 w-full overflow-hidden bg-neutral-100">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 text-left space-y-0.5">
                      <h3 className="text-xs font-bold text-black group-hover:underline transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-neutral-600 truncate">{cat.description}</p>
                      <p className="text-[10px] text-black font-semibold pt-1">{cat.count}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </PageContainer>
          </section>

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
      ) : (
        /* Locked teaser banner for unregistered / unauthenticated users */
        <section className="bg-neutral-50/70 py-14 border-y border-neutral-200">
          <PageContainer>
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight">
                  Casting Opportunities & Auditions
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto">
                  Live casting calls, auditions, and roles are available exclusively to registered candidates. Create your performer profile or log in to unlock full access.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/signup?redirect=/opportunities"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register to View Opportunities</span>
                </Link>
                <Link
                  to="/login?redirect=/opportunities"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-xs font-bold rounded-xl transition-colors"
                >
                  <span>Log In</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      )}

      {/* 6. HOW IT WORKS (4 STEPS) */}
      <section className="bg-neutral-50/50 py-14 border-y border-neutral-200">
        <PageContainer>
          <div className="text-left mb-10 space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              The Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight">
              How It Works
            </h2>
            <p className="text-xs text-neutral-600">
              A simple, four-step process to get noticed and start your professional acting journey.
            </p>
          </div>

          {/* Connected Steps Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle flex flex-col justify-between relative text-left group hover:border-black/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold font-serif text-neutral-300">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-black font-sans mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {step.desc}
                    </p>
                    {step.num === '01' && (
                      <Link
                        to={isAuthenticated ? '/candidate/profile/setup' : '/signup?redirect=/candidate/profile/setup'}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-black hover:underline mt-3"
                      >
                        <span>Start Profile Setup</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 7. CALL TO ACTION BOTTOM BANNER */}
      <section>
        <PageContainer>
          <div className="bg-black text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl space-y-3 text-left">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight leading-snug">
                Ready to Show Your Talent to the World?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Create your profile today and take the first step towards your next casting breakthrough.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-4 shrink-0">
              <Link
                to={isAuthenticated ? '/candidate/profile/setup' : '/signup?redirect=/candidate/profile/setup'}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-neutral-100 text-black text-xs font-bold rounded-xl shadow-xs transition-all duration-200 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Your Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/post-job"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold rounded-xl transition-all duration-200 gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Post a Job</span>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default HomePage;
