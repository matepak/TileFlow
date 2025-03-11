import { useEffect } from 'react';
import { calculateFixedImagesPerRowLayout, calculateRowBasedLayout } from '../utils/layoutCalculator';

const useLayoutCalculator = (
    images,
    setImages,
    containerWidth,
    layoutSettings,
    sortImagesCallback
) => {
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
        sortImagesCallback,
        setImages
    ]);
};

export default useLayoutCalculator; 