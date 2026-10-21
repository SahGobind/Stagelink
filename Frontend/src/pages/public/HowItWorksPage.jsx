import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Send,
  MessageCircle,
  FileText,
  Filter,
  CheckCircle,
  Calendar,
  ChevronDown,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';

const HowItWorksPage = () => {
  const { isAuthenticated, user } = useAuth();
  const isRecruiter = isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin');
  const [activeFaq, setActiveFaq] = useState(null);

  const candidateSteps = [
    {
      num: '01',
      title: 'Build Your Verified Portfolio',
      desc: 'Register and assemble your artist biography, high-resolution headshots, acting reels, physical attributes, and performance experience.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Filter & Discover Relevant Roles',
      desc: 'Search our real-time database of casting calls. Filter by project medium (Feature Film, OTT Series, Commercial), character traits, compensation, and location.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Submit Audition Tapes & Pitch',
      desc: 'Apply directly through the platform. Attach your self-tape videos, tailored introductory cover notes, and monologue clips for casting directors.',
      icon: Send,
    },
    {
      num: '04',
      title: 'Receive Direct Audition Callbacks',
      desc: 'Stay notified on application milestones. Communicate directly with studio casting directors for callback schedules and live reading dates.',
      icon: MessageCircle,
    },
  ];

  const adminSteps = [
    {
      num: '01',
      title: 'Post Detailed Casting Breakdown',
      desc: 'Publish your character breakdowns, production timelines, location requirements, and compensation tiers with instant reach to verified talent.',
      icon: FileText,
    },
    {
      num: '02',
      title: 'Filter & Review Talent Pool',
      desc: 'Browse applicants using multi-criteria filters including age bracket, acting background, physical profile, and showreel availability.',
      icon: Filter,
    },
    {
      num: '03',
      title: 'Shortlist Top Performers',
      desc: 'Evaluate submitted self-tapes alongside artist portfolios, assign internal notes, and organize candidate lists with your creative team.',
      icon: CheckCircle,
    },
    {
      num: '04',
      title: 'Schedule Auditions & Callbacks',
      desc: 'Send callback invitations, request script readings, and coordinate audition slots directly via StageLink’s messaging suite.',
      icon: Calendar,
    },
  ];

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

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 text-left">
      {/* 1. HERO SECTION */}
      <section className="bg-white pt-10 pb-14 border-b border-neutral-200">
        <PageContainer maxWidth="lg" className="space-y-4">
          <span className="text-xs font-bold text-black uppercase tracking-widest block">
            The Process
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-black tracking-tight leading-tight">
            How StageLink Works
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
            A transparent, modern casting platform tailored for both performers seeking breakthrough roles and production teams discovering top talent.
          </p>
        </PageContainer>
      </section>

      {/* 2. FOR PERFORMERS & CANDIDATES */}
      <section>
        <PageContainer maxWidth="lg">
          <div className="mb-10 space-y-2">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              For Artists & Performers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">
              Your 4-Step Journey to Getting Cast
            </h2>
            <p className="text-xs text-neutral-600">
              Everything you need to showcase your talent, submit auditions, and track your callbacks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {candidateSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-subtle relative flex flex-col justify-between"
                >
                  <span className="text-3xl font-serif font-bold text-neutral-300 absolute top-6 right-6">
                    {step.num}
                  </span>
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold font-serif text-black mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 flex items-center gap-4">
            <Link
              to="/signup?redirect=/candidate/profile/setup"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
            >
              <span>Create Performer Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* 3. FOR CASTING TEAMS & DIRECTORS */}
      <section className="bg-neutral-50/50 py-14 border-y border-neutral-200">
        <PageContainer maxWidth="lg">
          <div className="mb-10 space-y-2">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              For Casting Teams & Studios
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">
              How Production Houses Cast with StageLink
            </h2>
            <p className="text-xs text-neutral-600">
              Find, evaluate, and cast talent faster with streamlined digital audition workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {adminSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-subtle relative flex flex-col justify-between"
                >
                  <span className="text-3xl font-serif font-bold text-neutral-300 absolute top-6 right-6">
                    {step.num}
                  </span>
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold font-serif text-black mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 flex flex-wrap items-center gap-4">
            <Link
              to={isRecruiter ? '/post-job' : '/signup?role=recruiter&redirect=/post-job'}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Post a Job / Casting Call</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup?role=recruiter&redirect=/post-job"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-xs font-bold rounded-xl transition-colors"
            >
              <span>Register as Casting Team</span>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section>
        <PageContainer maxWidth="lg">
          <div className="mb-10 space-y-2">
            <span className="text-xs font-bold text-black uppercase tracking-widest block">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-150"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-black hover:underline transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-black' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 mt-1">
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

export default HowItWorksPage;
