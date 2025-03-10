import React from 'react';

const SortingPanel = ({
    layoutSettings,
    handleSortingTypeChange,
    handleSortingDirectionChange
}) => {
    return (
        <div className="panel-content">
            <div className="setting-group">
                <label className="setting-label">Sort By:</label>
                <select
                    value={layoutSettings.sorting.type}
                    onChange={handleSortingTypeChange}
                    className="select-input"
                >
                    <option value="label">Label Name</option>
                    <option value="filename">File Name</option>
                    <option value="size">Image Size</option>
                    <option value="none">No Sorting</option>
                </select>
            </div>

            <div className="setting-group">
                <label className="setting-label">Direction:</label>
                <select
                    value={layoutSettings.sorting.direction}
                    onChange={handleSortingDirectionChange}
                    className="select-input"
                >
                    <option value="asc">Ascending (A-Z)</option>
                    <option value="desc">Descending (Z-A)</option>
                </select>
            </div>

            <div className="sorting-info">
                <p className="info-text">
                    <strong>Label Name:</strong> Sort alphabetically by the label text shown on each image
                </p>
                <p className="info-text">
                    <strong>File Name:</strong> Sort alphabetically by the original filename
                </p>
                <p className="info-text">
                    <strong>Image Size:</strong> Sort by the image dimensions (width × height)
                </p>
                <p className="info-text">
                    <strong>No Sorting:</strong> Leave images in their upload order
                </p>
            </div>
        </div>
    );
};

export default SortingPanel; 