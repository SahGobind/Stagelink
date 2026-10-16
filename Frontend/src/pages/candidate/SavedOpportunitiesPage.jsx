import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityGrid from '../../components/opportunities/OpportunityGrid';
import { mockOpportunities } from '../../data/mockOpportunities';
import { useApp } from '../../context/AppContext';

const SavedOpportunitiesPage = () => {
  const { savedOpportunityIds } = useApp();

  const savedOpportunities = mockOpportunities.filter((opp) =>
    savedOpportunityIds.includes(opp.id)
  );

  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-brand-navy">Saved Castings</h1>
        <p className="text-xs text-gray-500">Roles and productions you have bookmarked for later review.</p>
      </div>

      <OpportunityGrid opportunities={savedOpportunities} />
    </PageContainer>
  );
};

export default SavedOpportunitiesPage;
