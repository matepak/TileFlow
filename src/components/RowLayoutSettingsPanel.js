import React from 'react';

const RowLayoutSettingsPanel = ({
    layoutSettings,
    onRowHeightChange,
    onImageSpacingChange,
    onLastRowBehaviorChange,
    onPreventUpscalingChange,
    onBackgroundColorChange,
    onForceImagesPerRowToggle,
    onImagesPerRowChange,
}) => {
    // Add handler functions to extract values from events
    const handleRowHeight = (e) => {
        const value = parseInt(e.target.value, 10);
        onRowHeightChange(value);
    };

    const handleImageSpacing = (e) => {
        const value = parseInt(e.target.value, 10);
        onImageSpacingChange(value);
    };

    const handleLastRowBehavior = (e) => {
        const value = e.target.value;
        onLastRowBehaviorChange(value);
    };

    const handlePreventUpscaling = (e) => {
        const checked = e.target.checked;
        onPreventUpscalingChange(checked);
    };

    const handleBackgroundColor = (e) => {
        const color = e.target.value;
        onBackgroundColorChange(color);
    };

    const handleForceImagesPerRowToggle = (e) => {
        const checked = e.target.checked;
        onForceImagesPerRowToggle(checked);
    };

    const handleImagesPerRow = (e) => {
        const value = parseInt(e.target.value, 10);
        onImagesPerRowChange(value);
    };

    return (
        <div className="settings-panel layout-settings">
            <h3 className="panel-title">Layout Settings</h3>

            {/* Row Height */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="rowHeight">
                    Row Height (px):
                </label>
                <input
                    id="rowHeight"
                    type="range"
                    min="50"
                    max="500"
                    value={layoutSettings.rowHeight}
                    onChange={handleRowHeight}
                    className="slider-input"
                />
                <span className="value-display">{layoutSettings.rowHeight}px</span>
            </div>

            {/* Force Images Per Row */}
            <div className="settings-group">
                <div className="checkbox-wrapper">
                    <input
                        id="forceImagesPerRow"
                        type="checkbox"
                        checked={layoutSettings.forceImagesPerRow.enabled}
                        onChange={handleForceImagesPerRowToggle}
                        className="checkbox-input"
                    />
                    <label className="settings-label checkbox-label" htmlFor="forceImagesPerRow">
                        Fixed images per row
                    </label>
                </div>

                {layoutSettings.forceImagesPerRow.enabled && (
                    <div className="sub-setting">
                        <label className="settings-label" htmlFor="imagesPerRow">
                            Images per row:
                        </label>
                        <input
                            id="imagesPerRow"
                            type="range"
                            min="1"
                            max="10"
                            value={layoutSettings.forceImagesPerRow.count}
                            onChange={handleImagesPerRow}
                            className="slider-input"
                        />
                        <span className="value-display">{layoutSettings.forceImagesPerRow.count}</span>
                    </div>
                )}
            </div>

            {/* Image Spacing */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="imageSpacing">
                    Spacing Between Images and Rows (px):
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

            {/* Last Row Behavior */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="lastRowBehavior">
                    Last Row Behavior:
                </label>
                <select
                    id="lastRowBehavior"
                    value={layoutSettings.lastRowBehavior}
                    onChange={handleLastRowBehavior}
                    className="select-input"
                >
                    <option value="justify">Justify</option>
                    <option value="left">Left Align</option>
                    <option value="fill">Fill Width</option>
                </select>
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
                <span className="value-display">{layoutSettings.backgroundColor}</span>
            </div>
        </div>
    );
};

export default RowLayoutSettingsPanel; 