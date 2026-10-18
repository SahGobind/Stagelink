import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Toast from '../../components/common/Toast';
import { setPendingOpportunity } from '../../utils/paymentAccess';

const TALENT_OPTIONS = [
  'Dancers / Performers',
  'Musicians',
  'Creators / Influencers',
  'Children / Families',
  'Athletes',
  'Specialized Talent',
  'Actors / Screen Artists',
  'Models / Editorial',
  'Voiceover Artists',
  'Other',
];

const PRODUCTION_CATEGORIES = [
  'Film & TV',
  'Commercials & Advertising',
  'Theatre & Performing Arts',
  'Music Video',
  'Digital Media & Streaming',
  'Fashion & Editorial',
  'Voice & Dubbing',
  'Live Events & Tours',
];

const PRODUCTION_TYPES = [
  'Feature Film',
  'Short Film',
  'TV Series / Drama',
  'Web Series / OTT Original',
  'Documentary',
  'Theatre Play / Musical',
  'Commercial Campaign',
  'Music Video',
  'Brand Influencer Shoot',
  'Voiceover / Animation',
];

const CreateOpportunityPage = () => {
  const navigate = useNavigate();

  const [productionCompany, setProductionCompany] = useState('Northlight Productions');
  const [productionCategory, setProductionCategory] = useState('Film & TV');
  const [productionType, setProductionType] = useState('Feature Film');
  const [selectedTalents, setSelectedTalents] = useState([
    'Dancers / Performers',
    'Specialized Talent',
  ]);
  const [shootDate, setShootDate] = useState('');
  const [location, setLocation] = useState('');
  const [artistsNeeded, setArtistsNeeded] = useState(5);
  const [projectTitle, setProjectTitle] = useState('The Berlin Requiem');
  const [description, setDescription] = useState(
    'Seeking expressive movement performers and specialized talents for an atmospheric night exterior sequence.'
  );

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const handleTalentListChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedTalents(selected);
  };

  const toggleTalentChip = (talent) => {
    setSelectedTalents((prev) =>
      prev.includes(talent) ? prev.filter((t) => t !== talent) : [...prev, talent]
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!productionCompany.trim()) newErrors.productionCompany = 'Production company is required.';
    // Shoot date & location are NOT mandatory!
    if (selectedTalents.length === 0) newErrors.talents = 'Select at least one talent type.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setToastMessage('Please complete all required fields.');
      return;
    }

    const newOpportunity = {
      id: `opp-${Date.now()}`,
      refId: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: `${projectTitle || productionType} — ${selectedTalents.join(', ')}`,
      category: productionCategory,
      productionCompany,
      productionType,
      location: location.trim() ? location.trim() : 'Open / Unspecified',
      shootDate: shootDate ? shootDate : 'Flexible / To be decided',
      artistsNeeded: Number(artistsNeeded) || 1,
      talentNeeded: selectedTalents,
      description,
      postedTime: 'Just now',
      listingFee: 1999,
      currency: 'INR',
      status: 'pending_payment',
      listingStatus: 'pending_payment',
      paymentStatus: 'pending',
    };

    setPendingOpportunity(newOpportunity);

    // Call backend order initializer if active
    try {
      fetch('/api/opportunities/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOpportunity),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.orderId) {
            newOpportunity.paymentOrderId = data.orderId;
            setPendingOpportunity(newOpportunity);
          }
        })
        .catch(() => {});
    } catch {
      // offline fallback
    }

    navigate('/payment', { state: { opportunity: newOpportunity } });
  };

  return (
    <PageContainer maxWidth="md" className="py-6 space-y-6 text-left">
      <div>
        <button
          type="button"
          onClick={() => navigate('/admin/opportunities')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>
      </div>

      <div className="space-y-6">
          <div className="space-y-1.5 pb-2">
            <h1 className="text-3xl font-bold font-sans tracking-tight text-black">
              Announce Work
            </h1>
            <p className="text-sm text-neutral-600 font-normal">
              Post a production requirement for talents to discover and apply.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Production company */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black">
                Production company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productionCompany}
                onChange={(e) => setProductionCompany(e.target.value)}
                placeholder="e.g. Northlight Productions"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
              />
              {errors.productionCompany && (
                <p className="text-xs text-red-600">{errors.productionCompany}</p>
              )}
            </div>

            {/* Production category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black">
                Production category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={productionCategory}
                  onChange={(e) => setProductionCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black cursor-pointer"
                >
                  {PRODUCTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Job / production type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black">
                Job / production type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={productionType}
                  onChange={(e) => setProductionType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black cursor-pointer"
                >
                  {PRODUCTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Talent needed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-black">
                  Talent needed <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-neutral-500">
                  {selectedTalents.length} selected
                </span>
              </div>

              <select
                multiple
                size={7}
                value={selectedTalents}
                onChange={handleTalentListChange}
                className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black overflow-y-auto leading-relaxed"
              >
                {TALENT_OPTIONS.map((talent) => (
                  <option
                    key={talent}
                    value={talent}
                    className="py-1 px-2 rounded-lg cursor-pointer hover:bg-neutral-100 checked:bg-neutral-900 checked:text-white"
                  >
                    {talent}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-500">
                Hold Ctrl/Cmd to select more than one.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {TALENT_OPTIONS.map((talent) => {
                  const isSelected = selectedTalents.includes(talent);
                  return (
                    <button
                      key={talent}
                      type="button"
                      onClick={() => toggleTalentChip(talent)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-black text-white shadow-2xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected ? `✓ ${talent}` : `+ ${talent}`}
                    </button>
                  );
                })}
              </div>
              {errors.talents && <p className="text-xs text-red-600">{errors.talents}</p>}
            </div>

            {/* Shoot date (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black">
                Shoot date <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black cursor-pointer"
              />
            </div>

            {/* Location (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black">
                Location <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Berlin (optional)"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
              />
            </div>

            {/* Artists needed */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-black">
                Artists needed <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={artistsNeeded}
                onChange={(e) => setArtistsNeeded(e.target.value)}
                placeholder="5"
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
              />
            </div>

            {/* Project Title & Description */}
            <div className="space-y-4 pt-2 border-t border-neutral-200">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-black">
                  Project Title / Working Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. The Berlin Requiem"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-black">
                  Production Synopsis & Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis of the shoot, role breakdown..."
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[11px] text-neutral-500 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>Publication and candidate profile access require completed payment.</span>
            </p>
          </form>
        </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default CreateOpportunityPage;
