import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Award, ShieldCheck } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ApplicationCard from '../../components/applications/ApplicationCard';
import EmptyState from '../../components/common/EmptyState';
import { getAllApplications } from '../../data/mockApplications';
import { rankingService } from '../../services/rankingService';
import { useAuth } from '../../context/AuthContext';

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const candidateId = user?.id || 'cand-1';
    rankingService.getTalentApplications(candidateId).then((res) => {
      if (res && res.length > 0) {
        setApplications(res);
      } else {
        const all = getAllApplications();
        const candidateApps = all.filter((a) => a.candidateId === candidateId);
        setApplications(candidateApps.length > 0 ? candidateApps : all);
      }
      setIsLoading(false);
    }).catch(() => {
      const all = getAllApplications();
      const candidateApps = all.filter((a) => a.candidateId === candidateId);
      setApplications(candidateApps.length > 0 ? candidateApps : all);
      setIsLoading(false);
    });
  }, [user]);

  return (
    <PageContainer className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold font-serif text-brand-navy">My Applications</h1>
          <p className="text-xs text-gray-500">Track current status of your submitted auditions, matched role requirements, and callback invitations.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Talent Privacy Protected</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse open casting opportunities to submit your first audition."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default MyApplicationsPage;
