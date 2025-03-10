/**
 * Extracts the filename without its extension
 * @param {string} fileName - The full filename including extension
 * @returns {string} The filename without extension
 */
export const getFileNameWithoutExtension = (fileName) => {
    if (!fileName) return '';
    return fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
}; 