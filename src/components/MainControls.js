import React from 'react';

const MainControls = ({
    isLoading,
    images,
    fileInputRef,
    onImageUpload,
    clearImages
}) => {
    return (
        <div className="main-controls">
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={onImageUpload}
                className="file-input"
                ref={fileInputRef}
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                className="action-button upload-button"
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : 'Upload Images'}
            </button>

            <button
                onClick={clearImages}
                className="action-button clear-button"
                disabled={isLoading || images.length === 0}
            >
                Clear All
            </button>
        </div>
    );
};

export default MainControls; 