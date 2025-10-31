import React from 'react';

const PhotoshopOnline: React.FC = () => {
  return (
    <div className="w-full h-full bg-base-100 rounded-lg overflow-hidden border border-base-300">
      <iframe
        src="https://www.photopea.com"
        className="w-full h-full border-0"
        title="Photoshop Online (Photopea)"
        allow="fullscreen"
      ></iframe>
    </div>
  );
};

export default PhotoshopOnline;
