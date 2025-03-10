import { getFileNameWithoutExtension } from './fileUtils';

export const processImageFile = (file, nextId) => {
    return new Promise((resolve) => {
        // Only process image files
        if (!file.type.startsWith('image/')) {
            resolve({ rejected: file.name });
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const aspectRatio = img.width / img.height;
            resolve({
                image: {
                    id: nextId,
                    fileName: file.name,
                    label: getFileNameWithoutExtension(file.name),
                    src: objectUrl,
                    aspectRatio,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    displayWidth: 0,
                    displayHeight: 0
                }
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ rejected: file.name });
        };

        img.src = objectUrl;
    });
}; 