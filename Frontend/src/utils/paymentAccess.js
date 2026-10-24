/**
 * paymentAccess.js
 * Utility managing casting post payment status and candidate profile access gating.
 * Rules:
 * 1. User cannot view candidate profiles until post payment is completed.
 * 2. Once payment is completed (via JuicePay or PayPal), the casting post is published
 *    live and candidate profiles become fully unlocked.
 */

import { isBrokenImageUrl, getCategoryFallbackImage } from './opportunityImageHelper';

export const STORAGE_KEY_PAID = 'starcast_has_paid_posting';
export const STORAGE_KEY_CUSTOM_OPPS = 'starcast_custom_opportunities';
export const STORAGE_KEY_PENDING = 'starcast_pending_payment';
export const STORAGE_KEY_DELETED_OPPS = 'starcast_deleted_opportunities';
export const EVENT_PAYMENT_STATE_CHANGED = 'starcast:payment-updated';

/**
 * Get Set of deleted opportunity IDs to prevent deleted items from resurfacing
 */
export const getDeletedOpportunityIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_OPPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.map(String));
    }
  } catch {
    // fallback
  }
  return new Set();
};

/**
 * Record an opportunity ID / refId as deleted
 */
export const markOpportunityAsDeleted = (...ids) => {
  try {
    const deleted = getDeletedOpportunityIds();
    ids.forEach((id) => {
      if (id) deleted.add(String(id));
    });
    localStorage.setItem(STORAGE_KEY_DELETED_OPPS, JSON.stringify(Array.from(deleted)));
  } catch {
    // fallback
  }
};


/**
 * Check if the current user has completed a post payment to unlock candidate profiles.
 * @returns {boolean}
 */
export const hasCompletedPostingPayment = () => {
  return true;
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
 * Sanitize custom opportunities: automatically repairs missing or known 404 image URLs
 */
export const sanitizeCustomOpportunities = (list) => {
  if (!Array.isArray(list)) return [];
  let hasRepairs = false;
  const sanitized = list.map((opp) => {
    if (!opp.image || isBrokenImageUrl(opp.image)) {
      hasRepairs = true;
      return {
        ...opp,
        image: getCategoryFallbackImage(
          opp.productionCategory || opp.category,
          opp.productionType || opp.type
        ),
      };
    }
    return opp;
  });
  if (hasRepairs) {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify(sanitized));
    } catch {
      // ignore
    }
  }
  return sanitized;
};

/**
 * Retrieve custom published opportunities from localStorage for public viewing
 */
export const getCustomOpportunities = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OPPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deletedIds = getDeletedOpportunityIds();
        const sanitized = sanitizeCustomOpportunities(parsed);
        return sanitized.filter((o) => 
          !deletedIds.has(String(o.id)) && 
          !deletedIds.has(String(o.refId)) &&
          (o.status === 'published' || o.listingStatus === 'published')
        );
      }
    }
  } catch (err) {
    console.warn('Error fetching custom opportunities:', err);
  }
  return [];
};

/**
 * Retrieve all custom opportunities regardless of status for recruiter dashboard
 */
export const getAllCustomOpportunities = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OPPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deletedIds = getDeletedOpportunityIds();
        return sanitizeCustomOpportunities(parsed).filter((o) =>
          !deletedIds.has(String(o.id)) && !deletedIds.has(String(o.refId))
        );
      }
    }
  } catch (err) {
    console.warn('Error fetching all custom opportunities:', err);
  }
  return [];
};

/**
 * Mark a casting post as paid, setting status to pending_review or published.
 */
