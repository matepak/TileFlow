import React, { useRef, useState, useEffect } from 'react';
import usePackery from '../hooks/usePackery';
import { hexToRgba } from '../utils/imageUtils';
import './ImageGallery.css'; // Reuse existing styles

const PackeryDisplay = ({
    images,
    layoutSettings,
    updateImageLabel,
    removeImage,
    fileInputRef,
    galleryRef
}) => {
    const containerRef = useRef(null);
    const [showItems, setShowItems] = useState(false);
    const [enableDrag, setEnableDrag] = useState(false);

    // Initialize Packery
    const { refreshLayout, setupDraggable } = usePackery({
        containerRef,
        items: images,
        layoutSettings,
        isEnabled: images.length > 0,
        isDraggable: enableDrag
    });

    // Short delay before showing items to ensure proper layout
    useEffect(() => {
        if (images.length > 0) {
            const timer = setTimeout(() => {
                setShowItems(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShowItems(false);
        }
    }, [images.length]);

    // Calculate aspect ratio for each image to maintain proportions
    const calculateItemStyle = (image) => {
        const aspectRatio = image.originalWidth / image.originalHeight;

        if (layoutSettings.forceImagesPerRow.enabled) {
            // Fixed width based on images per row
            const containerWidth = containerRef.current?.offsetWidth || 0;
            const availableWidth = containerWidth - (layoutSettings.imageSpacing * (layoutSettings.forceImagesPerRow.count - 1));
            const width = availableWidth / layoutSettings.forceImagesPerRow.count;
            const height = width / aspectRatio;

            return {
                width: `${width}px`,
                height: `${height}px`
            };
        } else {
            // Use row height as base and calculate width
            const width = layoutSettings.rowHeight * aspectRatio;

            return {
                width: `${width}px`,
                height: `${layoutSettings.rowHeight}px`
            };
        }
    };

    // Reference callback for draggable items
    const itemRef = (element) => {
        if (element && enableDrag) {
            setupDraggable(element);
        }
    };

    // Toggle draggable mode
    const toggleDragMode = () => {
        setEnableDrag(prev => !prev);
    };

    return (
        <div className="packery-gallery-wrapper">
            {/* Drag mode toggle - moved outside the gallery container */}
            {images.length > 0 && (
                <div className="drag-mode-toggle">
                    <button
                        onClick={toggleDragMode}
                        className={`drag-toggle-button ${enableDrag ? 'active' : ''}`}
                    >
                        {enableDrag ? 'Exit Drag Mode' : 'Enable Drag Mode'}
                    </button>
                    {enableDrag && (
                        <p className="drag-instructions">Click and drag images to reposition them</p>
                    )}
                </div>
            )}

            <div
                ref={(el) => {
                    containerRef.current = el;
                    if (galleryRef) galleryRef.current = el;
                }}
                className="image-gallery packery-gallery"
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
                        <p className="empty-description">Upload images to see the Packery layout in action</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="action-button upload-button empty-upload"
                        >
                            Select Images
                        </button>
                    </div>
                ) : (
                    <div className={`gallery-content packery-container ${showItems ? 'show-items' : ''}`}>
                        {images.map((image) => (
                            <div
                                key={image.id}
                                ref={itemRef}
                                className={`gallery-item ${enableDrag ? 'draggable' : ''}`}
                                style={calculateItemStyle(image)}
                            >
                                <img
                                    src={image.src}
                                    alt={image.fileName || `Image ${image.id}`}
                                    className="gallery-image"
                                    onLoad={refreshLayout}
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

                                {/* Remove Image - only show if not in drag mode */}
                                {!enableDrag && (
                                    <button
                                        className="remove-image"
                                        onClick={removeImage}
                                        data-id={image.id}
                                    >
                                        <svg className="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                )}

                                {/* Hover Info - only show if not in drag mode */}
                                {!enableDrag && (
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
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackeryDisplay; 