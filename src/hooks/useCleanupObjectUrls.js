import { useEffect } from 'react';

/**
 * Custom hook to cleanup object URLs when component unmounts
 * @param {Array} images - Array of image objects containing src URLs
 */
// eslint-disable-next-line react-hooks/exhaustive-deps
const useCleanupObjectUrls = (images) => {
    useEffect(() => {
        return () => {
            images.forEach(image => {
                if (image.src) {
                    URL.revokeObjectURL(image.src);
                }
            });
        };
    }, []); // Empty dependency array intentionally to only cleanup on unmount

};

export default useCleanupObjectUrls; 