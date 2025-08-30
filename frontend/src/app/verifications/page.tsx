"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function VerificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      // Only auto-close on very small screens
      if (window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const verifications = [
    {
      id: '1',
      title: 'Mangrove trees at Mumbai coastline',
      image: '/api/placeholder/300/200',
      status: 'verified',
      points: '+10',
      submittedAt: '2024-01-15T10:30:00Z',
      verifiedAt: '2024-01-15T10:32:00Z',
      location: 'Mumbai, Maharashtra, India',
      category: 'Mangrove Trees',
      description: 'Healthy mangrove trees growing along the coastal area. Clear visibility of root systems and green foliage.',
      aiConfidence: 94.2,
      feedback: 'Excellent quality image with clear mangrove identification. Location verified via satellite data.'
    },
    {
      id: '2',
      title: 'Coastal vegetation near Kerala backwaters',
      image: '/api/placeholder/300/200',
      status: 'verified',
      points: '+10',
      submittedAt: '2024-01-14T15:45:00Z',
      verifiedAt: '2024-01-14T15:47:00Z',
      location: 'Kerala, India',
      category: 'Coastal Vegetation',
      description: 'Dense coastal vegetation including mangroves and other salt-tolerant plants in the backwater region.',
      aiConfidence: 87.5,
      feedback: 'Good image quality. Vegetation type confirmed as coastal ecosystem. Location accuracy verified.'
    },
    {
      id: '3',
      title: 'Seagrass meadow observation',
      image: '/api/placeholder/300/200',
      status: 'rejected',
      points: '-5',
      submittedAt: '2024-01-13T09:20:00Z',
      verifiedAt: '2024-01-13T09:22:00Z',
      location: 'Andaman Islands, India',
      category: 'Seagrass Meadows',
      description: 'Underwater view of seagrass beds in shallow coastal waters.',
      aiConfidence: 23.1,
      feedback: 'Image appears to be of terrestrial grass rather than seagrass. Please ensure images are of actual marine vegetation.'
    },
    {
      id: '4',
      title: 'Tidal marsh ecosystem',
      image: '/api/placeholder/300/200',
      status: 'verified',
      points: '+10',
      submittedAt: '2024-01-12T14:15:00Z',
      verifiedAt: '2024-01-12T14:17:00Z',
      location: 'Sundarbans, Bangladesh',
      category: 'Tidal Marsh',
      description: 'Extensive tidal marsh area with characteristic vegetation and water channels.',
      aiConfidence: 91.8,
      feedback: 'Perfect example of tidal marsh ecosystem. Clear identification of marsh vegetation and tidal characteristics.'
    },
    {
      id: '5',
      title: 'Mangrove restoration site',
      image: '/api/placeholder/300/200',
      status: 'pending',
      points: '0',
      submittedAt: '2024-01-15T11:00:00Z',
      verifiedAt: null,
      location: 'Chennai, Tamil Nadu, India',
      category: 'Mangrove Trees',
      description: 'Recently planted mangrove saplings in restoration project area.',
      aiConfidence: null,
      feedback: null
    },
    {
      id: '6',
      title: 'Coastal wetland area',
      image: '/api/placeholder/300/200',
      status: 'verified',
      points: '+10',
      submittedAt: '2024-01-11T16:30:00Z',
      verifiedAt: '2024-01-11T16:32:00Z',
      location: 'Goa, India',
      category: 'Wetland Area',
      description: 'Coastal wetland with diverse vegetation and water features.',
      aiConfidence: 89.3,
      feedback: 'Well-documented wetland area. Clear evidence of coastal ecosystem characteristics.'
    }
  ];

  const stats = {
    total: verifications.length,
    verified: verifications.filter(v => v.status === 'verified').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
    pending: verifications.filter(v => v.status === 'pending').length,
    totalPoints: verifications.reduce((sum, v) => sum + (v.status === 'verified' ? 10 : v.status === 'rejected' ? -5 : 0), 0),
    successRate: Math.round((verifications.filter(v => v.status === 'verified').length / verifications.filter(v => v.status !== 'pending').length) * 100)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return '✅';
      case 'rejected':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex">
      <Sidebar 
        activeSection="verifications" 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        ml-0
      `}>
        <Header 
          title="My Verifications" 
          subtitle="Track your submitted images and verification status" 
          onMenuClick={toggleSidebar}
          showSidebarButton={!isSidebarOpen}
          onSidebarOpen={toggleSidebar}
        />
        
        <div className="p-3">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Verifications</h1>
            <p className="text-sm text-gray-600">Monitor the status of your submitted mangrove images and AI verification results.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">{stats.total}</div>
              <p className="text-xs text-gray-600">Total Submissions</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.verified}</div>
              <p className="text-xs text-gray-600">Verified</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalPoints}</div>
              <p className="text-xs text-gray-600">Total Points</p>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-4 text-white mb-4 shadow-sm border-2 border-teal-200 hover:border-teal-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1">Success Rate</h2>
                <p className="text-sm opacity-90">Your verification accuracy</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">{stats.successRate}%</div>
                <p className="text-sm opacity-90">Verified submissions</p>
              </div>
            </div>
          </div>

          {/* Verifications List */}
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div key={verification.id} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(verification.status)}`}>
                          {getStatusIcon(verification.status)} {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                        </span>
                        <span className={`font-bold text-base ${
                          verification.points.startsWith('+') ? 'text-green-600' : 
                          verification.points.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {verification.points}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{verification.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{verification.location}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📅 Submitted: {formatDate(verification.submittedAt)}</span>
                        {verification.verifiedAt && (
                          <span>✅ Verified: {formatDate(verification.verifiedAt)}</span>
                        )}
                        <span>🏷️ {verification.category}</span>
                      </div>
                    </div>
                    
                    {/* AI Confidence Score */}
                    {verification.aiConfidence && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-teal-600">{verification.aiConfidence}%</div>
                        <p className="text-xs text-gray-500">AI Confidence</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">📷 Image Preview</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Description</h4>
                        <p className="text-gray-600 text-xs">{verification.description}</p>
                      </div>
                      
                      {verification.feedback && (
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">AI Feedback</h4>
                          <div className={`p-2 rounded-lg text-xs ${
                            verification.status === 'verified' ? 'bg-green-50 text-green-800' :
                            verification.status === 'rejected' ? 'bg-red-50 text-red-800' :
                            'bg-gray-50 text-gray-800'
                          }`}>
                            {verification.feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                        Share
                      </button>
                    </div>
                    
                    {verification.status === 'rejected' && (
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">
                        Appeal Decision
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
              Load More Verifications
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
