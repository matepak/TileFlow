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
    // if (!images || images.length === 0) {
    //     console.warn('No images to save in configuration');
    //     return;
    // }

    try {
        // Create a configuration object
        const configuration = {
            settings: layoutSettings,
            timestamp: new Date().toISOString(),
            //imageCount: images.length,
            // Include the actual images data in the configuration
            // images: images.map(img => ({
            //     id: img.id,
            //     src: img.src,
            //     width: img.width,
            //     height: img.height,
            //     // Include any other properties needed for reconstruction
            //     // but avoid including large data like the actual image data if possible
            //     title: img.title,
            //     description: img.description,
            //     // Add any other metadata needed
            // }))
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
 * Opens a file dialog, loads a configuration file, and applies the settings
 * @param {Function} applyCallback - Callback to apply the loaded settings
 * @returns {Promise<Object>} The parsed configuration
 */
export const loadLayoutConfiguration = async (applyCallback) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            // Handle file selection
            fileInput.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) {
                    document.body.removeChild(fileInput);
                    return reject(new Error('No file selected'));
                }

                const reader = new FileReader();

                reader.onload = (event) => {
                    try {
                        const configuration = JSON.parse(event.target.result);
                        document.body.removeChild(fileInput);

                        // Validate configuration
                        if (!configuration.settings) {
                            throw new Error('Invalid configuration: missing settings');
                        }

                        // Ensure images array exists
                        // if (!configuration.images || !Array.isArray(configuration.images)) {
                        //     configuration.images = [];
                        //     console.warn('Configuration loaded without images array');
                        // }

                        // Apply the configuration if a callback was provided
                        if (typeof applyCallback === 'function') {
                            applyCallback(configuration);
                        }

                        // Return the loaded configuration
                        resolve(configuration);
                    } catch (error) {
                        document.body.removeChild(fileInput);
                        reject(new Error(`Invalid configuration file format: ${error.message}`));
                    }
                };

                reader.onerror = () => {
                    document.body.removeChild(fileInput);
                    reject(new Error('Failed to read configuration file'));
                };

                reader.readAsText(file);
            };

            // Open the file dialog
            fileInput.click();

        } catch (error) {
            reject(new Error(`Failed to open file dialog: ${error.message}`));
        }
    });
}; 