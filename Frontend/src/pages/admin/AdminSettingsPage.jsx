import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';

const AdminSettingsPage = () => {
  const [studioName, setStudioName] = useState('Auteur Pictures Studio');
  const [adminEmail, setAdminEmail] = useState('admin@stagelink.com');
  const [toastMsg, setToastMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg('Studio configuration saved successfully!');
  };

  return (
    <PageContainer maxWidth="md" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-brand-navy">Production Studio Settings</h1>
        <p className="text-xs text-gray-500">Configure studio verification details, notification webhooks, and permissions.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card space-y-5">
        <Input
          label="Studio / Agency Entity Name"
          value={studioName}
          onChange={(e) => setStudioName(e.target.value)}
          required
        />
        <Input
          label="Primary Administrator Email"
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit">
            Update Studio Details
          </Button>
        </div>
      </form>

      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </PageContainer>
  );
};

export default AdminSettingsPage;
