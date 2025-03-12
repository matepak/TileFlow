import React, { useEffect, useRef, useState } from 'react';
import Packery from 'packery';
import Draggabilly from 'draggabilly';
import imagesLoaded from 'imagesloaded';
import PackeryLayoutSettingsPanel from './PackeryLayoutSettingsPanel';

const PackeryGallery = ({ images }) => {
    const packeryRef = useRef(null);
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [layoutSettings, setLayoutSettings] = useState({
        columnWidth: '25',
        rowHeight: 200,
        gutterSize: 10,
        imageSpacing: 10,
        preventUpscaling: false,
        backgroundColor: '#ffffff'
    });

    // Initialize Packery
    useEffect(() => {
        if (!containerRef.current || !images.length) return;

        const initPackery = () => {
            packeryRef.current = new Packery(containerRef.current, {
                itemSelector: '.gallery-item',
                columnWidth: '.grid-sizer',
                rowHeight: layoutSettings.rowHeight,
                gutter: layoutSettings.gutterSize,
                percentPosition: true
            });

            // Make items draggable
            const items = containerRef.current.getElementsByClassName('gallery-item');
            Array.from(items).forEach(item => {
                const draggie = new Draggabilly(item);
                packeryRef.current.bindDraggabillyEvents(draggie);
            });
        };

        // Wait for images to load
        imagesLoaded(containerRef.current, () => {
            initPackery();
            setIsLoading(false);
        });

        return () => {
            if (packeryRef.current) {
                packeryRef.current.destroy();
            }
        };
    }, [images, layoutSettings.rowHeight, layoutSettings.gutterSize]);

    // Update layout when settings change
    useEffect(() => {
        if (packeryRef.current) {
            packeryRef.current.layout();
        }
    }, [layoutSettings]);

    // Settings handlers
    const onColumnWidthChange = (e) => {
        setLayoutSettings(prev => ({
            ...prev,
            columnWidth: e.target.value
        }));
        updateGridStyles(e.target.value);
    };

    const onRowHeightChange = (e) => {
        setLayoutSettings(prev => ({
            ...prev,
            rowHeight: parseInt(e.target.value)
        }));
    };

    const onGutterSizeChange = (e) => {
        setLayoutSettings(prev => ({
            ...prev,
            gutterSize: parseInt(e.target.value)
        }));
    };

    const onImageSpacingChange = (e) => {
        setLayoutSettings(prev => ({
            ...prev,
            imageSpacing: parseInt(e.target.value)
        }));
    };

    const onPreventUpscalingChange = (e) => {
        setLayoutSettings(prev => ({
            ...prev,
            preventUpscaling: e.target.checked
        }));
    };

    const onBackgroundColorChange = (e) => {
        setLayoutSettings(prev => ({
            ...prev,
            backgroundColor: e.target.value
        }));
    };

    // Update grid styles based on column width
    const updateGridStyles = (columnWidth) => {
        const container = containerRef.current;
        if (!container) return;

        const gridSizer = container.querySelector('.grid-sizer');
        const items = container.getElementsByClassName('gallery-item');

        if (gridSizer) {
            gridSizer.style.width = `${columnWidth}%`;
        }

        Array.from(items).forEach(item => {
            item.style.width = `calc(${columnWidth}% - ${layoutSettings.gutterSize}px)`;
        });

        if (packeryRef.current) {
            packeryRef.current.layout();
        }
    };

    return (
        <div className="packery-gallery-wrapper">
            <PackeryLayoutSettingsPanel
                layoutSettings={layoutSettings}
                onColumnWidthChange={onColumnWidthChange}
                onRowHeightChange={onRowHeightChange}
                onGutterSizeChange={onGutterSizeChange}
                onImageSpacingChange={onImageSpacingChange}
                onPreventUpscalingChange={onPreventUpscalingChange}
                onBackgroundColorChange={onBackgroundColorChange}
            />

            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <div className="loading-text">Loading gallery...</div>
                </div>
            )}

            <div
                ref={containerRef}
                className="packery-container"
                style={{ backgroundColor: layoutSettings.backgroundColor }}
            >
                <div className="grid-sizer" />
                <div className="gutter-sizer" />

                {images.map((image, index) => (
                    <div
                        key={image.id || index}
                        className="gallery-item"
                        style={{
                            width: `calc(${layoutSettings.columnWidth}% - ${layoutSettings.gutterSize}px)`,
                            margin: `0 ${layoutSettings.imageSpacing}px ${layoutSettings.imageSpacing}px 0`
                        }}
                    >
                        <img
                            src={image.url}
                            alt={image.alt || ''}
                            className="gallery-image"
                            style={{
                                maxWidth: layoutSettings.preventUpscaling ? '100%' : 'none'
                            }}
                        />
                        {image.caption && (
                            <div className="image-info">
                                <div className="info-filename">{image.caption}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackeryGallery; 