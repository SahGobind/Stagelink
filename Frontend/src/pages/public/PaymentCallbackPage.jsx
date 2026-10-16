import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Building,
  Calendar,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Toast from '../../components/common/Toast';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isResuming, setIsResuming] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/opportunities/order-status/${encodeURIComponent(orderId)}`);
        const data = await response.json();
        setVerificationResult(data);
      } catch (err) {
        console.error('Failed to verify payment status:', err);
        setVerificationResult({
          success: false,
          code: 'NETWORK_ERROR',
          error: 'Could not connect to verification server. Please check backend status.',
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  const handleResumePayment = async () => {
    if (!verificationResult?.opportunity?.id) return;
    setIsResuming(true);
    try {
      const response = await fetch(
        `/api/opportunities/resume-payment/${verificationResult.opportunity.id}`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setToastMessage(data.message || 'Cannot resume: Juspay credentials not configured.');
      }
    } catch (err) {
      console.error('Error resuming payment:', err);
      setToastMessage('Failed to resume payment session.');
    } finally {
      setIsResuming(false);
    }
  };

  const opportunity = verificationResult?.opportunity;
  const isPublished = opportunity?.listingStatus === 'published';
  const isFailed = opportunity?.listingStatus === 'payment_failed' || verificationResult?.isFailed;
  const isPending = opportunity?.listingStatus === 'pending_payment';
  const isConfigMissing = verificationResult?.code === 'JUSPAY_CONFIG_MISSING';

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pb-24 pt-8 text-left">
      <PageContainer maxWidth="3xl" className="space-y-8 px-4 sm:px-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
            <RefreshCw className="w-8 h-8 text-brand-pink animate-spin" />
            <h2 className="text-lg font-bold text-gray-900 font-serif">
              Verifying Payment with Juspay...
            </h2>
            <p className="text-xs text-gray-500">
              Please do not refresh or close this window while we verify your order.
            </p>
          </div>
        ) : !orderId ? (
          <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Missing Order Reference</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              No order ID was found in the return query parameters.
            </p>
            <Link
              to="/post-job"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold"
            >
              Post a Casting Call
            </Link>
          </div>
        ) : isPublished ? (
          /* SUCCESS CASE: Verified Payment & Published */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Celebration Card */}
            <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-100 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-gray-900">
                Payment Confirmed &amp; Listing Published!
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
                Your casting call has been verified with Juspay and is now live for talents and performers to apply.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Status: Published
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-white border border-emerald-200 text-gray-800">
                  Order: {orderId}
                </span>
              </div>
            </div>

            {/* Opportunity Summary Card */}
            {opportunity && (
              <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">
                  Listing Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Production Company</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {opportunity.productionCompany}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Project / Role Type</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {opportunity.productionType} ({opportunity.productionCategory})
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Location &amp; Shoot Date</span>
                    <span className="text-gray-700 font-medium">
                      {opportunity.location} • {opportunity.shootDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Talent Needed</span>
                    <span className="text-gray-700 font-medium">
                      {opportunity.talentNeeded?.join(', ')} ({opportunity.artistsNeeded} artists)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link
                to="/opportunities"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 text-center transition-colors"
              >
                View Public Opportunities
              </Link>
              <Link
                to="/admin/opportunities"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Manage in Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : isFailed ? (
          /* FAILED PAYMENT CASE: Listing NOT Published */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl bg-red-50/60 border border-red-100 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <XCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-gray-900">
                Payment Incomplete or Cancelled
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
                The payment transaction was not completed. Per StarCast security guidelines, your casting call remains in{' '}
                <strong className="text-red-700">Payment Failed</strong> status and has <em>not</em> been published.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4">
              <p className="text-xs text-gray-600">
                You can retry and resume payment for this opportunity without having to refill the form or create duplicate listings:
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResumePayment}
                  disabled={isResuming}
                  className="px-6 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isResuming ? 'Connecting to Juspay...' : 'Resume Payment with Juspay'}
                </button>
                <Link
                  to="/post-job"
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit Work Details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* PENDING / CONFIG MISSING CASE */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl bg-amber-50/60 border border-amber-100 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-gray-900">
                Listing Status: Pending Payment
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
                {isConfigMissing
                  ? 'Your opportunity has been recorded in the database as pending payment. Juspay credentials are not yet configured in Backend/.env.'
                  : 'Payment confirmation is still pending from the bank. Your opportunity will be automatically published upon settlement.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-3 text-xs text-gray-700">
              <h3 className="font-bold text-gray-900 text-sm">Next Steps:</h3>
              <p>
                Recruiter can resume this order anytime from the{' '}
                <Link to="/admin/opportunities" className="text-brand-pink font-bold hover:underline">
                  Opportunities Dashboard
                </Link>
                .
              </p>
              {isConfigMissing && (
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[11px] text-gray-800 space-y-1">
                  <p className="font-bold">Backend/.env Setup:</p>
                  <p>JUSPAY_MERCHANT_ID=your_merchant_id</p>
                  <p>JUSPAY_API_KEY=your_api_key</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <Link
                to="/admin/opportunities"
                className="px-6 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700"
              >
                Go to Recruiter Dashboard
              </Link>
            </div>
          </div>
        )}

        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </PageContainer>
    </div>
  );
};

export default PaymentCallbackPage;
