import React from 'react';
import SaveGalleryImage from './SaveGalleryImage';

const ExportPanel = ({
    layoutSettings,
    handleDpiChange,
    galleryRef,
    images,
    isSaving,
    setIsSaving,
    layoutType
}) => {
    return (
        <div className="panel-content">
            <div className="setting-group">
                <h3 className="setting-title">Image Export Settings</h3>

                <div className="setting-item">
                    <label htmlFor="dpi-setting">DPI Resolution:</label>
                    <input
                        id="dpi-setting"
                        type="range"
                        min="72"
                        max="600"
                        step="1"
                        value={layoutSettings.export.dpi}
                        onChange={handleDpiChange}
                    />
                    <span className="setting-value">{layoutSettings.export.dpi} DPI</span>
                </div>

                <div className="dpi-presets">
                    <button
                        className={`preset-button ${layoutSettings.export.dpi === 72 ? 'active' : ''}`}
                        onClick={() => handleDpiChange({ target: { value: '72' } })}
                    >
                        72 DPI
                        <span className="preset-description">Web/Screen</span>
                    </button>
                    <button
                        className={`preset-button ${layoutSettings.export.dpi === 150 ? 'active' : ''}`}
                        onClick={() => handleDpiChange({ target: { value: '150' } })}
                    >
                        150 DPI
                        <span className="preset-description">Basic Print</span>
                    </button>
                    <button
                        className={`preset-button ${layoutSettings.export.dpi === 300 ? 'active' : ''}`}
                        onClick={() => handleDpiChange({ target: { value: '300' } })}
                    >
                        300 DPI
                        <span className="preset-description">Quality Print</span>
                    </button>
                    <button
                        className={`preset-button ${layoutSettings.export.dpi === 600 ? 'active' : ''}`}
                        onClick={() => handleDpiChange({ target: { value: '600' } })}
                    >
                        600 DPI
                        <span className="preset-description">Professional</span>
                    </button>
                </div>

                <div className="export-info">
                    <p className="info-text">
                        Higher DPI will result in larger, more detailed images suitable for printing.
                        Lower DPI is better for web or screen viewing.
                    </p>
                </div>

                <div className="export-info">
                    <p className="info-text">
                        The "Save as Image" option will create a PNG file of your gallery layout, including all images, spacing, and labels.
                    </p>
                </div>


            </div>

            <div className="export-button-container">
                <SaveGalleryImage
                    galleryRef={galleryRef}
                    images={images}
                    layoutSettings={layoutSettings}
                    isSaving={isSaving}
                    setIsSaving={setIsSaving}
                    dpi={layoutSettings.export.dpi}
                    isPackeryLayout={layoutType === 'packery'}
                />
            </div>


        </div>
    );
};

export default ExportPanel; 