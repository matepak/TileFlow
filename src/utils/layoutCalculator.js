// Layout calculation utilities for the image gallery

/**
 * Calculates a layout with a fixed number of images per row
 * @param {Array} imagesToLayout - Array of image objects to layout
 * @param {number} containerWidth - Width of the container
 * @param {number} imagesPerRow - Number of images to place in each row
 * @param {number} imageSpacing - Spacing between images
 * @param {boolean} preventUpscaling - Whether to prevent images from being scaled up
 * @returns {Array} - Array of images with layout information
 */
export const calculateFixedImagesPerRowLayout = (
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

/**
 * Calculates a row-based layout for images
 * @param {Array} imagesToLayout - Array of image objects to layout
 * @param {number} containerWidth - Width of the container
 * @param {number} targetRowHeight - Target height for each row
 * @param {number} imageSpacing - Spacing between images
 * @param {string} lastRowBehavior - How to handle the last row ('left', 'fill', 'justify')
 * @param {boolean} preventUpscaling - Whether to prevent images from being scaled up
 * @returns {Array} - Array of images with layout information
 */
export const calculateRowBasedLayout = (
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