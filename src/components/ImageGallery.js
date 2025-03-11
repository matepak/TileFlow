import './ImageGallery.css';
import React, { useState, useRef, useCallback } from 'react';
import logo from '../assets/logo.png'; // Add this import at the top
import { defaultLayoutSettings } from '../constants/defaultSettings';
import useContainerWidth from '../hooks/useContainerWidth';
import useCleanupObjectUrls from '../hooks/useCleanupObjectUrls';
import { handleImageUpload } from '../utils/imageUploadHandler';
import { sortImages } from '../utils/sortUtils';
import { saveLayoutConfiguration as saveConfig, loadLayoutConfiguration as loadConfig } from '../utils/configUtils';
import GalleryDisplay from './GalleryDisplay';
import MainControls from './MainControls';
import ExportPanel from './ExportPanel';
import SortingPanel from './SortingPanel';
import LabelSettingsPanel from './LabelSettingsPanel';
import LayoutSettingsPanel from './LayoutSettingsPanel';
import useLayoutCalculator from '../hooks/useLayoutCalculator';

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

    // Use the custom hook for layout calculation
    useLayoutCalculator(
        images,
        setImages,
        containerWidth,
        layoutSettings,
        sortImagesCallback
    );

    // Save the current layout configuration as JSON
    const saveLayoutConfiguration = () => {
        saveConfig(layoutSettings);
    };

    // load layout configuration
    const loadLayoutConfiguration = () => {
        loadConfig(applyLayoutConfiguration => {
            setLayoutSettings(applyLayoutConfiguration.settings);
        });
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
                    <LayoutSettingsPanel
                        layoutSettings={layoutSettings}
                        handleRowHeightChange={handleRowHeightChange}
                        handleForceImagesPerRowToggle={handleForceImagesPerRowToggle}
                        handleImagesPerRowChange={handleImagesPerRowChange}
                        handleRowSpacingChange={handleRowSpacingChange}
                        handleImageSpacingChange={handleImageSpacingChange}
                        handleLastRowBehaviorChange={handleLastRowBehaviorChange}
                        handlePreventUpscalingChange={handlePreventUpscalingChange}
                        handleBackgroundColorChange={handleBackgroundColorChange}
                        saveLayoutConfiguration={saveLayoutConfiguration}
                        loadLayoutConfiguration={loadLayoutConfiguration}
                    />
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