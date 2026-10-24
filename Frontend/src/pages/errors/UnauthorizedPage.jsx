import React from 'react';
import { Navigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default UnauthorizedPage;
