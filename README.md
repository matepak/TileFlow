# TileFlow

TileFlow is an advanced image gallery application that provides powerful layout customization, image organization, and export capabilities.


## Features

- **Row-Based Layout Engine**: Create beautiful image grids with customizable row heights and spacing
- **Smart Layout Options**: Automatic layout calculation with options for last row behavior
- **Image Management**: Easily upload, arrange, and remove images
- **Custom Labels**: Add and edit labels for each image with customizable styling
- **Flexible Sorting**: Sort images by label, filename, or image size
- **Advanced Export**: Save your entire gallery as a single high-quality image with adjustable DPI
- **Responsive Design**: Adapts to different screen sizes and devices

## Usage

### Layout Settings

Customize your gallery layout with these options:
- **Row Height**: Adjust the target height for image rows
- **Images Per Row**: Force a specific number of images in each row
- **Spacing Controls**: Set precise spacing between images and rows
- **Last Row Behavior**: Choose how the final row should be displayed (justified, left-aligned, or filled)
- **Upscaling Prevention**: Maintain image quality by preventing image upscaling

### Label Settings

Add context to your images with customizable labels:
- **Toggle Labels**: Show or hide image labels
- **Font Customization**: Adjust font size and color
- **Background Control**: Change label background color and opacity
- **Spacing Adjustment**: Fine-tune label padding

### Sorting Options

Organize your images with multiple sorting methods:
- **Label Name**: Alphabetical sorting by custom labels
- **File Name**: Sort by original filenames
- **Image Size**: Arrange by image dimensions
- **Sort Direction**: Toggle between ascending and descending order

### Export Capabilities

Share your gallery with flexible export options:
- **Resolution Control**: Adjust DPI settings for different use cases
- **Presets**: Quick settings for web, basic print, quality print, and professional printing
- **Configuration Save**: Save your layout settings for future use

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tileflow.git

# Navigate to the project directory
cd tileflow

# Install dependencies
npm install

# Start the development server
npm start
```

### Building for Production

```bash
# Create a production build
npm run build

# The build files will be in the 'build' directory
```

## Technical Details

TileFlow is built with modern web technologies:

- **React**: Frontend UI library
- **CSS**: Custom styling
- **Canvas API**: For high-quality image export

The layout engine uses advanced algorithms to calculate optimal image placement based on aspect ratios and target dimensions, ensuring visually pleasing results.

## Browser Compatibility

TileFlow works in all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All contributors who have helped shape TileFlow
- The React community for providing excellent tools and resources