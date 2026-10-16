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
      case 'interview':
      case 'audition_requested':
        return 'primary';
      case 'selected':
      case 'accepted':
        return 'success';
      case 'not_selected':
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getLabel = (s) => {
    switch (s) {
      case 'applied':
      case 'submitted':
        return 'Applied';
      case 'under_review':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      case 'interview':
      case 'audition_requested':
        return 'Interview';
      case 'selected':
      case 'accepted':
        return 'Selected';
      case 'not_selected':
      case 'rejected':
        return 'Not Selected';
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
