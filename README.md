# Nutrient Web SDK - Document Editor with Custom Import

A React + Vite application demonstrating advanced document editing capabilities using Nutrient Web SDK. This project features a custom Document Editor toolbar with intelligent document import functionality that automatically converts images and DOCX files to PDF before merging them into the current document.

## Features

- **Custom Document Editor Toolbar**: Enhanced toolbar with a custom "Import Documents" button
- **Multi-Format Support**: Import PDF, DOCX, TIFF, PNG, and JPEG files
- **Automatic Conversion**: Seamlessly converts non-PDF files to PDF using Nutrient's headless mode
- **Document Merging**: Appends imported documents to the end of the current document
- **Loading Indicators**: Visual feedback during conversion and import operations

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Nutrient Web SDK License Key** (Contact [sales@nutrient.io](mailto:sales@nutrient.io) for a license)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Narashiman-K/Custom-Document-Editor-toolbar-with-intelligent-document-import.git
cd Custom-Document-Editor-toolbar-with-intelligent-document-import
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure License Key

Create a `.env` file in the root directory and add your Nutrient license key:

```env
VITE_lkey=YOUR_LICENSE_KEY_HERE
```

Replace `YOUR_LICENSE_KEY_HERE` with your actual Nutrient Web SDK license key or leave it empty for trial.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port).

### 5. Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` folder.

### 6. Preview Production Build

```bash
npm run preview
```

### Demo
https://github.com/user-attachments/assets/4fb31ec1-b4ea-493b-bb5a-0567bef13e66

## Folder Structure

```
nutrient-vite-cdn-general-document-editor-import-grantebvv-poc/
│
├── public/                          # Static assets
│   └── document.pdf                 # Default document loaded on startup
│
├── src/                             # Source files
│   ├── components/                  # React components
│   │   ├── header.jsx              # Application header component
│   │   └── pdf-viewer-component.jsx # Main PDF viewer with custom import
│   │
│   ├── utils/                       # Utility functions
│   │   └── signature-decorator.js  # Signature rendering utilities
│   │
│   ├── app.css                      # Global styles and animations
│   ├── app.jsx                      # Main application component
│   └── main.jsx                     # Application entry point
│
├── index.html                       # HTML template
├── vite.config.js                   # Vite configuration
├── package.json                     # Project dependencies
├── .env                             # Environment variables (create this)
└── README.md                        # Project documentation
```

## Implementation Logic

### Core Architecture

The application is built around a single main component (`PdfViewerComponent`) that integrates Nutrient Web SDK with custom functionality.

### Custom Document Import Workflow

1. **User Interaction**
   - User clicks the custom "Import Documents" button in the DocumentEditor toolbar
   - File picker opens, allowing selection of PDF, DOCX, TIFF, PNG, or JPEG files

2. **File Type Detection**
   - The system checks if the selected file requires conversion to PDF
   - Supported conversion formats: DOCX, TIFF, TIF, PNG, JPG, JPEG

3. **Conversion Process** (if needed)
   - Creates a temporary hidden container in the DOM
   - Loads the file in Nutrient's headless mode (no UI rendering)
   - Converts the file to PDF using `exportPDF()` API
   - Cleans up the temporary container
   - Loading overlay displays "Converting document to PDF..." message

4. **Document Import**
   - Uses `applyOperations` API with `importDocument` operation type
   - Appends the document pages at the end (`afterPageIndex: totalPages - 1`)
   - Maintains page structure (`treatImportedDocumentAsOnePage: false`)

5. **UI Updates**
   - Automatically switches to DocumentEditor interaction mode
   - Updates thumbnails and page indicators
   - Re-enables the import button
   - Hides the loading overlay

### Key Components

#### PDF Viewer Component ([src/components/pdf-viewer-component.jsx](src/components/pdf-viewer-component.jsx))

**Main Functions:**

- `toggleLoadingOverlay(show, message)`: Controls the visibility and message of the loading overlay
- `convertToPDF(file)`: Converts non-PDF files to PDF using Nutrient's headless mode
- `requiresConversion(filename)`: Determines if a file needs conversion based on its extension
- `handleDocumentImport(file)`: Orchestrates the entire import workflow
- `updateImportButtonState(isDisabled, title)`: Updates button state during operations
- `createFileInput()`: Creates and configures the file input element
- `createCustomDocumentEditorToolbarItems()`: Builds the custom toolbar with import button

**Nutrient Configuration:**

```javascript
{
  licenseKey: import.meta.env.VITE_lkey,
  container: containerRef.current,
  document: props.document,
  enableRichText: () => true,
  enableHistory: true,
  enableClipboardActions: true,
  documentEditorToolbarItems: customToolbarItems,
  customRenderers: { /* ... */ }
}
```

### Technical Highlights

**Headless Mode Conversion**
- Uses a temporary hidden DOM container for conversion operations
- Processes files entirely client-side without backend requirements
- Automatically cleans up resources after conversion

**Document Operations**
- Leverages Nutrient's `applyOperations` API for document manipulation
- Non-destructive merging preserves original document integrity
- Supports undo/redo for all operations

**User Experience**
- Animated loading spinner with contextual messages
- Button state management prevents duplicate operations
- Error handling with user-friendly alert messages

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format code using Biome |
| `npm run lint` | Lint code using Biome |
| `npm run check` | Run Biome checks and auto-fix issues |

## Technologies Used

- **React 19.1.0**: UI library
- **Vite 6.3.5**: Build tool and development server
- **Nutrient Web SDK**: PDF viewing and editing (loaded via CDN)
- **Biome**: Code formatting and linting

## Browser Support

This application supports modern browsers with ES6+ capabilities:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

**Issue**: "License key is invalid" error
**Solution**: Ensure your `.env` file contains a valid Nutrient Web SDK license key with the correct format: `VITE_lkey=YOUR_KEY`

**Issue**: Files not converting properly
**Solution**: Verify that the Nutrient CDN is loading correctly. Check browser console for errors. Ensure headless mode is supported for your license tier.

**Issue**: Import button not appearing
**Solution**: Confirm you're in DocumentEditor mode. The custom import button only appears in the DocumentEditor toolbar, not the main viewer toolbar.

## Author

**[Narashiman K](https://www.linkedin.com/in/narashimank/)**

## License

This project uses Nutrient Web SDK which requires a commercial license.

For licensing inquiries, please contact: **[sales@nutrient.io](mailto:sales@nutrient.io)**

---

**Note**: This is a demonstration project. For production use, ensure proper error handling, security measures, and compliance with Nutrient's licensing terms.
