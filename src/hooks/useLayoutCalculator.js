import { useEffect, useRef, useState } from 'react';
import { calculateFixedImagesPerRowLayout, calculateRowBasedLayout } from '../utils/layoutCalculator';

const useLayoutCalculator = (
    images,
    setImages,
    containerWidth,
    layoutSettings,
    sortImagesCallback,
    disabled = false
) => {
    // Use refs to check for changes without causing re-renders
    const prevImagesRef = useRef([]);
    const prevSortingRef = useRef({ type: '', direction: '' });
    const prevContainerWidthRef = useRef(0);
    const prevLayoutSettingsRef = useRef({});
    const prevDisabledRef = useRef(disabled);
    const imagesRef = useRef(images);
    const initialRenderRef = useRef(true);

    // Store setImages function in a ref to avoid dependency issues
    const setImagesRef = useRef(setImages);
    useEffect(() => {
        setImagesRef.current = setImages;
    }, [setImages]);

    // Store sortImagesCallback in a ref to avoid dependency issues
    const sortImagesCallbackRef = useRef(sortImagesCallback);
    useEffect(() => {
        sortImagesCallbackRef.current = sortImagesCallback;
    }, [sortImagesCallback]);

    // Update images ref without causing re-renders
    useEffect(() => {
        imagesRef.current = images;

        // For a new batch of images, we should always recalculate
        if (images.length > 0 && images.some(img => !img.displayWidth || !img.displayHeight)) {
            // Force recalculation on new images, but don't trigger the effect
            calculateAndUpdateLayout();
        }
    }, [images]);

    // The main calculation function extracted to avoid duplication
    const calculateAndUpdateLayout = () => {
        // If disabled or no images, don't calculate
        if (disabled || imagesRef.current.length === 0 || containerWidth === 0) return;

        // First sort the images using the current callback from ref
        const sortedImages = sortImagesCallbackRef.current([...imagesRef.current]);

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

        // Update the images state
        setImagesRef.current(prevImages => {
            // For new images or layout changes, always update
            return layoutResult;
        });
    };

    // Main effect for layout calculations
    useEffect(() => {
        // Track if disabled state has changed
        const disabledChanged = prevDisabledRef.current !== disabled;
        prevDisabledRef.current = disabled;

        // If still disabled, don't do any calculations
        if (disabled) return;

        // Get current images from ref to avoid dependency issues
        const currentImages = imagesRef.current;

        // Early return check for invalid conditions
        if (currentImages.length === 0 || containerWidth === 0) return;

        // Special handling for first render or when switching layout types
        if (initialRenderRef.current || disabledChanged) {
            initialRenderRef.current = false;
            // Direct calculation without setTimeout for first render
            calculateAndUpdateLayout();
            return;
        }

        // Check if sorting options have changed
        const sortingChanged =
            prevSortingRef.current.type !== layoutSettings.sorting.type ||
            prevSortingRef.current.direction !== layoutSettings.sorting.direction;

        // Update the sorting ref
        prevSortingRef.current = {
            type: layoutSettings.sorting.type,
            direction: layoutSettings.sorting.direction
        };

        // Check if images array has changed (new uploads, removals)
        const imagesChanged = currentImages.length !== prevImagesRef.current.length ||
            currentImages.some((img, i) => img.id !== (prevImagesRef.current[i]?.id || ''));

        // Check if container width has changed
        const containerWidthChanged = containerWidth !== prevContainerWidthRef.current;
        prevContainerWidthRef.current = containerWidth;

        // Check if relevant layout settings have changed
        const layoutSettingsChanged =
            layoutSettings.rowHeight !== prevLayoutSettingsRef.current.rowHeight ||
            layoutSettings.imageSpacing !== prevLayoutSettingsRef.current.imageSpacing ||
            layoutSettings.lastRowBehavior !== prevLayoutSettingsRef.current.lastRowBehavior ||
            layoutSettings.preventUpscaling !== prevLayoutSettingsRef.current.preventUpscaling ||
            layoutSettings.forceImagesPerRow.enabled !== prevLayoutSettingsRef.current.forceImagesPerRowEnabled ||
            layoutSettings.forceImagesPerRow.count !== prevLayoutSettingsRef.current.forceImagesPerRowCount;

        // Update layout settings ref
        prevLayoutSettingsRef.current = {
            rowHeight: layoutSettings.rowHeight,
            imageSpacing: layoutSettings.imageSpacing,
            lastRowBehavior: layoutSettings.lastRowBehavior,
            preventUpscaling: layoutSettings.preventUpscaling,
            forceImagesPerRowEnabled: layoutSettings.forceImagesPerRow.enabled,
            forceImagesPerRowCount: layoutSettings.forceImagesPerRow.count
        };

        // Update the images ref
        prevImagesRef.current = [...currentImages];

        // Check if any images have no layout or are coming from the Packery layout
        const needsLayout = disabledChanged ||
            currentImages.some(img => img.displayWidth === 0 && img.displayHeight === 0);

        // Skip calculation if nothing has changed that would affect layout
        if (!needsLayout && !imagesChanged && !sortingChanged &&
            !containerWidthChanged && !layoutSettingsChanged && !disabledChanged) {
            return;
        }

        // Use timeout only for subsequent updates to break potential cycles
        setTimeout(calculateAndUpdateLayout, 0);
    }, [
        disabled,
        containerWidth,
        layoutSettings.rowHeight,
        layoutSettings.imageSpacing,
        layoutSettings.lastRowBehavior,
        layoutSettings.preventUpscaling,
        layoutSettings.forceImagesPerRow.enabled,
        layoutSettings.forceImagesPerRow.count
    ]);
};

export default useLayoutCalculator; 