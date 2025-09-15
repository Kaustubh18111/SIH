import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ResourceHub = () => {
  const { t, i18n } = useTranslation();
  
  // Active tab state for navigation between resource types
  const [activeTab, setActiveTab] = useState('videos');
  
  // Modal state for video player
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample video resources data with translation keys
  const videoResources = [
    {
      id: 1,
      titleKey: "video_1_title",
      descriptionKey: "video_1_description",
      thumbnailUrl: "https://img.youtube.com/vi/WWloIAQpMcQ/maxresdefault.jpg",
      youtubeLink: "https://www.youtube.com/embed/WWloIAQpMcQ"
    },
    {
      id: 2,
      titleKey: "video_2_title",
      descriptionKey: "video_2_description",
      thumbnailUrl: "https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg",
      youtubeLink: "https://www.youtube.com/embed/ZToicYcHIOU"
    },
    {
      id: 3,
      titleKey: "video_3_title",
      descriptionKey: "video_3_description",
      thumbnailUrl: "https://img.youtube.com/vi/0ViaCs0k2jM/maxresdefault.jpg",
      youtubeLink: "https://www.youtube.com/embed/0ViaCs0k2jM"
    },
    {
      id: 4,
      titleKey: "video_4_title",
      descriptionKey: "video_4_description",
      thumbnailUrl: "https://img.youtube.com/vi/NWH8N-BvhAw/maxresdefault.jpg",
      youtubeLink: "https://www.youtube.com/embed/NWH8N-BvhAw"
    }
  ];

  // Sample audio resources data with translation keys
  const audioResources = [
    {
      id: 1,
      titleKey: "audio_1_title",
      descriptionKey: "audio_1_description",
      filePath: "https://www.soundjay.com/misc/sounds/ocean-wave-1.wav"
    },
    {
      id: 2,
      titleKey: "audio_2_title",
      descriptionKey: "audio_2_description",
      filePath: "https://www.soundjay.com/misc/sounds/rain-01.wav"
    },
    {
      id: 3,
      titleKey: "audio_3_title",
      descriptionKey: "audio_3_description",
      filePath: "https://www.soundjay.com/misc/sounds/forest-1.wav"
    },
    {
      id: 4,
      titleKey: "audio_4_title",
      descriptionKey: "audio_4_description",
      filePath: "https://www.soundjay.com/misc/sounds/wind-1.wav"
    }
  ];

  // Sample guide resources data with translation keys
  const guideResources = [
    {
      id: 1,
      titleKey: "guide_1_title",
      descriptionKey: "guide_1_description",
      downloadLink: "https://example.com/mental-health-first-aid.pdf"
    },
    {
      id: 2,
      titleKey: "guide_2_title",
      descriptionKey: "guide_2_description",
      downloadLink: "https://example.com/stress-management-workbook.pdf"
    },
    {
      id: 3,
      titleKey: "guide_3_title",
      descriptionKey: "guide_3_description",
      downloadLink: "https://example.com/sleep-hygiene-handbook.pdf"
    },
    {
      id: 4,
      titleKey: "guide_4_title",
      descriptionKey: "guide_4_description",
      downloadLink: "https://example.com/mindfulness-journal.pdf"
    },
    {
      id: 5,
      titleKey: "guide_5_title",
      descriptionKey: "guide_5_description",
      downloadLink: "https://example.com/crisis-resources.pdf"
    }
  ];

  // Event handler for opening video modal
  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  // Event handler for closing video modal
  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsModalOpen(false);
  };

  // Event handler for tab switching
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Event handler for guide downloads
  const handleGuideDownload = (downloadLink) => {
    window.open(downloadLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('resources_title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('resources_subtitle')}
          </p>
        </div>

        {/* Language Selector - Updated with most spoken regional Indian languages
             Includes Hindi and English, plus the top 4 most spoken languages in India:
             Bengali, Telugu, Marathi, and Tamil based on linguistic demographics */}
        <div className="flex justify-end mb-6">
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg shadow-md p-2">
          {[
            { key: 'videos', labelKey: 'videos_tab', icon: '🎥' },
            { key: 'audio', labelKey: 'audio_tab', icon: '🎵' },
            { key: 'guides', labelKey: 'guides_tab', icon: '📚' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center px-6 py-3 mx-1 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* Videos Section */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videoResources.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => openVideoModal(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white rounded-full p-3">
                      <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{t(video.titleKey)}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{t(video.descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Audio Section */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audioResources.map((audio) => (
              <div
                key={audio.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0116 12a5.983 5.983 0 01-.758 2.828 1 1 0 01-1.414-1.414A3.987 3.987 0 0014 12a3.987 3.987 0 00-.172-1.172 1 1 0 010-1.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{t(audio.titleKey)}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{t(audio.descriptionKey)}</p>
                <audio 
                  controls 
                  className="w-full"
                  preload="metadata"
                >
                  <source src={audio.filePath} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        )}

        {/* Guides Section */}
        {activeTab === 'guides' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideResources.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{t(guide.titleKey)}</h3>
                    <p className="text-gray-600 text-sm mb-4">{t(guide.descriptionKey)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGuideDownload(guide.downloadLink)}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t('download_guide_button')}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {isModalOpen && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">{t(selectedVideo.titleKey)}</h3>
                <button
                  onClick={closeVideoModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <div className="aspect-video">
                  <iframe
                    src={selectedVideo.youtubeLink}
                    title={t(selectedVideo.titleKey)}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600 mt-4">{t(selectedVideo.descriptionKey)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceHub;