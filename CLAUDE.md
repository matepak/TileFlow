# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TileFlow is a React-based image gallery application with advanced tiling and layout capabilities. It provides an interactive, responsive image grid system with two layout modes (Row-based and Packery masonry), customizable labels, intelligent sorting, and high-quality canvas export.

**Live Demo**: https://tiling.webgrove.pl/

## Commands

```bash
npm start          # Start React dev server (port 3000)
npm run build      # Create optimized production build
npm test           # Run Jest test suite
node server.js     # Run Express server (serves landing + React app)
```

## Architecture

### Component Structure

- **ImageGallery.js** - Central state hub managing images, layout settings, and active tab
- **RowDisplay.js / PackeryDisplay.js** - Two layout rendering engines
- **MainControls.js** - Upload, config save/load, tab navigation
- **Settings Panels** - LabelSettingsPanel, SortingPanel, ExportPanel, RowLayoutSettingsPanel, PackeryLayoutSettingsPanel

### Custom Hooks (src/hooks/)

- **useRow** - Row-based justified layout calculation and state sync
- **usePackery** - Wraps Packery library with React lifecycle
- **useContainerWidth** - Responsive width tracking via ResizeObserver
- **useCleanupObjectUrls** - Cleanup blob URLs on unmount

### Utilities (src/utils/)

- **layoutCalculator.js** - Core aspect-ratio-based layout algorithm
- **sortUtils.js** - Sort by label/filename/size
- **imageUtils.js** - Image processing helpers
- **imageUploadHandler.js / imageProcessor.js** - File upload management
- **configUtils.js** - Save/load layout settings as JSON

### Data Flow

1. **Image Upload**: imageUploadHandler → imageProcessor → creates image objects with metadata (id, dimensions, aspect ratio)
2. **Layout Calculation**: layoutCalculator computes positions → useRow/usePackery hooks apply and re-render
3. **Export**: SaveGalleryImage.js renders gallery to canvas with DPI scaling

### Settings Structure (src/constants/defaultSettings.js)

Layout settings include: rowHeight, spacing, containerPadding, lastRowBehavior ('justify'|'left'|'fill'), preventUpscaling, backgroundColor, forceImagesPerRow, sorting options, label styling, and export DPI presets.

## Key Patterns

- Functional components with hooks
- `handle*` prefix for event handlers, `on*` for callbacks
- Refs used to prevent unnecessary re-renders in layout calculations
- Pure utility functions for testability
- Tests in `src/utils/__tests__/` using Testing Library

## Server Architecture

Express server (server.js) serves:
- Landing page at `/`
- React app at `/tile` with client-side routing support
- Static assets from `/tile/static`
