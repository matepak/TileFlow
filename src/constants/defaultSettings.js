// Default settings for the image gallery layout
export const defaultLayoutSettings = {
    rowHeight: 200,
    rowSpacing: 4,
    imageSpacing: 4,
    containerPadding: 12,
    lastRowBehavior: 'justify', // 'justify', 'left', 'fill'
    preventUpscaling: true,
    backgroundColor: '#ffffff',
    forceImagesPerRow: {
        enabled: false,
        count: 3
    },
    sorting: {
        type: 'label', // 'label', 'filename', 'size', 'none'
        direction: 'asc' // 'asc', 'desc'
    },
    labels: {
        enabled: true,
        fontSize: 12,
        fontColor: '#ffffff',
        backgroundColor: '#000000',
        backgroundOpacity: 0.7,
        padding: 6
    },
    export: {
        dpi: 96
    }
}; 