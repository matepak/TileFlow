import { processImageFile } from './imageProcessor';

export const handleImageUpload = async (files, currentImages, setImages, setIsLoading, fileInputRef) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newImages = [];
    const rejectedFiles = [];
    const existingIds = currentImages.map(img => img.id);
    let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    // Process each file to get dimensions and create object URLs
    const processPromises = Array.from(files).map(file =>
        processImageFile(file, nextId++)
    );

    // Wait for all images to be processed
    const results = await Promise.all(processPromises);

    // Separate successful uploads from rejected files
    results.forEach(result => {
        if (result.image) {
            newImages.push(result.image);
        } else if (result.rejected) {
            rejectedFiles.push(result.rejected);
        }
    });

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