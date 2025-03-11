/**
 * Utility functions for handling gallery configuration
 */

/**
 * Saves the current layout configuration as a JSON file
 * @param {Object} layoutSettings - The current layout settings
 * @param {Array} images - The current images array
 * @returns {Promise<void>}
 */
export const saveLayoutConfiguration = (layoutSettings, images) => {
    if (images.length === 0) return;

    try {
        // Create a configuration object
        const configuration = {
            settings: layoutSettings,
            timestamp: new Date().toISOString(),
            imageCount: images.length
        };

        // Convert to JSON
        const configJson = JSON.stringify(configuration, null, 2);

        // Create a blob
        const blob = new Blob([configJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `gallery-config-${Date.now()}.json`;

        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Clean up
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error saving configuration:', error);
        alert('There was an error saving the configuration. Please try again.');
    }
};

/**
 * Loads a configuration from a JSON file
 * @param {File} file - The configuration file
 * @returns {Promise<Object>} The parsed configuration
 */
export const loadLayoutConfiguration = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const configuration = JSON.parse(event.target.result);
                resolve(configuration);
            } catch (error) {
                reject(new Error('Invalid configuration file format'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read configuration file'));
        };

        reader.readAsText(file);
    });
}; 