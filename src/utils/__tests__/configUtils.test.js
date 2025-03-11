// configUtils.test.js
import { saveLayoutConfiguration, loadLayoutConfiguration } from '../configUtils';
import { defaultLayoutSettings } from '../../constants/defaultSettings';

describe('configUtils', () => {
    beforeEach(function () {
        // Create mock elements directly on this context
        this.mockElements = {};

        // Mock for <a> element (download link)
        this.mockElements.a = {
            href: '',
            download: '',
            click: jest.fn(),
            style: {},
        };

        // Mock for <input> element (file input)
        this.mockElements.input = {
            type: '',
            accept: '',
            click: jest.fn(),
            style: {},
            onchange: null,
            files: [],
        };

        // Mock document methods
        document.createElement = jest.fn(type => {
            return this.mockElements[type] || {};
        });

        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();

        // Mock URL methods
        global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
        global.URL.revokeObjectURL = jest.fn();

        // Mock alert
        window.alert = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('saveLayoutConfiguration should create a download link and trigger a download', function () {
        const images = [{ id: 1, src: 'image1.jpg' }, { id: 2, src: 'image2.jpg' }];
        saveLayoutConfiguration(defaultLayoutSettings, images);

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(global.URL.createObjectURL).toHaveBeenCalled();

        const mockLink = this.mockElements.a;
        expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
        expect(mockLink.click).toHaveBeenCalled();
        expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);

        expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('loadLayoutConfiguration should open a file dialog and read a file', async function () {
        const mockConfiguration = {
            settings: defaultLayoutSettings,
            timestamp: '2023-01-01T00:00:00.000Z'
        };

        const mockFileContent = JSON.stringify(mockConfiguration);
        const applyCallback = jest.fn();

        const mockFileReader = {
            readAsText: jest.fn(),
            onload: null,
        };
        global.FileReader = jest.fn(() => mockFileReader);

        const promise = loadLayoutConfiguration(applyCallback);

        const mockFileInput = this.mockElements.input;
        expect(document.createElement).toHaveBeenCalledWith('input');
        expect(mockFileInput.click).toHaveBeenCalled();

        const mockFile = new Blob([mockFileContent], { type: 'application/json' });
        mockFileInput.files = [mockFile];
        mockFileInput.onchange({ target: mockFileInput });

        mockFileReader.onload({ target: { result: mockFileContent } });

        const result = await promise;

        expect(applyCallback).toHaveBeenCalledWith(mockConfiguration);
        expect(result).toEqual(mockConfiguration);
    });

    test('loadLayoutConfiguration should reject if no file is selected', async function () {
        const applyCallback = jest.fn();

        const promise = loadLayoutConfiguration(applyCallback);

        const mockFileInput = this.mockElements.input;
        mockFileInput.files = [];
        mockFileInput.onchange({ target: mockFileInput });

        await expect(promise).rejects.toThrow('No file selected');
        expect(applyCallback).not.toHaveBeenCalled();
    });

    test('loadLayoutConfiguration should reject if file has invalid format', async function () {
        const mockFileContent = '{ invalid: json }';
        const applyCallback = jest.fn();

        const mockFileReader = {
            readAsText: jest.fn(),
            onload: null,
        };
        global.FileReader = jest.fn(() => mockFileReader);

        const promise = loadLayoutConfiguration(applyCallback);

        const mockFileInput = this.mockElements.input;
        const mockFile = new Blob([mockFileContent], { type: 'application/json' });
        mockFileInput.files = [mockFile];
        mockFileInput.onchange({ target: mockFileInput });

        mockFileReader.onload({ target: { result: mockFileContent } });

        await expect(promise).rejects.toThrow(/Invalid configuration file format/);
        expect(applyCallback).not.toHaveBeenCalled();
    });
});