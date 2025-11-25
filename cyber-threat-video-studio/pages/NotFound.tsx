import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
    <p className="text-6xl font-bold text-primary">404</p>
    <h1 className="text-2xl font-semibold">Page Not Found</h1>
    <p className="text-gray-400 max-w-md">
      The route you are looking for does not exist. Check the URL or return to the dashboard.
    </p>
    <Link to="/">
      <Button>Back to Dashboard</Button>
    </Link>
  </div>
);

export default NotFound;
