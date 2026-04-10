import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessLicence } from '../constants/authAccess';
import { ROUTE_PATHS } from '../constants/routeConstatns';
import Licence from './Licence';

/** Renders Licence only for allowed users; otherwise redirects home. */
const LicenceRouteGate = () => {
  const { user } = useAuth();
  if (!canAccessLicence(user)) {
    return <Navigate to={ROUTE_PATHS.HOME} replace />;
  }
  return <Licence />;
};

export default LicenceRouteGate;
