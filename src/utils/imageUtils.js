/**
 * Utility functions for image manipulation
 */

/**
 * Loads an image from a source URL and returns a Promise
 * @param {string} src - The source URL of the image
 * @returns {Promise<HTMLImageElement>} A promise that resolves with the loaded image
 */
export const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * Converts a hex color code to RGBA format
 * @param {string} hex - The hex color code (e.g., #RRGGBB)
 * @param {number} opacity - The opacity value (0-1)
 * @returns {string} The RGBA color string
 */
export const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Applies DPI scaling to canvas dimensions
 * @param {HTMLCanvasElement} canvas - The canvas element to scale
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
 * @param {number} dpi - The desired DPI value (default: 96, which is standard screen DPI)
 * @returns {Object} Object containing the scale factor and original dimensions
 */
export const applyDpiToCanvas = (canvas, ctx, dpi = 96) => {
    // Store original dimensions
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // Calculate the scale factor (1 = 96dpi, 2 = 192dpi, etc.)
    const scaleFactor = dpi / 96;

    // Set canvas dimensions to match desired DPI (makes it bigger)
    canvas.width = originalWidth * scaleFactor;
    canvas.height = originalHeight * scaleFactor;

    // Scale the context to draw at the higher resolution
    ctx.scale(scaleFactor, scaleFactor);

    return {
        scaleFactor,
        originalWidth,
        originalHeight
    };
}; 