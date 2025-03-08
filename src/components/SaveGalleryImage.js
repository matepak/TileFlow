import React from 'react';
import { loadImage, hexToRgba, applyDpiToCanvas } from '../utils/imageUtils';

// Main function to save gallery as image
export const saveGalleryAsImage = async (
    galleryRef,
    images,
    layoutSettings,
    setIsSaving,
    dpi = 96 // Default DPI (standard screen resolution)
) => {
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

        // Apply DPI scaling to the canvas
        const { originalWidth, originalHeight } = applyDpiToCanvas(canvas, ctx, dpi);

        // Fill background
        ctx.fillStyle = layoutSettings.backgroundColor;
        ctx.fillRect(0, 0, originalWidth, originalHeight);

        // Draw each image on the canvas
        let yOffset = 0;

        // Process each row
        for (let rowIndex = 0; rowIndex < Object.keys(imagesByRow).length; rowIndex++) {
            const rowImages = imagesByRow[rowIndex] || [];
            let xOffset = 0;

            // Draw each image in the row
            for (let imgIndex = 0; imgIndex < rowImages.length; imgIndex++) {
                const img = rowImages[imgIndex];

                try {
                    // Use the gallery element's images directly instead of loading from blob URLs
                    const imgElement = document.querySelector(`img[src="${img.src}"]`);

                    if (imgElement) {
                        // Use existing image element
                        ctx.drawImage(
                            imgElement,
                            xOffset,
                            yOffset,
                            img.displayWidth,
                            img.displayHeight
                        );
                    } else {
                        // Fallback to loading the image
                        const loadedImg = await loadImage(img.src);
                        ctx.drawImage(
                            loadedImg,
                            xOffset,
                            yOffset,
                            img.displayWidth,
                            img.displayHeight
                        );
                    }

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
                } catch (imgError) {
                    console.error(`Error drawing image at row ${rowIndex}, index ${imgIndex}:`, imgError);
                    // Draw a placeholder for the failed image
                    ctx.fillStyle = "#f0f0f0";
                    ctx.fillRect(xOffset, yOffset, img.displayWidth, img.displayHeight);
                    ctx.strokeStyle = "#cccccc";
                    ctx.strokeRect(xOffset, yOffset, img.displayWidth, img.displayHeight);

                    // Draw error text
                    ctx.fillStyle = "#ff0000";
                    ctx.font = "14px Arial, sans-serif";
                    ctx.fillText("Image failed to load", xOffset + 10, yOffset + (img.displayHeight / 2));
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

// Component that provides a button to save the gallery
const SaveGalleryImage = ({
    galleryRef,
    images,
    layoutSettings,
    isSaving,
    setIsSaving,
    dpi = 96 // Default DPI (standard screen resolution)
}) => {
    const handleSave = () => {
        saveGalleryAsImage(galleryRef, images, layoutSettings, setIsSaving, dpi);
    };

    return (
        <button
            onClick={handleSave}
            disabled={isSaving || images.length === 0}
            title={`Save with ${dpi} DPI resolution`}
        >
            {isSaving ? 'Saving...' : 'Save as Image'}
        </button>
    );
};

export default SaveGalleryImage; 