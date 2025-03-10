/**
 * Sorts an array of images based on specified sorting criteria
 * 
 * @param {Array} images - Array of image objects to sort
 * @param {Object} sortingConfig - Configuration for sorting
 * @param {string} sortingConfig.type - Type of sorting ('label', 'filename', 'size', or 'none')
 * @param {string} sortingConfig.direction - Direction of sorting ('asc' or 'desc')
 * @returns {Array} - Sorted array of images
 */
export const sortImages = (images, sortingConfig) => {
    // Return early if no sorting needed
    if (images.length <= 1 || sortingConfig.type === 'none') {
        return images;
    }

    const { type, direction } = sortingConfig;
    const sortedImages = [...images];
    const multiplier = direction === 'asc' ? 1 : -1;

    sortedImages.sort((a, b) => {
        switch (type) {
            case 'label':
                const labelA = (a.label || '').toLowerCase();
                const labelB = (b.label || '').toLowerCase();
                return multiplier * labelA.localeCompare(labelB);

            case 'filename':
                const filenameA = (a.fileName || '').toLowerCase();
                const filenameB = (b.fileName || '').toLowerCase();
                return multiplier * filenameA.localeCompare(filenameB);

            case 'size':
                const sizeA = a.originalWidth * a.originalHeight;
                const sizeB = b.originalWidth * b.originalHeight;
                return multiplier * (sizeA - sizeB);

            default:
                return 0;
        }
    });

    return sortedImages;
}; 