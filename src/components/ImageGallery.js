import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ImageGallery.css'; // We'll create this CSS file separately
import SaveGalleryImage from './SaveGalleryImage';
import { hexToRgba } from '../utils/imageUtils';
import logo from '../assets/logo.png'; // Add this import at the top
import { defaultLayoutSettings } from '../constants/defaultSettings';
import useContainerWidth from '../hooks/useContainerWidth';
import useCleanupObjectUrls from '../hooks/useCleanupObjectUrls';
import { handleImageUpload } from '../utils/imageUploadHandler';
import { sortImages } from '../utils/sortUtils';
import GalleryDisplay from './GalleryDisplay';
import MainControls from './MainControls';
import ExportPanel from './ExportPanel';
import SortingPanel from './SortingPanel';
import LabelSettingsPanel from './LabelSettingsPanel';

const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const [layoutSettings, setLayoutSettings] = useState(defaultLayoutSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('layout'); // 'layout', 'labels', 'sorting', 'export'
    const containerRef = useRef(null);
    const galleryRef = useRef(null);
    const fileInputRef = useRef(null);
    const containerWidth = useContainerWidth(containerRef, layoutSettings.containerPadding);

    const onImageUpload = async (event) => {
        await handleImageUpload(
            event.target.files,
            images,
            setImages,
            setIsLoading,
            fileInputRef
        );
    };

    // Use the imported sortImages function with useCallback
    const sortImagesCallback = useCallback((imagesToSort) => {
        return sortImages(imagesToSort, layoutSettings.sorting);
    }, [layoutSettings.sorting]);

    // Calculate row-based layout when images or container width change
    useEffect(() => {
        if (images.length === 0 || containerWidth === 0) return;

        // First sort the images
        const sortedImages = sortImagesCallback([...images]);

        // Check if any images have no layout (typically newly uploaded images)
        const needsLayout = sortedImages.some(img => img.displayWidth === 0 && img.displayHeight === 0);

        // Then calculate the layout based on whether we're forcing images per row
        let layoutResult;
        if (layoutSettings.forceImagesPerRow.enabled) {
            layoutResult = calculateFixedImagesPerRowLayout(
                sortedImages,
                containerWidth,
                layoutSettings.forceImagesPerRow.count,
                layoutSettings.imageSpacing,
                layoutSettings.preventUpscaling
            );
        } else {
            layoutResult = calculateRowBasedLayout(
                sortedImages,
                containerWidth,
                layoutSettings.rowHeight,
                layoutSettings.imageSpacing,
                layoutSettings.lastRowBehavior,
                layoutSettings.preventUpscaling
            );
        }

        // Only update images if they need layout or the layout actually changed
        setImages(prevImages => {
            // If newly uploaded images need layout, always update
            if (needsLayout) {
                return layoutResult;
            }

            // For existing images, check if layout changed
            // Skip stringification to avoid performance issues with large arrays
            const layoutChanged = prevImages.some((img, idx) => {
                const layoutImg = layoutResult[idx];
                return !layoutImg ||
                    img.displayWidth !== layoutImg.displayWidth ||
                    img.displayHeight !== layoutImg.displayHeight ||
                    img.rowIndex !== layoutImg.rowIndex;
            });

            return layoutChanged ? layoutResult : prevImages;
        });
    }, [
        images,
        containerWidth,
        layoutSettings.rowHeight,
        layoutSettings.imageSpacing,
        layoutSettings.lastRowBehavior,
        layoutSettings.preventUpscaling,
        layoutSettings.forceImagesPerRow.enabled,
        layoutSettings.forceImagesPerRow.count,
        layoutSettings.sorting.type,
        layoutSettings.sorting.direction,
        sortImagesCallback
    ]);

    // Fixed images per row layout algorithm
    const calculateFixedImagesPerRowLayout = (
        imagesToLayout,
        containerWidth,
        imagesPerRow,
        imageSpacing,
        preventUpscaling
    ) => {
        if (imagesToLayout.length === 0 || containerWidth <= 0) return imagesToLayout;

        // Deep copy the images
        const imagesCopy = JSON.parse(JSON.stringify(imagesToLayout));

        // Calculate groups of images based on specified count
        const rows = [];
        for (let i = 0; i < imagesCopy.length; i += imagesPerRow) {
            rows.push(imagesCopy.slice(i, i + imagesPerRow));
        }

        // Process each row
        rows.forEach((rowImages, rowIndex) => {
            // Calculate available width for images (container width minus spacing)
            const totalSpacing = (rowImages.length - 1) * imageSpacing;
            const availableWidth = containerWidth - totalSpacing;

            // Calculate the sum of aspect ratios for this row
            const sumAspectRatios = rowImages.reduce((sum, img) => sum + img.aspectRatio, 0);

            // Calculate row height that would make these images fit the width
            const rowHeight = availableWidth / sumAspectRatios;

            // Apply height to each image in the row
            rowImages.forEach(img => {
                // Calculate width based on aspect ratio and row height
                let calculatedWidth = img.aspectRatio * rowHeight;
                let calculatedHeight = rowHeight;

                // If preventing upscaling, check against original dimensions
                if (preventUpscaling && rowHeight > img.originalHeight) {
                    calculatedHeight = img.originalHeight;
                    calculatedWidth = img.aspectRatio * calculatedHeight;
                }

                // Apply dimensions
                img.displayWidth = calculatedWidth;
                img.displayHeight = calculatedHeight;
                img.rowIndex = rowIndex;
            });
        });

        return imagesCopy;
    };

    // Row-based layout algorithm
    const calculateRowBasedLayout = (
        imagesToLayout,
        containerWidth,
        targetRowHeight,
        imageSpacing,
        lastRowBehavior,
        preventUpscaling
    ) => {
        if (imagesToLayout.length === 0 || containerWidth <= 0) return imagesToLayout;

        // Deep copy the images
        const imagesCopy = JSON.parse(JSON.stringify(imagesToLayout));

        // Define layout variables
        const rows = [];
        let currentRow = [];
        let currentRowWidth = 0;

        // Calculate the layout
        imagesCopy.forEach((image, index) => {
            // Check if we need to limit height due to prevent upscaling
            let effectiveHeight = targetRowHeight;
            if (preventUpscaling && image.originalHeight < targetRowHeight) {
                effectiveHeight = image.originalHeight;
            }

            // Calculate width based on aspect ratio and effective height
            const scaledWidth = image.aspectRatio * effectiveHeight;

            // Calculate additional width needed for this image including spacing
            const widthWithSpacing = currentRow.length > 0 ? scaledWidth + imageSpacing : scaledWidth;

            // If adding this image would exceed container width, 
            // complete the current row and start a new one
            if (currentRowWidth + widthWithSpacing > containerWidth && currentRow.length > 0) {
                // Process the current row
                processRow(currentRow, containerWidth, targetRowHeight, imageSpacing, preventUpscaling, rows.length);

                // Add row to rows collection
                rows.push([...currentRow]);

                // Start a new row with current image
                currentRow = [image];
                currentRowWidth = scaledWidth;
            } else {
                // Add image to current row
                currentRow.push(image);
                currentRowWidth += widthWithSpacing;
            }

            // Handle the last image
            if (index === imagesCopy.length - 1 && currentRow.length > 0) {
                // Process the last row based on behavior
                processLastRow(
                    currentRow,
                    containerWidth,
                    targetRowHeight,
                    imageSpacing,
                    lastRowBehavior,
                    preventUpscaling,
                    rows.length
                );

                rows.push([...currentRow]);
            }
        });

        // Helper function to process a row of images
        function processRow(rowImages, containerWidth, targetHeight, spacing, preventUpscaling, rowIndex) {
            // Calculate effective heights for each image (accounting for upscaling prevention)
            rowImages.forEach(img => {
                img.effectiveHeight = preventUpscaling && img.originalHeight < targetHeight
                    ? img.originalHeight
                    : targetHeight;
            });

            // Calculate widths based on aspect ratios and effective heights
            rowImages.forEach(img => {
                img.naturalWidth = img.aspectRatio * img.effectiveHeight;
            });

            // Calculate total natural width and spacing for the row
            const totalSpacing = (rowImages.length - 1) * spacing;
            const totalNaturalWidth = rowImages.reduce((sum, img) => sum + img.naturalWidth, 0);

            // Calculate scaling factor to make row exactly fit container
            const scalingFactor = (containerWidth - totalSpacing) / totalNaturalWidth;

            // Apply scaling to all images in the row
            rowImages.forEach(img => {
                // Scale width but maintain aspect ratio
                const scaledWidth = img.naturalWidth * scalingFactor;

                // Check if scaling would upscale this image
                if (preventUpscaling && scaledWidth > img.originalWidth) {
                    // Use original dimensions
                    img.displayWidth = img.originalWidth;
                    img.displayHeight = img.originalHeight;
                } else {
                    // Scale down
                    img.displayWidth = scaledWidth;
                    img.displayHeight = img.effectiveHeight * scalingFactor;
                }

                img.rowIndex = rowIndex;
            });
        }

        // Helper function to process the last row of images
        function processLastRow(rowImages, containerWidth, targetHeight, spacing, behavior, preventUpscaling, rowIndex) {
            // Calculate effective heights (accounting for upscaling prevention)
            rowImages.forEach(img => {
                img.effectiveHeight = preventUpscaling && img.originalHeight < targetHeight
                    ? img.originalHeight
                    : targetHeight;
            });


            // Calculate widths based on aspect ratios and effective heights
            rowImages.forEach(img => {
                img.naturalWidth = img.aspectRatio * img.effectiveHeight;
            });

            // Calculate total natural width and spacing
            const totalSpacing = (rowImages.length - 1) * spacing;
            const totalNaturalWidth = rowImages.reduce((sum, img) => sum + img.naturalWidth, 0);

            // Determine how to handle the last row
            if (behavior === 'left') {
                // Left-align the last row (no scaling)
                rowImages.forEach(img => {
                    // Use natural size but respect original dimensions if preventing upscaling
                    if (preventUpscaling && img.effectiveHeight > img.originalHeight) {
                        img.displayWidth = img.originalWidth;
                        img.displayHeight = img.originalHeight;
                    } else {
                        img.displayWidth = img.naturalWidth;
                        img.displayHeight = img.effectiveHeight;
                    }
                    img.rowIndex = rowIndex;
                });
            } else if (behavior === 'fill' ||
                (behavior === 'justify' && totalNaturalWidth > containerWidth * 0.7)) {
                // Scale to fill container width
                const scalingFactor = (containerWidth - totalSpacing) / totalNaturalWidth;

                rowImages.forEach(img => {
                    const scaledWidth = img.naturalWidth * scalingFactor;
                    const scaledHeight = img.effectiveHeight * scalingFactor;

                    // Check if scaling would upscale this image
                    if (preventUpscaling && scaledWidth > img.originalWidth) {
                        // Use original dimensions
                        img.displayWidth = img.originalWidth;
                        img.displayHeight = img.originalHeight;
                    } else {
                        // Apply scaling
                        img.displayWidth = scaledWidth;
                        img.displayHeight = scaledHeight;
                    }

                    img.rowIndex = rowIndex;
                });
            } else {
                // Default behavior - just use natural dimensions
                rowImages.forEach(img => {
                    if (preventUpscaling && img.effectiveHeight > img.originalHeight) {
                        img.displayWidth = img.originalWidth;
                        img.displayHeight = img.originalHeight;
                    } else {
                        img.displayWidth = img.naturalWidth;
                        img.displayHeight = img.effectiveHeight;
                    }
                    img.rowIndex = rowIndex;
                });
            }
        }

        // Flatten rows back to a single array
        return imagesCopy;
    };

    // Save the current layout configuration as JSON
    const saveLayoutConfiguration = () => {
        if (images.length === 0) return;

        try {
            // Create a configuration object
            const configuration = {
                settings: layoutSettings,
                timestamp: new Date().toISOString(),
                imageCount: images.length
            };

            // Convert to JSON
            const configJson = JSON.stringify(configuration, null, 2);

            // Create a blob
            const blob = new Blob([configJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `gallery-config-${Date.now()}.json`;

            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Clean up
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error saving configuration:', error);
            alert('There was an error saving the configuration. Please try again.');
        }
    };

    // Update image label and re-sort images
    const updateImageLabel = (imageId, newLabel) => {
        setImages(prevImages => {
            const updatedImages = prevImages.map(img =>
                img.id === imageId ? { ...img, label: newLabel } : img
            );
            return updatedImages;
        });
    };

    // Replace the cleanup useEffect with the custom hook
    useCleanupObjectUrls(images);

    // Layout Settings Handlers
    const handleRowHeightChange = (e) => {
        const rowHeight = parseInt(e.target.value);
        setLayoutSettings({ ...layoutSettings, rowHeight });
    };

    const handleRowSpacingChange = (e) => {
        const rowSpacing = parseInt(e.target.value);
        setLayoutSettings({ ...layoutSettings, rowSpacing });
    };

    const handleImageSpacingChange = (e) => {
        const imageSpacing = parseInt(e.target.value);
        setLayoutSettings({ ...layoutSettings, imageSpacing });
    };

    const handleLastRowBehaviorChange = (e) => {
        const lastRowBehavior = e.target.value;
        setLayoutSettings({ ...layoutSettings, lastRowBehavior });
    };

    const handlePreventUpscalingChange = (e) => {
        const preventUpscaling = e.target.checked;
        setLayoutSettings({ ...layoutSettings, preventUpscaling });
    };

    const handleBackgroundColorChange = (e) => {
        const backgroundColor = e.target.value;
        setLayoutSettings({ ...layoutSettings, backgroundColor });
    };

    // Force Images Per Row Settings Handlers
    const handleForceImagesPerRowToggle = (e) => {
        const enabled = e.target.checked;
        setLayoutSettings({
            ...layoutSettings,
            forceImagesPerRow: { ...layoutSettings.forceImagesPerRow, enabled }
        });
    };

    const handleImagesPerRowChange = (e) => {
        const count = parseInt(e.target.value);
        setLayoutSettings({
            ...layoutSettings,
            forceImagesPerRow: { ...layoutSettings.forceImagesPerRow, count }
        });
    };

    // Sorting Settings Handlers
    const handleSortingTypeChange = (e) => {
        const type = e.target.value;
        setLayoutSettings({
            ...layoutSettings,
            sorting: { ...layoutSettings.sorting, type }
        });
    };

    const handleSortingDirectionChange = (e) => {
        const direction = e.target.value;
        setLayoutSettings({
            ...layoutSettings,
            sorting: { ...layoutSettings.sorting, direction }
        });
    };

    // Label Settings Handlers
    const handleLabelEnableChange = (e) => {
        const enabled = e.target.checked;
        setLayoutSettings({
            ...layoutSettings,
            labels: { ...layoutSettings.labels, enabled }
        });
    };

    const handleLabelFontSizeChange = (e) => {
        const fontSize = parseInt(e.target.value);
        setLayoutSettings({
            ...layoutSettings,
            labels: { ...layoutSettings.labels, fontSize }
        });
    };

    const handleLabelPaddingChange = (e) => {
        const padding = parseInt(e.target.value);
        setLayoutSettings({
            ...layoutSettings,
            labels: { ...layoutSettings.labels, padding }
        });
    };

    const handleLabelFontColorChange = (e) => {
        const fontColor = e.target.value;
        setLayoutSettings({
            ...layoutSettings,
            labels: { ...layoutSettings.labels, fontColor }
        });
    };

    const handleLabelBackgroundColorChange = (e) => {
        const backgroundColor = e.target.value;
        setLayoutSettings({
            ...layoutSettings,
            labels: { ...layoutSettings.labels, backgroundColor }
        });
    };

    const handleLabelOpacityChange = (e) => {
        const opacity = parseFloat(e.target.value);
        setLayoutSettings({
            ...layoutSettings,
            labels: { ...layoutSettings.labels, backgroundOpacity: opacity }
        });
    };

    // Export Settings Handlers
    const handleDpiChange = (e) => {
        const dpi = parseInt(e.target.value, 10);
        setLayoutSettings({
            ...layoutSettings,
            export: { ...layoutSettings.export, dpi }
        });
    };

    const clearImages = () => {
        // Revoke object URLs
        images.forEach(image => {
            if (image.src) {
                URL.revokeObjectURL(image.src);
            }
        });
        setImages([]);
    };

    const removeImage = (e) => {
        e.stopPropagation(); // Prevent event bubbling to parent elements

        // Find the closest button that has the data-id attribute
        const button = e.target.closest('.remove-image');
        if (!button) return;

        const imageId = button.getAttribute('data-id');
        if (!imageId) {
            console.error('Image ID not found');
            return;
        }

        console.log('Removing image with ID:', imageId);
        // Convert both IDs to strings to ensure consistent comparison
        setImages(prevImages => prevImages.filter(img => String(img.id) !== String(imageId)));
    };

    // Group images by row for rendering
    const imagesByRow = images.reduce((acc, image) => {
        const rowIndex = image.rowIndex || 0;
        if (!acc[rowIndex]) acc[rowIndex] = [];
        acc[rowIndex].push(image);
        return acc;
    }, {});

    // Replace the saveGalleryAsImage function with a call to the imported function
    // const handleSaveGallery = () => {
    //     saveGalleryAsImage(galleryRef, images, layoutSettings, setIsSaving);
    // };

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1 className="gallery-title">TileFlow</h1>
                <img src={logo} alt="TileFlow Logo" className="gallery-logo" />
            </div>
            <p className="gallery-description">Generate a grid of images</p>


            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'layout' ? 'active' : ''}`}
                    onClick={() => setActiveTab('layout')}
                >
                    Layout Settings
                </button>
                <button
                    className={`tab-button ${activeTab === 'labels' ? 'active' : ''}`}
                    onClick={() => setActiveTab('labels')}
                >
                    Label Settings
                </button>
                <button
                    className={`tab-button ${activeTab === 'sorting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sorting')}
                >
                    Sorting
                </button>
                <button
                    className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
                    onClick={() => setActiveTab('export')}
                >
                    Export
                </button>
            </div>

            {/* Settings Panel */}
            <div className="settings-panel">
                {/* Layout Settings Panel */}
                {activeTab === 'layout' && (
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
                    </div>
                )}

                {/* Label Settings Panel */}
                {activeTab === 'labels' && (
                    <LabelSettingsPanel
                        layoutSettings={layoutSettings}
                        handleLabelEnableChange={handleLabelEnableChange}
                        handleLabelFontSizeChange={handleLabelFontSizeChange}
                        handleLabelPaddingChange={handleLabelPaddingChange}
                        handleLabelFontColorChange={handleLabelFontColorChange}
                        handleLabelBackgroundColorChange={handleLabelBackgroundColorChange}
                        handleLabelOpacityChange={handleLabelOpacityChange}
                    />
                )}

                {/* Sorting Panel */}
                {activeTab === 'sorting' && (
                    <SortingPanel
                        layoutSettings={layoutSettings}
                        handleSortingTypeChange={handleSortingTypeChange}
                        handleSortingDirectionChange={handleSortingDirectionChange}
                    />
                )}

                {/* Export Panel */}
                {activeTab === 'export' && (
                    <ExportPanel
                        layoutSettings={layoutSettings}
                        handleDpiChange={handleDpiChange}
                        saveLayoutConfiguration={saveLayoutConfiguration}
                        galleryRef={galleryRef}
                        images={images}
                        isSaving={isSaving}
                        setIsSaving={setIsSaving}
                    />
                )}
            </div>

            {/* Main Controls */}
            <MainControls
                isLoading={isLoading}
                images={images}
                fileInputRef={fileInputRef}
                onImageUpload={onImageUpload}
                clearImages={clearImages}
            />

            {isLoading && (
                <div className="status-message loading-message">Processing images...</div>
            )}

            {isSaving && (
                <div className="status-message saving-message">Creating composite image...</div>
            )}

            {/* Gallery Display Component */}
            <GalleryDisplay
                images={images}
                imagesByRow={imagesByRow}
                layoutSettings={layoutSettings}
                containerRef={containerRef}
                galleryRef={galleryRef}
                fileInputRef={fileInputRef}
                updateImageLabel={updateImageLabel}
                removeImage={removeImage}
            />

            <div className="features-info">
                <h3 className="features-title">Features:</h3>
                <ul className="features-list">
                    <li><strong>Labels:</strong> Each image shows its filename (without extension) in the top-left corner</li>
                    <li><strong>Customizable labels:</strong> Change font color, background color, opacity, size, and padding</li>
                    <li><strong>Edit labels:</strong> Hover over any image to edit its label text</li>
                    <li><strong>Alphabetical sorting:</strong> Images can be sorted by label name, filename, or size</li>
                    <li><strong>Export options:</strong> Save your tiled layout as a composite image with all labels included</li>
                    <li><strong>Organization:</strong> All settings are organized in tabs for better user experience</li>
                </ul>
            </div>
        </div>
    );
};

export default ImageGallery;