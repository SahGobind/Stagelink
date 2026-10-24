import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Calendar, Award, ShieldCheck, Filter } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ApplicationCard from '../../components/applications/ApplicationCard';
import EmptyState from '../../components/common/EmptyState';
import { getAllApplications } from '../../data/mockApplications';
import { rankingService } from '../../services/rankingService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = [
  { id: 'all', label: 'All Applications' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'audition_requested', label: 'Audition Requested' },
  { id: 'selected', label: 'Selected' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' },
];

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const candidateId = user?.id || 'cand-aanya';

    applicationService
      .getByCandidate(candidateId)
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setApplications(res);
          setIsLoading(false);
          return;
        }
        return rankingService.getTalentApplications(candidateId);
      })
      .then((rankApps) => {
        if (isMounted && rankApps && rankApps.length > 0) {
          setApplications(rankApps);
        } else if (isMounted) {
          const all = getAllApplications();
          const candidateApps = all.filter((a) => a.candidateId === candidateId || a.candidate_id === candidateId);
          setApplications(candidateApps.length > 0 ? candidateApps : all);
        }
      })
      .catch(() => {
        if (isMounted) {
          const all = getAllApplications();
          const candidateApps = all.filter((a) => a.candidateId === candidateId || a.candidate_id === candidateId);
          setApplications(candidateApps.length > 0 ? candidateApps : all);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredApplications = useMemo(() => {
    if (selectedStatus === 'all') return applications;
    return applications.filter((a) => {
      const s = (a.status || '').toLowerCase();
      if (selectedStatus === 'submitted') return s === 'submitted' || s === 'applied';
      if (selectedStatus === 'audition_requested') return s === 'audition_requested' || s === 'interview';
      return s === selectedStatus;
    });
  }, [applications, selectedStatus]);

  return (
    <PageContainer className="space-y-6 text-left pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold font-serif text-brand-navy">My Applications</h1>
          <p className="text-xs text-gray-500">
            Track current status of your submitted auditions, matched role requirements, callback invitations, and withdrawal status.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Talent Privacy Protected</span>
        </div>
      </div>

      {/* Filter Tabs for Application Statuses */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? applications.length
              : applications.filter((a) => {
                  const s = (a.status || '').toLowerCase();
                  if (tab.id === 'submitted') return s === 'submitted' || s === 'applied';
                  if (tab.id === 'audition_requested') return s === 'audition_requested' || s === 'interview';
                  return s === tab.id;
                }).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? 'bg-brand-pink text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title={`No ${selectedStatus === 'all' ? '' : selectedStatus.replace('_', ' ')} applications`}
          description={
            selectedStatus === 'all'
              ? 'Browse open casting opportunities to submit your first audition.'
              : `You have no applications with status "${selectedStatus.replace('_', ' ')}".`
          }
          actionText={selectedStatus !== 'all' ? 'View All Applications' : 'Browse Casting Calls'}
          onAction={() => (selectedStatus !== 'all' ? setSelectedStatus('all') : undefined)}
          actionHref={selectedStatus === 'all' ? '/opportunities' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default MyApplicationsPage;
