import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AdminDashboard = ({ onBackToMain }) => {
  const { t } = useTranslation();

  // Mock data for problem trends
  const problemTrends = [
    { month: 'Jan', anxiety: 45, depression: 32, stress: 38 },
    { month: 'Feb', anxiety: 52, depression: 28, stress: 41 },
    { month: 'Mar', anxiety: 48, depression: 35, stress: 44 },
    { month: 'Apr', anxiety: 56, depression: 31, stress: 39 },
    { month: 'May', anxiety: 49, depression: 29, stress: 42 },
    { month: 'Jun', anxiety: 53, depression: 34, stress: 46 }
  ];

  // Mock data for utilization metrics
  const utilizationMetrics = {
    totalBookings: 247,
    counselorBookings: 156,
    helplineBookings: 91,
    totalUsers: 1248,
    activeUsers: 892
  };

  // Mock data for resource popularity
  const resourcePopularity = [
    { type: 'Videos', views: 1245, engagement: 78 },
    { type: 'Audio', plays: 987, engagement: 82 },
    { type: 'Guides', downloads: 654, engagement: 65 }
  ];

  // Simple bar chart component for problem trends
  const SimpleBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(item => Math.max(item.anxiety, item.depression, item.stress)));
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="text-sm font-medium text-gray-600">{item.month}</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-500">{t('anxiety_label')}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(item.anxiety / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 w-8">{item.anxiety}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-500">{t('depression_label')}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(item.depression / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 w-8">{item.depression}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-500">{t('stress_label')}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(item.stress / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 w-8">{item.stress}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {t('admin_dashboard_title')}
            </h1>
            <p className="text-gray-600">
              {t('admin_dashboard_subtitle')}
            </p>
          </div>
          <button
            onClick={onBackToMain}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('back_to_main_app_button')}
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Problem Trends Card */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              {t('problem_trends_title')}
            </h2>
            <div className="text-sm text-gray-600 mb-4">
              {t('problem_trends_description')}
            </div>
            <SimpleBarChart data={problemTrends} />
          </div>

          {/* Utilization Metrics Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              {t('utilization_metrics_title')}
            </h2>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('total_bookings_label')}</span>
                  <span className="text-2xl font-bold text-indigo-600">{utilizationMetrics.totalBookings}</span>
                </div>
              </div>
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('counselor_bookings_label')}</span>
                  <span className="text-xl font-semibold text-green-600">{utilizationMetrics.counselorBookings}</span>
                </div>
              </div>
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('helpline_bookings_label')}</span>
                  <span className="text-xl font-semibold text-orange-600">{utilizationMetrics.helplineBookings}</span>
                </div>
              </div>
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('total_users_label')}</span>
                  <span className="text-xl font-semibold text-purple-600">{utilizationMetrics.totalUsers}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('active_users_label')}</span>
                  <span className="text-xl font-semibold text-blue-600">{utilizationMetrics.activeUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Popularity Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resourcePopularity.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full mr-4 ${
                  resource.type === 'Videos' ? 'bg-red-100' :
                  resource.type === 'Audio' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {resource.type === 'Videos' && (
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {resource.type === 'Audio' && (
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                    </svg>
                  )}
                  {resource.type === 'Guides' && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t(`resource_${resource.type.toLowerCase()}_title`)}
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {resource.type === 'Videos' ? t('views_label') : 
                     resource.type === 'Audio' ? t('plays_label') : t('downloads_label')}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {resource.type === 'Videos' ? resource.views : 
                     resource.type === 'Audio' ? resource.plays : resource.downloads}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('engagement_label')}</span>
                  <span className="font-semibold text-gray-800">{resource.engagement}%</span>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{t('engagement_label')}</span>
                    <span>{resource.engagement}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        resource.type === 'Videos' ? 'bg-red-500' :
                        resource.type === 'Audio' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${resource.engagement}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            {t('recent_activity_title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
              <div className="text-3xl font-bold">24</div>
              <div className="text-sm opacity-90">{t('sessions_today_label')}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
              <div className="text-3xl font-bold">156</div>
              <div className="text-sm opacity-90">{t('resources_accessed_label')}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
              <div className="text-3xl font-bold">89%</div>
              <div className="text-sm opacity-90">{t('user_satisfaction_label')}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white">
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm opacity-90">{t('new_users_today_label')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;