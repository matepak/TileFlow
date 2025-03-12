import React from 'react';

const PackeryLayoutSettingsPanel = ({
    layoutSettings,
    onImageSpacingChange,
    onPreventUpscalingChange,
    onBackgroundColorChange,
}) => {
    return (
        <div className="settings-panel layout-settings">
            <h3 className="panel-title">Layout Settings</h3>

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
                    onChange={onImageSpacingChange}
                    className="slider-input"
                />
                <span className="value-display">{layoutSettings.imageSpacing}px</span>
            </div>

            {/* Prevent Upscaling */}
            <div className="settings-group">
                <div className="checkbox-wrapper">
                    <input
                        id="preventUpscaling"
                        type="checkbox"
                        checked={layoutSettings.preventUpscaling}
                        onChange={onPreventUpscalingChange}
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
                    onChange={onBackgroundColorChange}
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
