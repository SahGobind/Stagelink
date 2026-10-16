import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { OPPORTUNITY_TYPES } from '../../utils/constants';
import { mockOpportunities } from '../../data/mockOpportunities';

const EditOpportunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(() => {
    return mockOpportunities.find((o) => o.id === id) || mockOpportunities[0];
  });
  const [toastMsg, setToastMsg] = useState('');

  if (!opportunity) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setToastMsg('Casting opportunity updated successfully!');
    setTimeout(() => {
      navigate('/admin/opportunities');
    }, 1200);
  };

  return (
    <PageContainer maxWidth="md" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-brand-navy">Edit Casting Call</h1>
        <p className="text-xs text-gray-500">Update listing details for "{opportunity.title}".</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card space-y-5">
        <Input
          label="Project Title"
          value={opportunity.title}
          onChange={(e) => setOpportunity({ ...opportunity, title: e.target.value })}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Production Company / Studio"
            value={opportunity.productionCompany}
            onChange={(e) => setOpportunity({ ...opportunity, productionCompany: e.target.value })}
            required
          />
          <Select
            label="Production Type"
            options={Object.values(OPPORTUNITY_TYPES)}
            value={opportunity.type}
            onChange={(e) => setOpportunity({ ...opportunity, type: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Location"
            value={opportunity.location}
            onChange={(e) => setOpportunity({ ...opportunity, location: e.target.value })}
            required
          />
          <Input
            label="Compensation"
            value={opportunity.compensation}
            onChange={(e) => setOpportunity({ ...opportunity, compensation: e.target.value })}
            required
          />
          <Input
            label="Deadline"
            value={opportunity.deadline}
            onChange={(e) => setOpportunity({ ...opportunity, deadline: e.target.value })}
            required
          />
        </div>

        <Textarea
          label="Synopsis & Audition Requirements"
          value={opportunity.description}
          onChange={(e) => setOpportunity({ ...opportunity, description: e.target.value })}
          rows={5}
          required
        />

        <div className="pt-4 flex justify-end space-x-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/admin/opportunities')}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>

      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </PageContainer>
  );
};

export default EditOpportunityPage;