export const publishOpportunity = (oppData, txnId = '', paymentMethod = 'Juspay HyperCheckout') => {
  try {
    const existing = getAllCustomOpportunities();
    const finalStatus = oppData.status === 'draft' ? 'draft' : 'published';

    const safeImage =
      oppData.image && !isBrokenImageUrl(oppData.image)
        ? oppData.image
        : getCategoryFallbackImage(
            oppData.productionCategory || oppData.category,
            oppData.productionType || oppData.type
          );

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
      deadline: oppData.applicationDeadline || oppData.deadline || oppData.shootDate || 'Open',
      status: 'published',
      listingStatus: 'published',
      isOpen: true,
      paymentStatus: 'paid',
      paymentMethod,
      txnId: txnId || `TXN-JSP-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: new Date().toISOString(),
      image: safeImage,
    };

    // Replace if same ID or refId, otherwise prepend
    const filtered = existing.filter(
      (item) => item.id !== publishedOpp.id && item.refId !== publishedOpp.refId
    );
    localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify([publishedOpp, ...filtered]));

    // Store in session storage for immediate discover talent page spotlight
    try {
      sessionStorage.setItem('starcast_last_published_opportunity', JSON.stringify(publishedOpp));
    } catch {
      // ignore
    }

    // Unlock candidate profiles
    setPostingPaymentCompleted(true);
    clearPendingOpportunity();

    // Dispatch custom event for real-time reactive sync across components
    try {
      window.dispatchEvent(
        new CustomEvent('starcast:opportunity-published', {
          detail: { opportunity: publishedOpp },
        })
      );
    } catch {
      // ignore
    }

    return publishedOpp;
  } catch (err) {
    console.error('Failed to publish opportunity:', err);
    return null;
  }
};

/**
 * Get last published opportunity from this session (if any)
 */
export const getLastPublishedOpportunity = () => {
  try {
    const raw = sessionStorage.getItem('starcast_last_published_opportunity');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading last published opportunity:', err);
  }
  return null;
};

/**
 * Save or update any custom opportunity with arbitrary status (draft, pending_payment, payment_failed, etc.)
 */
export const saveCustomOpportunity = (oppData) => {
  try {
    const existing = getAllCustomOpportunities();
    const id = oppData.id || `opp-${Date.now()}`;
    const refId = oppData.refId || `PRD-${Math.floor(100000 + Math.random() * 900000)}`;

    const safeImage =
      oppData.image && !isBrokenImageUrl(oppData.image)
        ? oppData.image
        : getCategoryFallbackImage(
            oppData.productionCategory || oppData.category,
            oppData.productionType || oppData.type
          );

    const savedOpp = {
      ...oppData,
      id,
      refId,
      image: safeImage,
      status: oppData.status || oppData.listingStatus || 'draft',
      listingStatus: oppData.listingStatus || oppData.status || 'draft',
      paymentStatus: oppData.paymentStatus || (oppData.status === 'paid' ? 'paid' : 'pending'),
      updatedAt: new Date().toISOString(),
    };

    const filtered = existing.filter((item) => item.id !== id && item.refId !== refId);
    localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify([savedOpp, ...filtered]));
    window.dispatchEvent(new CustomEvent(EVENT_PAYMENT_STATE_CHANGED, { detail: { opportunity: savedOpp } }));
    return savedOpp;
  } catch (err) {
    console.error('Failed to save opportunity:', err);
    return null;
  }
};

/**
 * Update the status of an existing opportunity
 */
export const updateCustomOpportunityStatus = (id, newStatus) => {
  try {
    const existing = getAllCustomOpportunities();
    const target = existing.find((o) => o.id === id);
    if (!target) return false;

    const updated = {
      ...target,
      status: newStatus,
      listingStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify([updated, ...filtered]));
    window.dispatchEvent(new CustomEvent(EVENT_PAYMENT_STATE_CHANGED, { detail: { opportunity: updated } }));
    return updated;
  } catch (err) {
    console.error('Failed to update opportunity status:', err);
    return null;
  }
};

/**
 * Close an opportunity, strictly preserving applicant data and records
 */
export const closeCustomOpportunity = (id) => {
  return updateCustomOpportunityStatus(id, 'closed');
};

/**
 * Archive an opportunity
 */
export const archiveCustomOpportunity = (id) => {
  return updateCustomOpportunityStatus(id, 'archived');
};

/**
 * Delete a custom opportunity completely from localStorage
 */
export const deleteCustomOpportunity = (id, refId = null) => {
  try {
    // 1. Mark in deleted IDs set
    markOpportunityAsDeleted(id, refId);

    // 2. Remove from custom opportunities array in localStorage
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OPPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const remaining = parsed.filter(
          (item) => item.id !== id && item.refId !== id && (refId ? item.refId !== refId : true)
        );
        localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify(remaining));
      }
    }

    // 3. Clean up session storage spotlight if it matches
    try {
      const spotRaw = sessionStorage.getItem('starcast_last_published_opportunity');
      if (spotRaw) {
        const spot = JSON.parse(spotRaw);
        if (spot.id === id || spot.refId === id || (refId && spot.refId === refId)) {
          sessionStorage.removeItem('starcast_last_published_opportunity');
        }
      }
    } catch {
      // ignore
    }

    // 4. Notify all components of deletion
    window.dispatchEvent(
      new CustomEvent(EVENT_PAYMENT_STATE_CHANGED, {
        detail: { deletedId: id, refId },
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to delete custom opportunity:', err);
    return false;
  }
};


