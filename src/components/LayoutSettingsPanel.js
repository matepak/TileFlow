import React from 'react';

const LayoutSettingsPanel = ({
    layoutSettings,
    handleRowHeightChange,
    handleForceImagesPerRowToggle,
    handleImagesPerRowChange,
    handleRowSpacingChange,
    handleImageSpacingChange,
    handleLastRowBehaviorChange,
    handlePreventUpscalingChange,
    handleBackgroundColorChange,
    saveLayoutConfiguration,
    loadLayoutConfiguration,
}) => {
    return (
        <div className="panel-content">
            <div className="setting-group">
                <label className="setting-label">Row Height (px):</label>
                <input
                    type="range"
                    min="100"
                    max="400"
                    step="10"
                    value={layoutSettings.rowHeight}
                    onChange={handleRowHeightChange}
                    className="range-slider"
                />
                <span className="setting-value">{layoutSettings.rowHeight}px</span>
            </div>

            <div className="setting-group checkbox-group">
                <input
                    type="checkbox"
                    id="forceImagesPerRow"
                    checked={layoutSettings.forceImagesPerRow.enabled}
                    onChange={handleForceImagesPerRowToggle}
                    className="checkbox-input"
                />
                <label htmlFor="forceImagesPerRow" className="checkbox-label">Force images per row</label>
            </div>

            {layoutSettings.forceImagesPerRow.enabled && (
                <div className="setting-group">
                    <label className="setting-label">Images per row:</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={layoutSettings.forceImagesPerRow.count}
                        onChange={handleImagesPerRowChange}
                        className="range-slider"
                    />
                    <span className="setting-value">{layoutSettings.forceImagesPerRow.count}</span>
                </div>
            )}

            <div className="setting-group">
                <label className="setting-label">Row Spacing (px):</label>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={layoutSettings.rowSpacing}
                    onChange={handleRowSpacingChange}
                    className="range-slider"
                />
                <span className="setting-value">{layoutSettings.rowSpacing}px</span>
            </div>

            <div className="setting-group">
                <label className="setting-label">Image Spacing (px):</label>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={layoutSettings.imageSpacing}
                    onChange={handleImageSpacingChange}
                    className="range-slider"
                />
                <span className="setting-value">{layoutSettings.imageSpacing}px</span>
            </div>

            <div className="setting-group">
                <label className="setting-label">Last Row Behavior:</label>
                <select
                    value={layoutSettings.lastRowBehavior}
                    onChange={handleLastRowBehaviorChange}
                    className="select-input"
                >
                    <option value="justify">Justify (smart)</option>
                    <option value="left">Left-aligned</option>
                    <option value="fill">Fill width</option>
                </select>
            </div>

            <div className="setting-group checkbox-group">
                <input
                    type="checkbox"
                    id="preventUpscaling"
                    checked={layoutSettings.preventUpscaling}
                    onChange={handlePreventUpscalingChange}
                    className="checkbox-input"
                />
                <label htmlFor="preventUpscaling" className="checkbox-label">Prevent upscaling</label>
            </div>

            <div className="setting-group">
                <label className="setting-label">Background:</label>
                <input
                    type="color"
                    value={layoutSettings.backgroundColor}
                    onChange={handleBackgroundColorChange}
                    className="color-picker"
                />
            </div>

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
    );
};

export default LayoutSettingsPanel; 