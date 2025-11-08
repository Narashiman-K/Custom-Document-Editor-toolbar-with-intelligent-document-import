/**
 * PDF Viewer Component
 *
 * A React component that integrates Nutrient Web SDK for PDF viewing and editing.
 * Features:
 * - Custom Document Editor toolbar with import functionality
 * - Automatic conversion of images (TIFF, PNG, JPEG) and DOCX to PDF
 * - Seamless document import and merging
 * - Signature decorator support
 */

import { useEffect, useRef } from "react";
import {
  createSignatureRenderer,
  initializeSignatureDecorator,
} from "../utils/signature-decorator";
import "/src/app.css";

// Configuration constants
const LOGGED_IN_USER = "Nutrient";
const IMPORT_BUTTON_ID = "custom-import-documents";
const SUPPORTED_FILE_TYPES = ".pdf,.docx,.tiff,.tif,.png,.jpg,.jpeg";
const CONVERTIBLE_EXTENSIONS = ["docx", "tiff", "tif", "png", "jpg", "jpeg"];
const BUTTON_RE_ENABLE_DELAY = 200;

export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  const loadingOverlayRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let instance = null;
    let cleanupSignatureDecorator;
    const { NutrientViewer } = window;

    /**
     * Shows or hides the loading overlay
     * @param {boolean} show - Whether to show the overlay
     * @param {string} message - Message to display
     */
    const toggleLoadingOverlay = (show, message = "Loading...") => {
      if (loadingOverlayRef.current) {
        if (show) {
          loadingOverlayRef.current.style.display = "flex";
          loadingOverlayRef.current.querySelector(".loading-message").textContent = message;
        } else {
          loadingOverlayRef.current.style.display = "none";
        }
      }
    };

    /**
     * Converts non-PDF files to PDF using Nutrient's headless mode
     * @param {File} file - The file to convert (DOCX, TIFF, PNG, JPEG)
     * @returns {Promise<File>} - Converted PDF file
     */
    const convertToPDF = async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const tempContainer = document.createElement("div");
      tempContainer.style.display = "none";
      document.body.appendChild(tempContainer);

      try {
        const headlessInstance = await NutrientViewer.load({
          headless: true,
          container: tempContainer,
          document: arrayBuffer,
          licenseKey: import.meta.env.VITE_lkey,
        });

        const pdfArrayBuffer = await headlessInstance.exportPDF();
        await NutrientViewer.unload(tempContainer);

        const pdfBlob = new Blob([pdfArrayBuffer], {
          type: "application/pdf",
        });
        return new File([pdfBlob], `converted-${file.name}.pdf`, {
          type: "application/pdf",
        });
      } finally {
        document.body.removeChild(tempContainer);
      }
    };

    /**
     * Updates the import button state (enabled/disabled)
     * @param {boolean} isDisabled - Whether the button should be disabled
     * @param {string} title - Button title text
     */
    const updateImportButtonState = (isDisabled, title) => {
      instance.setDocumentEditorToolbarItems((items) =>
        items.map((item) =>
          item.id === IMPORT_BUTTON_ID
            ? { ...item, disabled: isDisabled, title }
            : item,
        ),
      );
    };

    /**
     * Checks if file requires conversion to PDF
     * @param {string} filename - Name of the file
     * @returns {boolean} - True if conversion is needed
     */
    const requiresConversion = (filename) => {
      const extension = filename.split(".").pop().toLowerCase();
      return CONVERTIBLE_EXTENSIONS.includes(extension);
    };

    /**
     * Handles the document import process
     * @param {File} file - File to import
     */
    const handleDocumentImport = async (file) => {
      try {
        updateImportButtonState(true, "Converting & Importing...");

        const conversionNeeded = requiresConversion(file.name);
        toggleLoadingOverlay(
          true,
          conversionNeeded ? "Converting document to PDF..." : "Importing document..."
        );

        let documentToImport = file;
        if (conversionNeeded) {
          documentToImport = await convertToPDF(file);
        }

        const totalPages = instance.totalPageCount;

        await instance.applyOperations([
          {
            type: "importDocument",
            afterPageIndex: totalPages - 1,
            treatImportedDocumentAsOnePage: false,
            document: documentToImport,
          },
        ]);

        instance.setViewState((viewState) =>
          viewState.set(
            "interactionMode",
            NutrientViewer.InteractionMode.DOCUMENT_EDITOR,
          ),
        );

        toggleLoadingOverlay(false);

        setTimeout(() => {
          updateImportButtonState(false, "Import Documents");
        }, BUTTON_RE_ENABLE_DELAY);
      } catch {
        toggleLoadingOverlay(false);
        alert("Failed to import document. Please try again.");
        updateImportButtonState(false, "Import Documents");
      }
    };

    /**
     * Creates file input element and triggers file selection
     * @returns {HTMLInputElement} - File input element
     */
    const createFileInput = () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = SUPPORTED_FILE_TYPES;

      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          await handleDocumentImport(file);
        }
      };

      return fileInput;
    };

    /**
     * Creates custom Document Editor toolbar items
     * @returns {Array} - Toolbar items configuration
     */
    const createCustomDocumentEditorToolbarItems = () => {
      const filteredItems =
        NutrientViewer.defaultDocumentEditorToolbarItems.filter(
          (item) => item.type !== "import-document",
        );

      const customImportButton = {
        type: "custom",
        id: IMPORT_BUTTON_ID,
        title: "Import Documents",
        icon: `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' viewBox='0 0 20 20' style='color:%20var(--bui-color-icon-primary);'><path fill-rule='evenodd' d='M10%2020c5.523%200%2010-4.477%2010-10S15.523%200%2010%200%200%204.477%200%2010s4.477%2010%2010%2010m0-15.56L5.97%208.47a.75.75%200%201%200%201.06%201.06l2.22-2.22v7.19a.75.75%200%200%200%201.5%200V7.31l2.22%202.22a.75.75%200%200%200%201.06-1.06z'%20clip-rule='evenodd'></path></svg>`,
        onPress: () => createFileInput().click(),
      };

      const middleIndex = Math.floor(filteredItems.length / 2);
      return [
        ...filteredItems.slice(0, middleIndex),
        customImportButton,
        ...filteredItems.slice(middleIndex),
      ];
    };

    /**
     * Nutrient Viewer configuration
     */
    const config = {
      licenseKey: import.meta.env.VITE_lkey,
      container,
      document: props.document,
      enableRichText: () => true,
      enableHistory: true,
      enableClipboardActions: true,
      allowLinearizedLoading: true,
      toolbarItems: [
        ...NutrientViewer.defaultToolbarItems,
        { type: "undo" },
        { type: "redo" },
      ],
      documentEditorToolbarItems: createCustomDocumentEditorToolbarItems(),
      customRenderers: {
        Annotation: createSignatureRenderer(NutrientViewer, {
          loggedInUser: LOGGED_IN_USER,
        }),
      },
    };

    /**
     * Loads the Nutrient Viewer instance
     */
    const loadViewer = async () => {
      if (!container || !NutrientViewer) {
        return;
      }

      try {
        // Attempt to unload any existing instance
        try {
          await NutrientViewer.unload(container);
        } catch {
          // No existing instance to unload
        }

        instance = await NutrientViewer.load(config);

        cleanupSignatureDecorator = initializeSignatureDecorator(
          instance,
          NutrientViewer,
          {
            loggedInUser: LOGGED_IN_USER,
          },
        );
      } catch (error) {
        // Log error for debugging but don't show alert on initial load
        console.error("Error loading Nutrient Viewer:", error);
      }
    };

    loadViewer();

    /**
     * Cleanup function
     */
    return () => {
      if (cleanupSignatureDecorator) {
        cleanupSignatureDecorator();
      }
      if (container && NutrientViewer) {
        try {
          NutrientViewer.unload(container);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [props.document]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
      <div
        ref={loadingOverlayRef}
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 9999,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          className="loading-spinner"
          style={{
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTop: "4px solid #fff",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 1s linear infinite",
          }}
        />
        <div
          className="loading-message"
          style={{
            color: "white",
            marginTop: "20px",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          Loading...
        </div>
      </div>
    </>
  );
}
