import { loadImage } from '../imageUtils';
import { hexToRgba } from '../imageUtils';

describe('loadImage', () => {
    let originalImage;

    beforeAll(() => {
        // Store the original Image constructor
        originalImage = global.Image;
    });

    afterAll(() => {
        // Restore the original Image constructor
        global.Image = originalImage;
    });

    it('should load an image successfully', () => {
        // Create a mock image
        const mockImage = {};
        global.Image = jest.fn(() => mockImage);

        // Call loadImage
        const imagePromise = loadImage('test.jpg');

        // Simulate successful load
        mockImage.onload();

        // Verify the promise resolves with the image
        return expect(imagePromise).resolves.toBe(mockImage);
    });

    it('should reject when image fails to load', () => {
        // Create a mock image
        const mockImage = {};
        global.Image = jest.fn(() => mockImage);

        // Call loadImage
        const imagePromise = loadImage('test.jpg');

        // Trigger the error with an actual Error object
        mockImage.onerror(new Error('Failed to load image'));

        // Test that the promise rejects with any value
        return expect(imagePromise).rejects.toBeTruthy();
    });
});

describe('hexToRgba', () => {
    it('should convert black hex to rgba', () => {
        const result = hexToRgba('#000000', 1);
        expect(result).toBe('rgba(0, 0, 0, 1)');
    });

    it('should convert white hex to rgba', () => {
        const result = hexToRgba('#FFFFFF', 1);
        expect(result).toBe('rgba(255, 255, 255, 1)');
    });

    it('should handle different opacity values', () => {
        const result = hexToRgba('#FF0000', 0.5);
        expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should convert mixed color hex to rgba', () => {
        const result = hexToRgba('#1A2B3C', 0.8);
        expect(result).toBe('rgba(26, 43, 60, 0.8)');
    });

    it('should handle lowercase hex values', () => {
        const result = hexToRgba('#ff00ff', 1);
        expect(result).toBe('rgba(255, 0, 255, 1)');
    });
}); 