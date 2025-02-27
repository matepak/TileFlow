import React, { useState, useEffect, useRef } from 'react';
import './ImageGallery.css'; // We'll create this CSS file separately

const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const [layoutSettings, setLayoutSettings] = useState({
        rowHeight: 200,
        rowSpacing: 8,
        imageSpacing: 4,
        containerPadding: 12,
        lastRowBehavior: 'justify', // 'justify', 'left', 'fill'
        preventUpscaling: true,
        backgroundColor: '#ffffff',
        forceImagesPerRow: {
            enabled: false,
            count: 3
        },
        sorting: {
            type: 'label', // 'label', 'filename', 'size', 'none'
            direction: 'asc' // 'asc', 'desc'
        },
        labels: {
            enabled: true,
            fontSize: 12,
            fontColor: '#ffffff',
            backgroundColor: '#000000',
            backgroundOpacity: 0.7,
            padding: 6
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const [activeTab, setActiveTab] = useState('layout'); // 'layout', 'labels', 'sorting', 'export'
    const containerRef = useRef(null);
    const galleryRef = useRef(null);
    const fileInputRef = useRef(null);

    // Set up resize observer to get container width
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // Subtract padding to get usable width
                setContainerWidth(entry.contentRect.width - (layoutSettings.containerPadding * 2));
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [layoutSettings.containerPadding]);

    // Extract filename without extension
    const getFileNameWithoutExtension = (fileName) => {
        if (!fileName) return '';
        return fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
    };

    // Process uploaded image files
    const handleImageUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);
        const newImages = [];
        const rejectedFiles = []; // Track rejected files
        const existingIds = images.map(img => img.id);
        let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

        // Process each file to get dimensions and create object URLs
        const processPromises = Array.from(files).map(file => {
            return new Promise((resolve) => {
                // Only process image files
                if (!file.type.startsWith('image/')) {
                    rejectedFiles.push(file.name); // Add to rejected files
                    resolve(null);
                    return;
                }

                const objectUrl = URL.createObjectURL(file);
                const img = new Image();

                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    newImages.push({
                        id: nextId++,
                        fileName: file.name,
                        label: getFileNameWithoutExtension(file.name),
                        src: objectUrl,
                        aspectRatio,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        displayWidth: 0,
                        displayHeight: 0
                    });
                    resolve();
                };

                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve();
                };

                img.src = objectUrl;
            });
        });

        // Wait for all images to be processed
        await Promise.all(processPromises);

        // Add new images to the layout
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        setIsLoading(false);

        // Display message about rejected files if any
        if (rejectedFiles.length > 0) {
            const rejectedMessage = rejectedFiles.length === 1
                ? `File "${rejectedFiles[0]}" was not an image and was skipped.`
                : `${rejectedFiles.length} files were not images and were skipped: ${rejectedFiles.slice(0, 3).join(", ")}${rejectedFiles.length > 3 ? ` and ${rejectedFiles.length - 3} more` : ""}.`;

            alert(rejectedMessage);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Sort images based on current sorting settings
    const sortImages = (imagesToSort) => {
        if (imagesToSort.length <= 1) return imagesToSort;

        const { type, direction } = layoutSettings.sorting;
        const sortedImages = [...imagesToSort];

        const multiplier = direction === 'asc' ? 1 : -1;

        sortedImages.sort((a, b) => {
            if (type === 'label') {
                const labelA = (a.label || '').toLowerCase();
                const labelB = (b.label || '').toLowerCase();
                return multiplier * labelA.localeCompare(labelB);
            } else if (type === 'filename') {
                const filenameA = (a.fileName || '').toLowerCase();
                const filenameB = (b.fileName || '').toLowerCase();
                return multiplier * filenameA.localeCompare(filenameB);
            } else if (type === 'size') {
                const sizeA = a.originalWidth * a.originalHeight;
                const sizeB = b.originalWidth * b.originalHeight;
                return multiplier * (sizeA - sizeB);
            }
            return 0;
        });

        return sortedImages;
    };

    // Calculate row-based layout when images or container width change
    useEffect(() => {
        if (images.length === 0 || containerWidth === 0) return;

        // First sort the images
        const sortedImages = sortImages(images);

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

        setImages(layoutResult);
    }, [
        images.length,
        containerWidth,
        layoutSettings.rowHeight,
        layoutSettings.imageSpacing,
        layoutSettings.lastRowBehavior,
        layoutSettings.preventUpscaling,
        layoutSettings.forceImagesPerRow.enabled,
        layoutSettings.forceImagesPerRow.count,
        layoutSettings.sorting.type,
        layoutSettings.sorting.direction
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

            // Get the tallest effective height in the row
            const maxEffectiveHeight = Math.max(...rowImages.map(img => img.effectiveHeight));

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

            // Get the tallest effective height in the row
            const maxEffectiveHeight = Math.max(...rowImages.map(img => img.effectiveHeight));

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

    // Save the gallery as a composite image
    const saveGalleryAsImage = async () => {
        if (!galleryRef.current || images.length === 0) return;

        setIsSaving(true);

        try {
            // Calculate the total height of the gallery
            let totalHeight = 0;
            let maxRowWidth = 0;

            // Group images by row
            const imagesByRow = images.reduce((acc, image) => {
                const rowIndex = image.rowIndex || 0;
                if (!acc[rowIndex]) acc[rowIndex] = [];
                acc[rowIndex].push(image);
                return acc;
            }, {});

            // Calculate dimensions
            Object.entries(imagesByRow).forEach(([rowIndex, rowImages], index) => {
                const rowHeight = Math.max(...rowImages.map(img => img.displayHeight));
                totalHeight += rowHeight;

                // Add row spacing if not the last row
                if (index < Object.keys(imagesByRow).length - 1) {
                    totalHeight += layoutSettings.rowSpacing;
                }

                // Calculate row width
                const rowWidth = rowImages.reduce((sum, img, imgIndex) => {
                    return sum + img.displayWidth + (imgIndex < rowImages.length - 1 ? layoutSettings.imageSpacing : 0);
                }, 0);

                maxRowWidth = Math.max(maxRowWidth, rowWidth);
            });

            // Create a canvas with the calculated dimensions
            const canvas = document.createElement('canvas');
            canvas.width = maxRowWidth;
            canvas.height = totalHeight;

            // Get the canvas context
            const ctx = canvas.getContext('2d');

            // Fill background
            ctx.fillStyle = layoutSettings.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw each image on the canvas
            let yOffset = 0;

            // Process each row
            for (let rowIndex = 0; rowIndex < Object.keys(imagesByRow).length; rowIndex++) {
                const rowImages = imagesByRow[rowIndex] || [];
                let xOffset = 0;

                // Draw each image in the row
                for (let imgIndex = 0; imgIndex < rowImages.length; imgIndex++) {
                    const img = rowImages[imgIndex];

                    // Draw the image
                    const imgElement = await loadImage(img.src);
                    ctx.drawImage(
                        imgElement,
                        xOffset,
                        yOffset,
                        img.displayWidth,
                        img.displayHeight
                    );

                    // Draw label if enabled
                    if (layoutSettings.labels.enabled && img.label) {
                        const labelPadding = layoutSettings.labels.padding;
                        const fontSize = layoutSettings.labels.fontSize;

                        // Set up text styling
                        ctx.font = `${fontSize}px Arial, sans-serif`;
                        ctx.textBaseline = 'top';

                        // Measure text width
                        const textWidth = ctx.measureText(img.label).width;
                        const labelWidth = textWidth + (labelPadding * 2);
                        const labelHeight = fontSize + (labelPadding * 2);

                        // Draw label background
                        ctx.fillStyle = hexToRgba(
                            layoutSettings.labels.backgroundColor,
                            layoutSettings.labels.backgroundOpacity
                        );
                        ctx.fillRect(xOffset, yOffset, labelWidth, labelHeight);

                        // Draw label text
                        ctx.fillStyle = layoutSettings.labels.fontColor;
                        ctx.fillText(
                            img.label,
                            xOffset + labelPadding,
                            yOffset + labelPadding
                        );
                    }

                    // Update x offset for next image
                    xOffset += img.displayWidth + layoutSettings.imageSpacing;
                }

                // Update y offset for next row
                yOffset += Math.max(...rowImages.map(img => img.displayHeight)) + layoutSettings.rowSpacing;
            }

            // Convert canvas to a downloadable image
            const dataUrl = canvas.toDataURL('image/png');

            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `image-gallery-${Date.now()}.png`;

            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

        } catch (error) {
            console.error('Error saving gallery:', error);
            alert('There was an error saving the gallery. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper function to convert hex to rgba
    const hexToRgba = (hex, opacity) => {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // Helper function to load an image and return a promise
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
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

    // Cleanup object URLs when component unmounts
    useEffect(() => {
        return () => {
            images.forEach(image => {
                if (image.src) {
                    URL.revokeObjectURL(image.src);
                }
            });
        };
    }, []);

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
        const backgroundOpacity = parseFloat(e.target.value);
        setLayoutSettings({
            ...layoutSettings,
            labels: { ...layoutSettings.labels, backgroundOpacity }
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

    // Group images by row for rendering
    const imagesByRow = images.reduce((acc, image) => {
        const rowIndex = image.rowIndex || 0;
        if (!acc[rowIndex]) acc[rowIndex] = [];
        acc[rowIndex].push(image);
        return acc;
    }, {});

    return (
        <div className="gallery-container">
            <h1 className="gallery-title">Advanced Image Gallery</h1>

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
                )}

                {/* Sorting Panel */}
                {activeTab === 'sorting' && (
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
                )}

                {/* Export Panel */}
                {activeTab === 'export' && (
                    <div className="panel-content">
                        <button
                            onClick={saveGalleryAsImage}
                            className="action-button export-button"
                            disabled={isSaving || images.length === 0}
                        >
                            {isSaving ? 'Creating image...' : 'Save as Image'}
                        </button>

                        <button
                            onClick={saveLayoutConfiguration}
                            className="action-button config-button"
                            disabled={images.length === 0}
                        >
                            Save Configuration
                        </button>

                        <div className="export-info">
                            <p className="info-text">
                                The "Save as Image" option will create a PNG file of your gallery layout, including all images, spacing, and labels.
                            </p>
                            <p className="info-text">
                                The "Save Configuration" option will save your current layout settings as a JSON file.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Controls */}
            <div className="main-controls">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="file-input"
                    ref={fileInputRef}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="action-button upload-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Upload Images'}
                </button>

                <button
                    onClick={clearImages}
                    className="action-button clear-button"
                    disabled={isLoading || images.length === 0}
                >
                    Clear All
                </button>
            </div>

            {isLoading && (
                <div className="status-message loading-message">Processing images...</div>
            )}

            {isSaving && (
                <div className="status-message saving-message">Creating composite image...</div>
            )}

            {/* Gallery Container */}
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