import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiPlay, FiX, FiDownload, FiExternalLink } from 'react-icons/fi';

const InstallationVideos = ({ videos, downloadableManual }) => {
  const [selectedVideo, setSelectedVideo] = useState(videos[0] || null);
  const [modalOpen, setModalOpen] = useState(false);

  // Function to extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Generate YouTube embed URL from video ID
  const getEmbedUrl = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Generate YouTube thumbnail URL from video ID
  const getThumbnailUrl = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const openModal = (video) => {
    setSelectedVideo(video);
    setModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  return (
    <div className="installation-videos">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div 
            key={index} 
            className="relative cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            onClick={() => openModal(video)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-neutral-100">
              <img 
                src={getThumbnailUrl(video.url) || video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 bg-opacity-80 text-white">
                  <FiPlay size={24} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-white">
              <h3 className="font-medium text-sm">{video.title}</h3>
              <p className="text-xs text-neutral-500 mt-1">{video.duration}</p>
            </div>
          </div>
        ))}

        {downloadableManual && (
          <div className="col-span-1 bg-neutral-50 rounded-lg p-4 flex flex-col justify-between border border-neutral-200">
            <div>
              <h3 className="font-medium text-neutral-800">{downloadableManual.title}</h3>
              <p className="text-xs text-neutral-500 mt-1">{downloadableManual.fileSize}</p>
              <p className="text-sm mt-2 text-neutral-600">{downloadableManual.description}</p>
            </div>
            <div className="mt-4">
              <a 
                href={downloadableManual.url} 
                download
                className="flex items-center justify-center px-4 py-2 bg-white border border-primary-500 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
              >
                <FiDownload className="mr-2" /> Download Manual
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {modalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button 
              onClick={closeModal}
              className="absolute right-2 top-2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-neutral-100 transition-colors"
            >
              <FiX size={20} />
            </button>
            
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={getEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium">{selectedVideo.title}</h3>
              <p className="text-sm text-neutral-500 mt-1">{selectedVideo.duration}</p>
              {selectedVideo.description && (
                <p className="text-sm mt-3">{selectedVideo.description}</p>
              )}
              
              <div className="mt-4 flex justify-between">
                <a 
                  href={selectedVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <FiExternalLink className="mr-1" /> Watch on YouTube
                </a>
                
                {selectedVideo.additionalResources && (
                  <a 
                    href={selectedVideo.additionalResources} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <FiDownload className="mr-1" /> Additional Resources
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

InstallationVideos.propTypes = {
  videos: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      thumbnail: PropTypes.string,
      duration: PropTypes.string,
      description: PropTypes.string,
      additionalResources: PropTypes.string,
    })
  ).isRequired,
  downloadableManual: PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    fileSize: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default InstallationVideos; 