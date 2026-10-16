import React from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Sparkles,
  ShieldCheck,
  Lock,
  Eye,
  Users,
  Building,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const AboutPage = () => {
  const audiences = [
    {
      icon: Users,
      title: 'Artists & Performers',
      desc: 'From fresh talent to experienced screen and theatre veterans, StarCast provides a professional stage to showcase verified headshots, showreels, and credits.',
    },
    {
      icon: Building,
      title: 'Production Houses & Studios',
      desc: 'Feature film studios, OTT content producers, and independent creators use our structured search to discover suitable talent efficiently.',
    },
    {
      icon: Film,
      title: 'Casting Directors & Agencies',
      desc: 'Simplify audition workflows, request custom self-tapes, review portfolios, and manage talent shortlists with complete confidentiality.',
    },
    {
      icon: Sparkles,
      title: 'Commercial & Fashion Brands',
      desc: 'Discover photogenic, versatile models and brand ambassadors for national television commercials, fashion weeks, and digital campaigns.',
    },
  ];

  const pillars = [
    {
      title: 'Verified Casting Calls',
      desc: 'We screen production houses and casting agencies before listings go live to guarantee legitimacy and safe production environments.',
    },
    {
      title: 'Equal Opportunity Discovery',
      desc: 'Talent is matched based on skill, suitability, and performance rather than arbitrary barriers, opening doors for diverse performers.',
    },
    {
      title: 'Direct, Transparent Communication',
      desc: 'No confusing intermediaries. Performers and casting directors converse directly regarding schedules, script sides, and audition callback details.',
    },
    {
      title: 'Professional Self-Tape Submissions',
      desc: 'High-speed digital video submissions allow actors worldwide to audition without unnecessary travel hurdles.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 text-left">
      {/* 1. HERO SECTION */}
      <section className="bg-white pt-10 pb-14 border-b border-brand-border">
        <PageContainer maxWidth="lg" className="space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              About StarCast
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-serif text-black tracking-tight leading-tight">
              Empowering Performers. <br />
              Elevating the Craft of <span className="text-black italic font-serif">Casting.</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl pt-2">
              StarCast was founded with a singular mission: to build a modern, cinematic, and transparent ecosystem where extraordinary talent and visionary productions discover each other seamlessly.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* 2. PLATFORM PURPOSE */}
      <section>
        <PageContainer maxWidth="lg">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 space-y-4">
              <span className="text-xs font-bold text-black uppercase tracking-widest block">
                Our Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">
                Bridging the Gap Between Casting Call & Final Cut
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                The traditional casting landscape is often fragmented, opaque, and difficult for emerging performers to navigate. StarCast replaces outdated channels with an intuitive, unified platform that safeguards talent while giving filmmakers instant access to a curated roster of performers.
              </p>
              <div className="space-y-2 pt-2 text-xs text-black font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Eliminating predatory casting scams through verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Standardizing actor profile submissions across the industry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Respecting performer privacy and intellectual property</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-neutral-100 shadow-card border border-neutral-200">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                  alt="Acting performance"
                  className="w-full h-full object-cover grayscale contrast-105"
                />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 3. WHO THE PLATFORM SERVES */}
      <section className="bg-neutral-50/50 py-14 border-y border-neutral-200">
        <PageContainer maxWidth="lg">
          <div className="mb-10 space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              Our Community
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">
              Who We Serve
            </h2>
            <p className="text-xs text-neutral-600">
              A comprehensive platform tailored for every key stakeholder in the entertainment industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {audiences.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold font-serif text-black">{aud.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{aud.desc}</p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* 4. HOW STARCAST SUPPORTS PROFESSIONAL CASTING */}
      <section>
        <PageContainer maxWidth="lg">
          <div className="mb-10 space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              Industry Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">
              How StarCast Supports Professional Casting
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pil, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-subtle space-y-2"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-100 text-black font-bold text-xs flex items-center justify-center mb-2">
                  0{idx + 1}
                </div>
                <h3 className="text-sm font-bold font-serif text-black">{pil.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{pil.desc}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* 5. TRUST, PRIVACY & TRANSPARENCY */}
      <section className="bg-black text-white py-14 rounded-3xl mx-4 sm:mx-8">
        <PageContainer maxWidth="lg">
          <div className="space-y-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">
                Safety & Ethics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                Trust, Privacy & Performer Protection
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                We believe trust is the cornerstone of creative collaboration. StarCast enforces strict security policies to protect performer data and promote safe casting environments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-2">
                <ShieldCheck className="w-8 h-8 text-white mb-2" />
                <h4 className="text-sm font-bold font-serif">Production Verification</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Only verified corporate entities and validated casting professionals can post casting calls and review audition self-tapes.
                </p>
              </div>

              <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-2">
                <Lock className="w-8 h-8 text-white mb-2" />
                <h4 className="text-sm font-bold font-serif">Data & Media Privacy</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Contact numbers and private media files are protected and shared only with authorized productions to which you submit.
                </p>
              </div>

              <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-2">
                <Eye className="w-8 h-8 text-white mb-2" />
                <h4 className="text-sm font-bold font-serif">Zero-Tolerance Policy</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Clear guidelines against unauthorized casting charges, exploitation, or non-standard requirements.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 6. CALL TO ACTION TO CREATE PROFILE */}
      <section>
        <PageContainer maxWidth="lg">
          <div className="bg-neutral-100 border border-neutral-200 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold font-serif text-black">
                Ready to Join the StarCast Roster?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Create your professional acting profile today and explore hundreds of verified casting opportunities.
              </p>
            </div>

            <Link
              to="/signup?redirect=/candidate/profile/setup"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2 shrink-0"
            >
              <span>Create Your Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default AboutPage;
