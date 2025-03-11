import React from 'react';

const LayoutSettingsPanel = ({
    layoutSettings,
    onRowHeightChange,
    onRowSpacingChange,
    onImageSpacingChange,
    onLastRowBehaviorChange,
    onPreventUpscalingChange,
    onBackgroundColorChange,
    onForceImagesPerRowToggle,
    onImagesPerRowChange,
    isPackeryLayout = false
}) => {
    return (
        <div className="settings-panel layout-settings">
            <h3 className="panel-title">Layout Settings</h3>

            {/* Row Height / Base Height */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="rowHeight">
                    {isPackeryLayout ? 'Base Height' : 'Row Height'} (px):
                </label>
                <input
                    id="rowHeight"
                    type="range"
                    min="50"
                    max="500"
                    value={layoutSettings.rowHeight}
                    onChange={onRowHeightChange}
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
                        onChange={onForceImagesPerRowToggle}
                        className="checkbox-input"
                    />
                    <label className="settings-label checkbox-label" htmlFor="forceImagesPerRow">
                        {isPackeryLayout ? 'Fixed columns' : 'Fixed images per row'}
                    </label>
                </div>

                {layoutSettings.forceImagesPerRow.enabled && (
                    <div className="sub-setting">
                        <label className="settings-label" htmlFor="imagesPerRow">
                            {isPackeryLayout ? 'Number of columns:' : 'Images per row:'}
                        </label>
                        <input
                            id="imagesPerRow"
                            type="range"
                            min="1"
                            max="10"
                            value={layoutSettings.forceImagesPerRow.count}
                            onChange={onImagesPerRowChange}
                            className="slider-input"
                        />
                        <span className="value-display">{layoutSettings.forceImagesPerRow.count}</span>
                    </div>
                )}
            </div>

            {/* Row Spacing */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="rowSpacing">
                    {isPackeryLayout ? 'Vertical Spacing' : 'Row Spacing'} (px):
                </label>
                <input
                    id="rowSpacing"
                    type="range"
                    min="0"
                    max="50"
                    value={layoutSettings.rowSpacing}
                    onChange={onRowSpacingChange}
                    className="slider-input"
                />
                <span className="value-display">{layoutSettings.rowSpacing}px</span>
            </div>

            {/* Image Spacing */}
            <div className="settings-group">
                <label className="settings-label" htmlFor="imageSpacing">
                    {isPackeryLayout ? 'Horizontal Spacing' : 'Image Spacing'} (px):
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

            {/* Last Row Behavior (only show if not using Packery layout) */}
            {!isPackeryLayout && (
                <div className="settings-group">
                    <label className="settings-label" htmlFor="lastRowBehavior">
                        Last Row Behavior:
                    </label>
                    <select
                        id="lastRowBehavior"
                        value={layoutSettings.lastRowBehavior}
                        onChange={onLastRowBehaviorChange}
                        className="select-input"
                    >
                        <option value="justify">Justify</option>
                        <option value="left">Left Align</option>
                        <option value="fill">Fill Width</option>
                    </select>
                </div>
            )}

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
                <span className="value-display">{layoutSettings.backgroundColor}</span>
            </div>

            {isPackeryLayout && (
                <div className="packery-info">
                    <h4>About Packery Layout</h4>
                    <p>Packery arranges items in an optimal grid layout, filling gaps efficiently.
                        It works like a masonry layout but with more flexibility.</p>
                    <ul>
                        <li>Images maintain their aspect ratio</li>
                        <li>Spaces are filled efficiently</li>
                        <li>Height is determined by content</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LayoutSettingsPanel; 