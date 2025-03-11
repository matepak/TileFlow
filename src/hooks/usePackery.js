import { useEffect, useRef, useCallback } from 'react';
import Packery from 'packery';
import imagesLoaded from 'imagesloaded';

/**
 * Custom hook for implementing Packery grid layouts
 * @param {Object} options - Options for the Packery layout
 * @param {React.RefObject} containerRef - Reference to the container element
 * @param {Array} items - Array of items to be laid out
 * @param {Object} layoutSettings - Layout settings from the application state
 * @param {boolean} isEnabled - Whether Packery should be enabled or disabled
 * @param {boolean} isDraggable - Whether items should be draggable
 * @returns {Object} - Packery instance and utility functions
 */
const usePackery = ({
    containerRef,
    items,
    layoutSettings,
    isEnabled = true,
    isDraggable = false
}) => {
    const packeryInstanceRef = useRef(null);

    // Initialize or reset Packery instance
    useEffect(() => {
        if (!containerRef.current || !isEnabled || items.length === 0) return;

        // Initialize Packery with options
        const packeryOptions = {
            // Core Packery options
            itemSelector: '.gallery-item',
            gutter: layoutSettings.imageSpacing,
            percentPosition: true,

            // Additional options that can be customized
            horizontalOrder: layoutSettings.sorting.direction === 'asc',
            transitionDuration: '0.2s',
            initLayout: true,
            resize: true
        };

        // Create new Packery instance
        packeryInstanceRef.current = new Packery(containerRef.current, packeryOptions);

        // Handle image loading with imagesLoaded
        imagesLoaded(containerRef.current).on('progress', () => {
            packeryInstanceRef.current.layout();
        });

        return () => {
            if (packeryInstanceRef.current) {
                packeryInstanceRef.current.destroy();
                packeryInstanceRef.current = null;
            }
        };
    }, [containerRef, isEnabled, items.length, layoutSettings.imageSpacing,
        layoutSettings.sorting.direction]);

    // Update layout when items or relevant settings change
    useEffect(() => {
        if (packeryInstanceRef.current) {
            packeryInstanceRef.current.layout();
        }
    }, [items, layoutSettings.rowHeight, layoutSettings.imageSpacing,
        layoutSettings.forceImagesPerRow.enabled, layoutSettings.forceImagesPerRow.count]);

    // Setup draggable functionality if enabled
    const setupDraggable = useCallback((itemElement) => {
        if (!isDraggable || !packeryInstanceRef.current) return;

        let draggie;

        // Check if Draggabilly is available (need to dynamically import)
        import('draggabilly').then(({ default: Draggabilly }) => {
            // Make the item draggable
            draggie = new Draggabilly(itemElement);

            // Bind Draggabilly events to Packery
            packeryInstanceRef.current.bindDraggabillyEvents(draggie);
        }).catch(err => {
            console.error('Error loading Draggabilly:', err);
        });

        // Return cleanup function
        return () => {
            if (draggie) {
                draggie.destroy();
            }
        };
    }, [isDraggable]);

    // Utility functions
    const refreshLayout = useCallback(() => {
        if (packeryInstanceRef.current) {
            packeryInstanceRef.current.layout();
        }
    }, []);

    return {
        packeryInstance: packeryInstanceRef.current,
        refreshLayout,
        setupDraggable
    };
};

export default usePackery; 