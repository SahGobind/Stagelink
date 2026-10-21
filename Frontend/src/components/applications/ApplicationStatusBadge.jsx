import React from 'react';
import Badge from '../common/Badge';
import { formatStatus } from '../../utils/formatters';

const ApplicationStatusBadge = ({ status, className = '' }) => {
  const getVariant = (s) => {
    switch (s) {
      case 'applied':
      case 'submitted':
        return 'default';
      case 'under_review':
        return 'info';
      case 'shortlisted':
        return 'warning';
      case 'audition_requested':
      case 'interview':
        return 'primary';
      case 'selected':
      case 'accepted':
        return 'success';
      case 'rejected':
      case 'not_selected':
        return 'danger';
      case 'withdrawn':
        return 'neutral';
      default:
        return 'default';
    }
  };

  const getLabel = (s) => {
    switch (s) {
      case 'applied':
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      case 'audition_requested':
      case 'interview':
        return 'Audition Requested';
      case 'selected':
      case 'accepted':
        return 'Selected';
      case 'rejected':
      case 'not_selected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return formatStatus(s);
    }
  };

  return (
    <Badge variant={getVariant(status)} className={className}>
      {getLabel(status)}
    </Badge>
  );
};

export default ApplicationStatusBadge;
