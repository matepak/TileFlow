import React from 'react';
import { hexToRgba } from '../utils/imageUtils';
import useRow from '../hooks/useRow';
import useContainerWidth from '../hooks/useContainerWidth';

const RowDisplay = ({
    images,
    imagesByRow,
    layoutSettings,
    containerRef,
    galleryRef,
    fileInputRef,
    updateImageLabel,
    removeImage,
    setImages,
    sortImagesCallback
}) => {
    const containerWidth = useContainerWidth(containerRef, layoutSettings.containerPadding);

    // Use the row layout hook
    useRow(
        images,
        setImages,
        containerWidth,
        layoutSettings,
        sortImagesCallback,
        false // Never disable since this is the row display component
    );

    return (
        <div
            ref={containerRef}
            className="image-gallery"
            style={{
                padding: layoutSettings.containerPadding,
                backgroundColor: layoutSettings.backgroundColor
            }}
        >
            {images.length === 0 ? (
                <div className="empty-gallery">
                    <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="empty-title">No images uploaded yet</p>
                    <p className="empty-description">Upload some images to see the row-based layout in action</p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="action-button upload-button empty-upload"
                    >
                        Select Images
                    </button>
                </div>
            ) : (
                <div className="gallery-content" ref={galleryRef}>
                    {Object.entries(imagesByRow).map(([rowIndex, rowImages]) => (
                        <div
                            key={rowIndex}
                            className="gallery-row"
                            style={{
                                marginBottom: rowIndex < Object.keys(imagesByRow).length - 1 ? `${layoutSettings.rowSpacing}px` : 0
                            }}
                        >
                            {rowImages.map((image, imgIndex) => (
                                <div
                                    key={image.id}
                                    className="image-container"
                                    style={{
                                        height: `${image.displayHeight}px`,
                                        width: `${image.displayWidth}px`,
                                        marginRight: imgIndex < rowImages.length - 1 ? `${layoutSettings.imageSpacing}px` : 0
                                    }}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.fileName || `Image ${image.id}`}
                                        className="gallery-image"
                                    />

                                    {/* Image Label */}
                                    {layoutSettings.labels.enabled && image.label && (
                                        <div
                                            className="image-label"
                                            style={{
                                                backgroundColor: hexToRgba(
                                                    layoutSettings.labels.backgroundColor,
                                                    layoutSettings.labels.backgroundOpacity
                                                ),
                                                color: layoutSettings.labels.fontColor,
                                                padding: `${layoutSettings.labels.padding}px`,
                                                fontSize: `${layoutSettings.labels.fontSize}px`,
                                            }}
                                        >
                                            {image.label}
                                        </div>
                                    )}

                                    {/* Remove Image */}
                                    <button
                                        className="remove-image"
                                        onClick={removeImage}
                                        data-id={image.id}
                                    >
                                        <svg className="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>

                                    {/* Hover Info */}
                                    <div className="image-info">
                                        <div className="info-filename">{image.fileName}</div>
                                        <div className="info-dimensions">{image.originalWidth}×{image.originalHeight}</div>

                                        {/* Label Editor */}
                                        <div className="label-editor">
                                            <span className="editor-label">Label:</span>
                                            <input
                                                type="text"
                                                value={image.label || ''}
                                                onChange={(e) => updateImageLabel(image.id, e.target.value)}
                                                className="editor-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RowDisplay; 