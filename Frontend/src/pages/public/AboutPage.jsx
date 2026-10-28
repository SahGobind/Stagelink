import React from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Sparkles,
  ShieldCheck,
  Lock,
  Eye,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Video,
  Search,
  Send,
  Calendar,
  Zap,
  Star,
  UserCheck,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import BackButton from '../../components/common/BackButton';

const AboutPage = () => {
  const steps = [
    {
      num: '01',
      title: 'Setup & Publish',
      candidateText: 'Performers build verified portfolios with headshots, showreels, and verified skill sets.',
      companyText: 'Casting directors post verified casting calls with detailed character criteria and scripts.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Smart Discovery',
      candidateText: 'Performers explore curated casting calls and filter legitimate roles fitting their craft.',
      companyText: 'Production teams filter verified talent by age, language, physical traits, and acting reels.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Digital Audition',
      candidateText: 'Performers submit high-quality video self-tapes directly without expensive travel.',
      companyText: 'Casting teams review organized digital tapes with synchronized notes and team ratings.',
      icon: Send,
    },
    {
      num: '04',
      title: 'Callback & Cast',
      candidateText: 'Performers receive direct callback invites, script readings, and audition schedules.',
      companyText: 'Production houses coordinate live callbacks, finalize casting, and lock the production roster.',
      icon: Calendar,
    },
  ];

  const trustHighlights = [
    {
      icon: ShieldCheck,
      title: '100% Verified Production Houses',
      desc: 'Every production entity and casting call is manually vetted to ensure safe, legitimate audition standards and prevent casting fraud.',
    },
    {
      icon: UserCheck,
      title: 'Authentic & Verified Performer Roster',
      desc: 'Directors connect directly with real, verified actors showcasing genuine headshots, verified film credits, and up-to-date showreels.',
    },
    {
      icon: Lock,
      title: 'Protected Media & Contact Privacy',
      desc: 'Personal phone numbers, self-tapes, and sensitive portfolio media are securely protected and shared only with authorized casting teams.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 text-left bg-[#111214] text-neutral-100 font-sans">
      {/* 1. HERO SECTION */}
      <section className="bg-[#18191C]/70 pt-12 pb-16 border-b border-neutral-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FA5A36]/5 rounded-full blur-3xl pointer-events-none" />
        <PageContainer maxWidth="lg" className="space-y-6 relative z-10">
          <div>
            <BackButton fallback="/" variant="dark" />
          </div>
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
              About StageLink
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-sans text-white tracking-tight leading-tight">
              One Unified Stage for <br />
              <span className="text-[#FA5A36]">Candidates</span> &amp; <span className="text-white">Casting Teams.</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed pt-2">
              StageLink connects extraordinary talent with visionary production houses on a single transparent platform. We eliminate middlemen, protect artists from scams, and give casting directors instant access to verified performers.
            </p>
          </div>

          {/* Quick Platform Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-semibold text-neutral-300">
            <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0" />
              <span>Verified Casting Calls</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0" />
              <span>Verified Talent Pool</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0" />
              <span>Digital Self-Tapes</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0" />
              <span>Zero Middlemen Fees</span>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. DUAL-PILLAR COHESIVE PLATFORM (SIMILAR, NOT SEPARATED) */}
      <section>
        <PageContainer maxWidth="lg" className="space-y-8">
          <div className="text-left space-y-2">
            <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
              The StageLink Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
              Built Symmetrically for Candidates &amp; Companies
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Two sides of the same industry working together in complete harmony—from initial discovery to final casting call.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Candidate Side */}
            <div className="bg-[#18191C] p-7 sm:p-8 rounded-3xl border border-neutral-800 shadow-xl hover:border-[#FA5A36]/40 transition-all flex flex-col justify-between group relative">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#FA5A36]/10 border border-[#FA5A36]/30 flex items-center justify-center text-[#FA5A36]">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-neutral-900 border border-neutral-700/80 rounded-full text-[#FA5A36]">
                    For Candidates
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-sans">
                    Get Discovered &amp; Cast Faster
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    A professional platform for aspiring and seasoned performers to build verified credentials, submit remote auditions, and connect directly with genuine film and OTT directors.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs text-neutral-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Verified Acting Profiles:</strong> Showcase professional headshots, physical attributes, acting credits, and showreels.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Verified Casting Calls:</strong> Explore and apply to verified feature films, commercials, series, and theatre.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Digital Self-Tapes:</strong> Submit audition videos and audition sides remotely without traveling.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Direct Callback Alerts:</strong> Receive notifications, schedule callbacks, and chat directly with directors.</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup?role=candidate&redirect=/candidate/profile/setup"
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold rounded-xl shadow-md transition-all gap-2"
                >
                  <span>Register as Candidate</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Company Side */}
            <div className="bg-[#18191C] p-7 sm:p-8 rounded-3xl border border-neutral-800 shadow-xl hover:border-neutral-700 transition-all flex flex-col justify-between group relative">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-[#FA5A36]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-neutral-900 border border-neutral-700/80 rounded-full text-neutral-300">
                    For Companies &amp; Studios
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-sans">
                    Scout &amp; Cast Verified Talent
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    A comprehensive suite for casting directors and production houses to post opportunities, review categorized self-tapes, and assemble the perfect cast with zero hassle.
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs text-neutral-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Post Casting Calls:</strong> Define role requirements, character sides, age brackets, languages, and locations.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Filter Vetted Talent:</strong> Search candidates by physical traits, skill ratings, past work, and video showreels.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Organized Audition Suite:</strong> Evaluate candidate self-tapes with synchronized team notes and ratings.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FA5A36] shrink-0 mt-0.5" />
                    <span><strong>Direct Callback Management:</strong> Send audition slots, schedule callbacks, and manage shortlists easily.</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup?role=recruiter&redirect=/post-job"
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold rounded-xl shadow-md transition-all gap-2"
                >
                  <span>Register as Casting Director</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 3. HOW THEY CONNECT: 4-STEP SYMMETRICAL WORKFLOW */}
      <section className="bg-[#0E0F12] py-14 sm:py-20 border-y border-neutral-800">
        <PageContainer maxWidth="lg" className="space-y-10">
          <div className="text-left space-y-2">
            <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
              The Synchronized Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
              How Candidates &amp; Companies Connect in 4 Steps
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Each step is built to mirror both needs, creating a fast, transparent audition workflow from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-xl flex flex-col justify-between hover:border-[#FA5A36]/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-[#FA5A36]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold font-sans text-neutral-600">
                        {step.num}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white font-sans mb-3">
                      {step.title}
                    </h3>

                    <div className="space-y-2.5 text-[11px] leading-relaxed">
                      <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                        <span className="text-[#FA5A36] font-bold block mb-0.5">Candidate:</span>
                        <p className="text-neutral-300">{step.candidateText}</p>
                      </div>
                      <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                        <span className="text-neutral-200 font-bold block mb-0.5">Company:</span>
                        <p className="text-neutral-400">{step.companyText}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 4. TRUST & SECURITY FOR BOTH SIDES */}
      <section>
        <PageContainer maxWidth="lg" className="space-y-8">
          <div className="text-left space-y-2">
            <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
              Safety &amp; Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
              Safety for Performers. Authenticity for Studios.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              We hold both sides of the casting room to the highest ethical and professional standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trustHighlights.map((t, idx) => {
              const Icon = t.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#18191C] p-6 rounded-3xl border border-neutral-800 shadow-lg space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#FA5A36]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold font-sans text-white">{t.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 5. DUAL CALL TO ACTION */}
      <section>
        <PageContainer maxWidth="lg">
          <div className="bg-gradient-to-br from-[#18191C] to-[#121316] border border-neutral-800 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FA5A36]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 max-w-xl text-left relative z-10">
              <span className="text-xs font-bold text-[#FA5A36] uppercase tracking-widest block">
                Get Started Today
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-sans text-white tracking-tight">
                Step Into the Spotlight or Cast Your Next Lead
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Whether you are a talented performer ready to be discovered or a production house seeking top verified talent, StageLink is your direct casting partner.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto shrink-0 relative z-10">
              <Link
                to="/signup?role=candidate&redirect=/candidate/profile/setup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold rounded-full shadow-md transition-all gap-2"
              >
                <span>Join as Candidate</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signup?role=recruiter&redirect=/post-job"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold rounded-full shadow-md transition-all gap-2"
              >
                <span>Join as Casting Director</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default AboutPage;
