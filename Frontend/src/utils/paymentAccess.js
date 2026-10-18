/**
 * paymentAccess.js
 * Utility managing casting post payment status and candidate profile access gating.
 * Rules:
 * 1. User cannot view candidate profiles until post payment is completed.
 * 2. Once payment is completed (via JuicePay or PayPal), the casting post is published
 *    live and candidate profiles become fully unlocked.
 */

export const STORAGE_KEY_PAID = 'starcast_has_paid_posting';
export const STORAGE_KEY_CUSTOM_OPPS = 'starcast_custom_opportunities';
export const STORAGE_KEY_PENDING = 'starcast_pending_payment';
export const EVENT_PAYMENT_STATE_CHANGED = 'starcast:payment-updated';

/**
 * Check if the current user has completed a post payment to unlock candidate profiles.
 * @returns {boolean}
 */
export const hasCompletedPostingPayment = () => {
  try {
    // 1. Direct explicit payment flag
    const flag = localStorage.getItem(STORAGE_KEY_PAID);
    if (flag === 'true') return true;

    // 2. Check if any custom casting opportunity is published and paid
    const oppsRaw = localStorage.getItem(STORAGE_KEY_CUSTOM_OPPS);
    if (oppsRaw) {
      const opps = JSON.parse(oppsRaw);
      if (Array.isArray(opps)) {
        const hasPaidOpp = opps.some(
          (o) =>
            o.paymentStatus === 'paid' ||
            o.status === 'published' ||
            o.escrowStatus === 'funded'
        );
        if (hasPaidOpp) {
          localStorage.setItem(STORAGE_KEY_PAID, 'true');
          return true;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading payment status:', err);
  }
  return false;
};

/**
 * Set payment status explicitly (e.g. after JuicePay / PayPal confirmation)
 * @param {boolean} isPaid 
 */
export const setPostingPaymentCompleted = (isPaid = true) => {
  try {
    if (isPaid) {
      localStorage.setItem(STORAGE_KEY_PAID, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_PAID);
    }
    // Dispatch event so active pages re-evaluate access instantly
    window.dispatchEvent(new CustomEvent(EVENT_PAYMENT_STATE_CHANGED, { detail: { isPaid } }));
  } catch (err) {
    console.warn('Error setting payment status:', err);
  }
};

/**
 * Retrieve current pending opportunity awaiting payment
 */
export const getPendingOpportunity = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PENDING);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading pending opportunity:', err);
  }
  return null;
};

/**
 * Save pending opportunity details before routing to payment page
 */
export const setPendingOpportunity = (opp) => {
  try {
    sessionStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(opp));
  } catch (err) {
    console.warn('Error storing pending opportunity:', err);
  }
};

/**
 * Clear pending opportunity session
 */
export const clearPendingOpportunity = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY_PENDING);
  } catch (err) {
    // ignore
  }
};

/**
 * Retrieve custom published opportunities from localStorage
 */
export const getCustomOpportunities = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OPPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((o) => o.status === 'published' || o.status === 'open');
      }
    }
  } catch (err) {
    console.warn('Error fetching custom opportunities:', err);
  }
  return [];
};

/**
 * Mark a casting post as paid & published, saving it to localStorage and unlocking talent profiles.
 */
export const publishOpportunity = (oppData, txnId = '', paymentMethod = 'JuicePay Credit Card') => {
  try {
    const existing = getCustomOpportunities();
    const publishedOpp = {
      ...oppData,
      id: oppData.id || `opp-${Date.now()}`,
      refId: oppData.refId || `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: oppData.title || `${oppData.productionCompany || 'Production'} — ${oppData.productionType || 'Casting Call'}`,
      productionCompany: oppData.productionCompany || 'StageLink Partner Studio',
      category: oppData.productionCategory || oppData.category || 'Film & TV',
      categoryKey: (oppData.productionCategory || oppData.category || 'films').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      location: oppData.location || 'Open / Unspecified',
      shootDate: oppData.shootDate || 'Flexible / TBD',
      artistsNeeded: Number(oppData.artistsNeeded) || 1,
      talentNeeded: oppData.talentNeeded || ['Actors'],
      description: oppData.description || oppData.requirements || 'Verified casting opportunity.',
      requirements: Array.isArray(oppData.requirements)
        ? oppData.requirements
        : oppData.requirements ? [oppData.requirements] : ['Professional audition submissions welcomed.'],
      postedTime: 'Just now',
      postedDate: new Date().toISOString().split('T')[0],
      deadline: oppData.shootDate || 'Open',
      status: 'published',
      listingStatus: 'published',
      paymentStatus: 'paid',
      paymentMethod,
      txnId: txnId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      publishedAt: new Date().toISOString(),
      image:
        oppData.image ||
        'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
    };

    // Replace if same ID or refId, otherwise prepend
    const filtered = existing.filter(
      (item) => item.id !== publishedOpp.id && item.refId !== publishedOpp.refId
    );
    localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify([publishedOpp, ...filtered]));

    // Unlock candidate profiles
    setPostingPaymentCompleted(true);
    clearPendingOpportunity();

    return publishedOpp;
  } catch (err) {
    console.error('Failed to publish opportunity:', err);
    return null;
  }
};
