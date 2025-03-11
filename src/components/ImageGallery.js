import './ImageGallery.css';
import React, { useState, useRef, useCallback } from 'react';
import logo from '../assets/logo.png'; // Add this import at the top
import { defaultLayoutSettings } from '../constants/defaultSettings';
import useContainerWidth from '../hooks/useContainerWidth';
import useCleanupObjectUrls from '../hooks/useCleanupObjectUrls';
import { handleImageUpload } from '../utils/imageUploadHandler';
import { sortImages } from '../utils/sortUtils';
import { saveLayoutConfiguration as saveConfig, loadLayoutConfiguration as loadConfig } from '../utils/configUtils';
import GalleryDisplay from './RowDisplay';
import MainControls from './MainControls';
import ExportPanel from './ExportPanel';
import SortingPanel from './SortingPanel';
import LabelSettingsPanel from './LabelSettingsPanel';
import LayoutSettingsPanel from './LayoutSettingsPanel';
import useLayoutCalculator from '../hooks/useLayoutCalculator';
import PackeryGallery from './PackeryDisplay';

const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const [layoutSettings, setLayoutSettings] = useState(defaultLayoutSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('layout'); // 'layout', 'labels', 'sorting', 'export'
    const [layoutType, setLayoutType] = useState('row'); // 'row' or 'packery'
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

    // Always call the hook, but disable it when not using row layout
    useLayoutCalculator(
        images,
        setImages,
        containerWidth,
        layoutSettings,
        sortImagesCallback,
        layoutType !== 'row' // Disable when not using row layout
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
        const rowSpacing = parseInt(e.target.value);
        setLayoutSettings({ ...layoutSettings, rowSpacing, imageSpacing });
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

    // Find the imagesByRow calculation and make it conditional
    // Calculate imagesByRow only for row-based layout
    const imagesByRow = layoutType === 'row' ? images.reduce((acc, image) => {
        const rowIndex = image.rowIndex || 0;
        if (!acc[rowIndex]) {
            acc[rowIndex] = [];
        }
        acc[rowIndex].push(image);
        return acc;
    }, {}) : {};

    // Add a function to toggle layout type
    const handleLayoutTypeChange = (e) => {
        setLayoutType(e.target.value);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo-container">
                    <img src={logo} alt="TileFlow Logo" className="app-logo" />
                    <h1 className="app-title">TileFlow</h1>
                </div>
            </header>

            <main className="main-content">
                <div className="sidebar">
                    {/* Add layout type selector to the top of MainControls */}
                    <div className="layout-type-selector">
                        <label className="settings-label">Layout Type:</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="layoutType"
                                    value="row"
                                    checked={layoutType === 'row'}
                                    onChange={handleLayoutTypeChange}
                                />
                                Row
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="layoutType"
                                    value="packery"
                                    checked={layoutType === 'packery'}
                                    onChange={handleLayoutTypeChange}
                                />
                                Packery
                            </label>
                        </div>
                    </div>

                    <MainControls
                        onImageUpload={onImageUpload}
                        fileInputRef={fileInputRef}
                        clearImages={clearImages}
                        saveLayoutConfiguration={saveLayoutConfiguration}
                        loadLayoutConfiguration={loadLayoutConfiguration}
                        setActiveTab={setActiveTab}
                        activeTab={activeTab}
                        isLoading={isLoading}
                        images={images}
                    />

                    {activeTab === 'layout' && (
                        <LayoutSettingsPanel
                            layoutSettings={layoutSettings}
                            onRowHeightChange={handleRowHeightChange}
                            onRowSpacingChange={handleRowSpacingChange}
                            onImageSpacingChange={handleImageSpacingChange}
                            onLastRowBehaviorChange={handleLastRowBehaviorChange}
                            onPreventUpscalingChange={handlePreventUpscalingChange}
                            onBackgroundColorChange={handleBackgroundColorChange}
                            onForceImagesPerRowToggle={handleForceImagesPerRowToggle}
                            onImagesPerRowChange={handleImagesPerRowChange}
                            isPackeryLayout={layoutType === 'packery'}
                        />
                    )}

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

                    {activeTab === 'sorting' && (
                        <SortingPanel
                            layoutSettings={layoutSettings}
                            handleSortingTypeChange={handleSortingTypeChange}
                            handleSortingDirectionChange={handleSortingDirectionChange}
                        />
                    )}

                    {activeTab === 'export' && (
                        <ExportPanel
                            layoutSettings={layoutSettings}
                            handleDpiChange={handleDpiChange}
                            galleryRef={galleryRef}
                            containerRef={containerRef}
                            images={images}
                            isSaving={isSaving}
                            setIsSaving={setIsSaving}
                            layoutType={layoutType}
                        />
                    )}

                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                            <div className="loading-text">Processing images...</div>
                        </div>
                    )}

                    {isSaving && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                            <div className="loading-text">Generating image...</div>
                        </div>
                    )}
                </div>

                {/* Conditional rendering based on layout type */}
                {layoutType === 'row' ? (
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
                ) : (
                    <PackeryGallery
                        images={images}
                        layoutSettings={layoutSettings}
                        updateImageLabel={updateImageLabel}
                        removeImage={removeImage}
                        fileInputRef={fileInputRef}
                        galleryRef={galleryRef}
                    />
                )}
            </main>
        </div>
    );
};

export default ImageGallery;