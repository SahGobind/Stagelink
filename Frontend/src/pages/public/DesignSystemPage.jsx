import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Checkbox from '../../components/common/Checkbox';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import Dropdown from '../../components/common/Dropdown';
import Tabs from '../../components/common/Tabs';
import Pagination from '../../components/common/Pagination';
import FileUpload from '../../components/common/FileUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toast from '../../components/common/Toast';
import { Sparkles, Mail, ArrowRight } from 'lucide-react';

const DesignSystemPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [page, setPage] = useState(1);
  const [file, setFile] = useState(null);
  const [toastType, setToastType] = useState(null);
  const [checkboxState, setCheckboxState] = useState(true);

  const demoTabs = [
    { id: 'tab1', label: 'All Auditions', count: 12 },
    { id: 'tab2', label: 'Callbacks', count: 3 },
    { id: 'tab3', label: 'Archived', count: 0 },
  ];

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <PageContainer className="space-y-12">
        {/* Header */}
        <div className="border-b border-brand-border pb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-neutral-100 text-black px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>StageLink Design System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-black">
            Design Tokens & UI Component Suite
          </h1>
          <p className="text-xs text-neutral-600">
            Monochrome Editorial Luxury design system with high-contrast black, white, and neutral typography.
          </p>
        </div>

        {/* 1. Color Palette Tokens */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-subtle space-y-4">
          <h2 className="text-lg font-bold font-serif text-black">1. Color Palette Tokens</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-black text-white space-y-1 shadow-sm">
              <p className="text-xs font-bold uppercase">Primary Black</p>
              <p className="text-sm font-mono">#000000</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-800 text-white space-y-1 shadow-sm">
              <p className="text-xs font-bold uppercase">Black Hover</p>
              <p className="text-sm font-mono">#262626</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-100 text-black border border-neutral-300 space-y-1">
              <p className="text-xs font-bold uppercase">Soft Neutral</p>
              <p className="text-sm font-mono">#F5F5F5</p>
            </div>
            <div className="p-4 rounded-2xl bg-white text-black border border-neutral-300 space-y-1 shadow-sm">
              <p className="text-xs font-bold uppercase">Pure White</p>
              <p className="text-sm font-mono">#FFFFFF</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-600 text-white space-y-1">
              <p className="text-xs font-bold uppercase">Secondary Text</p>
              <p className="text-sm font-mono">#525252</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-border text-brand-navy space-y-1">
              <p className="text-xs font-bold uppercase">Border Gray</p>
              <p className="text-sm font-mono">#E5E7EB</p>
            </div>
            <div className="p-4 rounded-2xl bg-green-600 text-white space-y-1">
              <p className="text-xs font-bold uppercase">Success</p>
              <p className="text-sm font-mono">#15803D</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-600 text-white space-y-1">
              <p className="text-xs font-bold uppercase">Warning</p>
              <p className="text-sm font-mono">#B45309</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-700 text-white space-y-1">
              <p className="text-xs font-bold uppercase">Error</p>
              <p className="text-sm font-mono">#B91C1C</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-200 text-brand-navy space-y-1">
              <p className="text-xs font-bold uppercase">Pure White</p>
              <p className="text-sm font-mono">#FFFFFF</p>
            </div>
          </div>
        </section>

        {/* 2. Buttons */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-subtle space-y-4">
          <h2 className="text-lg font-bold font-serif text-brand-navy">2. Button Variants & States</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button loading>Loading State</Button>
            <Button disabled>Disabled State</Button>
            <Button icon={ArrowRight} iconPosition="right">With Icon</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center pt-2">
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md)</Button>
            <Button size="lg">Large (lg)</Button>
          </div>
        </section>

        {/* 3. Form Inputs */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-subtle space-y-6">
          <h2 className="text-lg font-bold font-serif text-brand-navy">3. Form Inputs & Validation States</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Standard Text Input"
              placeholder="e.g. Elena Moreau"
              helperText="Enter your official stage name"
            />
            <Input
              label="Input with Error State"
              defaultValue="invalid-email"
              error="Please enter a valid casting contact email"
            />
            <Input
              label="Input with Left Icon"
              icon={Mail}
              placeholder="director@auteurpictures.com"
            />
            <Select
              label="Select Component"
              options={['Feature Film', 'TV Series', 'Commercial', 'Theatre']}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Textarea Component"
                placeholder="Enter character notes or monologue audition..."
                rows={3}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-3">
              <Checkbox
                label="I agree to union terms (Checked)"
                checked={checkboxState}
                onChange={(e) => setCheckboxState(e.target.checked)}
              />
              <Checkbox
                label="Checkbox with error message"
                error="You must accept the performer code of conduct"
              />
            </div>
          </div>
        </section>

        {/* 4. Badges & Avatars */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-subtle space-y-6">
          <h2 className="text-lg font-bold font-serif text-brand-navy">4. Badges & Avatars</h2>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-brand-text-secondary">Application Status Badges</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="default" dot>Submitted</Badge>
              <Badge variant="info" dot>Under Review</Badge>
              <Badge variant="warning" dot>Shortlisted</Badge>
              <Badge variant="primary" dot>Audition Requested</Badge>
              <Badge variant="success" dot>Accepted / Cast</Badge>
              <Badge variant="danger" dot>Declined</Badge>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase text-brand-text-secondary">Avatars & Sizes</p>
            <div className="flex items-center gap-6">
              <Avatar size="sm" name="Sophia Bennett" status="online" />
              <Avatar size="md" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" status="online" />
              <Avatar size="lg" name="Alexander Vance" status="busy" />
              <Avatar size="xl" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" status="offline" />
            </div>
          </div>
        </section>

        {/* 5. Interactive Elements: Tabs, Modals, Dropdowns, Pagination, FileUpload */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-subtle space-y-6">
          <h2 className="text-lg font-bold font-serif text-brand-navy">5. Interactive Components</h2>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-brand-text-secondary">Tabs Component</p>
            <Tabs tabs={demoTabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase text-brand-text-secondary">Modals & Dropdowns</p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setModalOpen(true)}>
                Open Demonstration Modal
              </Button>

              <Dropdown
                trigger={
                  <Button variant="secondary">
                    Toggle Dropdown Menu
                  </Button>
                }
              >
                <div className="px-4 py-2 text-xs font-semibold text-brand-navy">Casting Options</div>
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-brand-navy">
                  Export Candidate List
                </button>
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-brand-navy">
                  Bulk Audition Request
                </button>
              </Dropdown>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase text-brand-text-secondary">File Upload Dropzone</p>
            <FileUpload
              label="Headshot or Self-Tape File"
              file={file}
              onFileSelect={setFile}
              onFileRemove={() => setFile(null)}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase text-brand-text-secondary mb-2">Pagination Component</p>
            <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
          </div>
        </section>

        {/* 6. Feedback States: Loading, Empty, Error, Toast */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-subtle space-y-6">
          <h2 className="text-lg font-bold font-serif text-brand-navy">6. Feedback & Notification States</h2>
          
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="secondary" onClick={() => setToastType('success')}>
              Trigger Success Toast
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setToastType('warning')}>
              Trigger Warning Toast
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setToastType('error')}>
              Trigger Error Toast
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <EmptyState
              title="No Auditions Found"
              description="You have not submitted any auditions matching these filters."
              actionLabel="Discover Castings"
              onAction={() => alert('Action clicked')}
            />
            <ErrorState
              title="Connection Error"
              message="Unable to reach casting server. Please verify your internet connection."
              onRetry={() => alert('Retry clicked')}
            />
          </div>

          <LoadingSpinner message="Authenticating Performer Credentials..." />
        </section>

        {/* Demo Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="StageLink Casting Callback Dialog"
        >
          <div className="space-y-4">
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              This modal component demonstrates accessible keyboard focus traps, backdrop click dismissal, escape key handlers, and smooth entry transitions.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirm Action
              </Button>
            </div>
          </div>
        </Modal>

        {/* Demo Toast */}
        <Toast
          type={toastType || 'success'}
          message={
            toastType === 'success'
              ? 'Audition submission sent to casting director!'
              : toastType === 'warning'
              ? 'Audition tape submission deadline is tomorrow.'
              : toastType === 'error'
              ? 'Could not upload showreel video file. Please try again.'
              : ''
          }
          onClose={() => setToastType(null)}
        />
      </PageContainer>
    </div>
  );
};

export default DesignSystemPage;
