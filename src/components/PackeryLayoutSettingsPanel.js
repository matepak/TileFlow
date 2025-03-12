import React from 'react';

const PackeryLayoutSettingsPanel = ({
    layoutSettings,
    onImageSpacingChange,
    onPreventUpscalingChange,
    onBackgroundColorChange,
    onImagesPerRowChange,
    onForceImagesPerRowChange
}) => {
    // Add handler functions to extract values from events
    const handleImageSpacing = (e) => {
        const value = parseInt(e.target.value, 10);
        onImageSpacingChange(value);
    };

    const handlePreventUpscaling = (e) => {
        const checked = e.target.checked;
        onPreventUpscalingChange(checked);
    };

    const handleBackgroundColor = (e) => {
        const color = e.target.value;
        onBackgroundColorChange(color);
    };

    const handleImagesPerRow = (e) => {
        const value = parseInt(e.target.value, 10);
        onImagesPerRowChange(value);
    };

    const handleForceImagesPerRow = (e) => {
        const checked = e.target.checked;
        onForceImagesPerRowChange(checked);
    };

    return (
        <div className="settings-panel layout-settings">
            <h3 className="panel-title">Packery Layout Settings</h3>

            <div className="setting-divider"></div>

            {/* Image Spacing */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="imageSpacing">
                    Spacing Between Images (px):
                </label>
                <input
                    id="imageSpacing"
                    type="range"
                    min="0"
                    max="50"
                    value={layoutSettings.imageSpacing}
                    onChange={handleImageSpacing}
                    className="slider-input"
                />
                <span className="value-display">{layoutSettings.imageSpacing}px</span>
            </div>

            {/* Images Per Row Control */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="imagesPerRow">
                    Images Per Row:
                </label>
                <div className="input-group">
                    <input
                        id="imagesPerRow"
                        type="number"
                        min="1"
                        max="12"
                        value={layoutSettings.forceImagesPerRow?.count || 4}
                        onChange={handleImagesPerRow}
                        className="number-input"
                    />
                    <div className="checkbox-wrapper">
                        <input
                            id="forceImagesPerRow"
                            type="checkbox"
                            checked={layoutSettings.forceImagesPerRow?.enabled || false}
                            onChange={handleForceImagesPerRow}
                            className="checkbox-input"
                        />
                        <label className="settings-label checkbox-label" htmlFor="forceImagesPerRow">
                            Force Images Per Row
                        </label>
                    </div>
                </div>
            </div>

            {/* Prevent Upscaling */}
            <div className="settings-group">
                <div className="checkbox-wrapper">
                    <input
                        id="preventUpscaling"
                        type="checkbox"
                        checked={layoutSettings.preventUpscaling}
                        onChange={handlePreventUpscaling}
                        className="checkbox-input"
                    />
                    <label className="settings-label checkbox-label" htmlFor="preventUpscaling">
                        Prevent image upscaling
                    </label>
                </div>
            </div>

            {/* Background Color */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="backgroundColor">
                    Background Color:
                </label>
                <input
                    id="backgroundColor"
                    type="color"
                    value={layoutSettings.backgroundColor}
                    onChange={handleBackgroundColor}
                    className="color-input"
                />
            </div>

            <div className="settings-info">
                <div className="info-text">
                    <strong>Grid Layout Tips:</strong>
                </div>
                <ul className="tips-list">
                    <li>Column width determines how many images fit in a row</li>
                    <li>Row height affects the vertical size of image containers</li>
                    <li>Gutter size controls the spacing between grid items</li>
                </ul>
            </div>
        </div>
    );
};

export default PackeryLayoutSettingsPanel;
