import { loadImage } from '../imageUtils';

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