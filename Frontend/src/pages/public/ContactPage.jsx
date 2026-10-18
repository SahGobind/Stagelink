import React, { useState } from 'react';
import { Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Toast from '../../components/common/Toast';

const ContactPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Please enter your full name';
    if (!email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!subject.trim()) errs.subject = 'Please enter a subject';
    if (!message.trim()) {
      errs.message = 'Please enter your message';
    } else if (message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setToastMessage('Message sent successfully! (Demo submission)');
      // Reset form
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setErrors({});
    }, 800);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10 pb-20 text-left">
      <PageContainer maxWidth="lg" className="space-y-12">
        {/* Top Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-black uppercase tracking-widest block">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-black tracking-tight">
            Contact StageLink Support
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary max-w-xl">
            Have questions about casting calls, performer portfolios, or production partnerships? Our team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-card space-y-6">
            {submitted && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-sm text-green-900">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Thank you! Your message has been sent.</span>
                </div>
                <p className="leading-relaxed">
                  Our talent support team will respond to your inquiry within 24 hours.
                </p>
                <p className="text-[11px] text-green-700 font-medium italic pt-1">
                  * Note: This is a frontend demonstration submission.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Maya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="maya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <Input
                label="Subject"
                placeholder="e.g. Casting Inquiry / Portfolio Verification"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                error={errors.subject}
                required
              />

              <Textarea
                label="Message"
                placeholder="Please describe how our team can help you..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                error={errors.message}
                required
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Sending Message...</span>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Support & Studio Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-card space-y-6">
              <h3 className="text-base font-bold font-serif text-black">
                Studio Support Hub
              </h3>

              <div className="space-y-4 text-xs text-brand-text-secondary">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Email Inquiries</h4>
                    <p className="mt-0.5">support@stagelink.com</p>
                    <p className="text-[11px] text-gray-400">casting@stagelink.com (Productions)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Response Time</h4>
                    <p className="mt-0.5">Monday to Saturday: 9:00 AM – 7:00 PM IST</p>
                    <p className="text-[11px] text-gray-400">Typically replies within 2–4 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">Studio Headquarters</h4>
                    <p className="mt-0.5">Film City Complex, Goregaon East</p>
                    <p className="text-[11px] text-gray-400">Mumbai, Maharashtra 400065, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Note Card */}
            <div className="bg-brand-navy text-white p-6 rounded-3xl space-y-2">
              <h4 className="text-sm font-bold font-serif">Looking to Post a Casting Call?</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Production houses and casting directors can register for studio accounts to publish notices and review candidate reels directly.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default ContactPage;
