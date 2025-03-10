import React from 'react';

const LabelSettingsPanel = ({
    layoutSettings,
    handleLabelEnableChange,
    handleLabelFontSizeChange,
    handleLabelPaddingChange,
    handleLabelFontColorChange,
    handleLabelBackgroundColorChange,
    handleLabelOpacityChange
}) => {
    return (
        <div className="panel-content">
            <div className="setting-group checkbox-group">
                <input
                    type="checkbox"
                    id="enableLabels"
                    checked={layoutSettings.labels.enabled}
                    onChange={handleLabelEnableChange}
                    className="checkbox-input"
                />
                <label htmlFor="enableLabels" className="checkbox-label">Show Labels</label>
            </div>

            <div className="setting-group">
                <label className="setting-label">Font Size (px):</label>
                <input
                    type="range"
                    min="8"
                    max="24"
                    value={layoutSettings.labels.fontSize}
                    onChange={handleLabelFontSizeChange}
                    disabled={!layoutSettings.labels.enabled}
                    className="range-slider"
                />
                <span className="setting-value">{layoutSettings.labels.fontSize}px</span>
            </div>

            <div className="setting-group">
                <label className="setting-label">Padding (px):</label>
                <input
                    type="range"
                    min="2"
                    max="16"
                    value={layoutSettings.labels.padding}
                    onChange={handleLabelPaddingChange}
                    disabled={!layoutSettings.labels.enabled}
                    className="range-slider"
                />
                <span className="setting-value">{layoutSettings.labels.padding}px</span>
            </div>

            <div className="setting-group">
                <label className="setting-label">Font Color:</label>
                <input
                    type="color"
                    value={layoutSettings.labels.fontColor}
                    onChange={handleLabelFontColorChange}
                    disabled={!layoutSettings.labels.enabled}
                    className="color-picker"
                />
            </div>

            <div className="setting-group">
                <label className="setting-label">Background Color:</label>
                <input
                    type="color"
                    value={layoutSettings.labels.backgroundColor}
                    onChange={handleLabelBackgroundColorChange}
                    disabled={!layoutSettings.labels.enabled}
                    className="color-picker"
                />
            </div>

            <div className="setting-group">
                <label className="setting-label">Background Opacity:</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layoutSettings.labels.backgroundOpacity}
                    onChange={handleLabelOpacityChange}
                    disabled={!layoutSettings.labels.enabled}
                    className="range-slider"
                />
                <span className="setting-value">{layoutSettings.labels.backgroundOpacity}</span>
            </div>
        </div>
    );
};

export default LabelSettingsPanel; 