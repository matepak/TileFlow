import React from 'react';

const MainControls = ({
    onImageUpload,
    fileInputRef,
    clearImages,
    saveLayoutConfiguration,
    loadLayoutConfiguration,
    setActiveTab,
    activeTab,
    isLoading,
    images = []
}) => {
    return (
        <div className="main-controls">
            <div className="controls-section">
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

            <div className="controls-section">
                <button
                    onClick={saveLayoutConfiguration}
                    className="action-button config-button"
                >
                    Save Layout
                </button>

                <button
                    onClick={loadLayoutConfiguration}
                    className="action-button config-button"
                >
                    Load Layout
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'layout' ? 'active' : ''}`}
                    onClick={() => setActiveTab('layout')}
                >
                    Layout
                </button>
                <button
                    className={`tab-button ${activeTab === 'labels' ? 'active' : ''}`}
                    onClick={() => setActiveTab('labels')}
                >
                    Labels
                </button>
                <button
                    className={`tab-button ${activeTab === 'sorting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sorting')}
                >
                    Sorting
                </button>
                <button
                    className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
                    onClick={() => setActiveTab('export')}
                >
                    Export
                </button>
            </div>
        </div>
    );
};

export default MainControls; 