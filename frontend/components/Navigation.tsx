import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Plus, BarChart3 } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/enquiries') {
      return location.pathname === '/enquiries' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Admissions CRM
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link
                to="/enquiries"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/enquiries')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Enquiries</span>
              </Link>
              
              <Link
                to="/summary"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/summary')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Summary</span>
              </Link>
            </div>
          </div>

          <Link
            to="/enquiries/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Enquiry</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
