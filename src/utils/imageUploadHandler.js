import { getFileNameWithoutExtension } from './fileUtils';

export const handleImageUpload = async (files, currentImages, setImages, setIsLoading, fileInputRef) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newImages = [];
    const rejectedFiles = []; // Track rejected files
    const existingIds = currentImages.map(img => img.id);
    let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    // Process each file to get dimensions and create object URLs
    const processPromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
            // Only process image files
            if (!file.type.startsWith('image/')) {
                rejectedFiles.push(file.name); // Add to rejected files
                resolve(null);
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const img = new Image();

            img.onload = () => {
                const aspectRatio = img.width / img.height;
                newImages.push({
                    id: nextId++,
                    fileName: file.name,
                    label: getFileNameWithoutExtension(file.name),
                    src: objectUrl,
                    aspectRatio,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    displayWidth: 0,
                    displayHeight: 0
                });
                resolve();
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve();
            };

            img.src = objectUrl;
        });
    });

    // Wait for all images to be processed
    await Promise.all(processPromises);

    // Add new images to the layout
    const updatedImages = [...currentImages, ...newImages];
    setImages(updatedImages);
    setIsLoading(false);

    // Display message about rejected files if any
    if (rejectedFiles.length > 0) {
        const rejectedMessage = rejectedFiles.length === 1
            ? `File "${rejectedFiles[0]}" was not an image and was skipped.`
            : `${rejectedFiles.length} files were not images and were skipped: ${rejectedFiles.slice(0, 3).join(", ")}${rejectedFiles.length > 3 ? ` and ${rejectedFiles.length - 3} more` : ""}.`;

        alert(rejectedMessage);
    }

    // Reset file input
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
}; 