import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navigation from './components/Navigation';
import EnquiryList from './pages/EnquiryList';
import EnquiryForm from './pages/EnquiryForm';
import FollowUps from './pages/FollowUps';
import Summary from './pages/Summary';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/enquiries" replace />} />
              <Route path="/enquiries" element={<EnquiryList />} />
              <Route path="/enquiries/new" element={<EnquiryForm />} />
              <Route path="/enquiries/:id/edit" element={<EnquiryForm />} />
              <Route path="/enquiries/:id/followups" element={<FollowUps />} />
              <Route path="/summary" element={<Summary />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </Router>
    </div>
  );
}

export default App;
