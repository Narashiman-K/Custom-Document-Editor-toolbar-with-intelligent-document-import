/**
 * Nutrient Web SDK Signature Decorator
 *
 * A reusable module for adding decorative curves and metadata to signatures
 * in Nutrient Web SDK (formerly PSPDFKit).
 *
 * @author Narashiman K
 * @version 1.0.0
 */

/**
 * Default configuration for signature decorations
 */
export const DEFAULT_CONFIG = {
  // Curve styling
  curve: {
    color: "#0078D4", // Blue
    strokeWidth: "1.5",
    topLengthRatio: 0.25, // Percentage of signature width
    topLengthMax: 50, // Maximum pixels
    bottomLengthRatio: 0.35,
    bottomLengthMax: 70,
  },

  // Text styling
  text: {
    color: "#008000", // Green
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      top: 9,
      bottom: 8,
    },
    gap: 3, // Gap between curve end and text start (px)
  },

  // Positioning
  position: {
    svgTopOffset: -25,
    svgLeftOffset: -5,
    topLabelOffset: -27,
    bottomLabelOffset: -24,
  },

  // Signature field detection
  signatureIdentifiers: {
    typeCode: "S",
    namePattern: "SIGNATURE",
  },

  // Default values
  defaults: {
    signerName: "Nutrient",
  },

  // Date/Time formatting
  dateTimeFormat: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  },
};

/**
 * Get current date and time formatted as string
 * @param {Object} formatOptions - Intl.DateTimeFormat options
 * @returns {string} Formatted date/time string
 */
export const getCurrentDateTime = (
  formatOptions = DEFAULT_CONFIG.dateTimeFormat,
) => {
  return new Date().toLocaleString("en-US", formatOptions);
};

/**
 * Check if a form field is a signature field
 * @param {Object} formField - Nutrient form field object
 * @param {Object} config - Configuration object
 * @returns {boolean}
 */
export const isSignatureField = (formField, config = DEFAULT_CONFIG) => {
  if (!formField) return false;

  const typeName = formField.constructor?.name || "";
  const fieldName = formField.name || "";

  return (
    typeName.includes("Signature") ||
    typeName === config.signatureIdentifiers.typeCode ||
    fieldName.includes(config.signatureIdentifiers.namePattern)
  );
};

/**
 * Check if two bounding boxes overlap
 * @param {Object} bbox1 - First bounding box
 * @param {Object} bbox2 - Second bounding box
 * @returns {boolean}
 */
export const checkBoundingBoxOverlap = (bbox1, bbox2) => {
  return !(
    bbox1.left > bbox2.left + bbox2.width ||
    bbox1.left + bbox1.width < bbox2.left ||
    bbox1.top > bbox2.top + bbox2.height ||
    bbox1.top + bbox1.height < bbox2.top
  );
};

/**
 * Check if error is a form field not found error
 * @param {Error|Array<Error>} error - Error object or array of errors
 * @returns {boolean}
 */
export const isFormFieldNotFoundError = (error) => {
  const errors = Array.isArray(error) ? error : [error];
  return errors.some((err) => {
    const errorMsg = err?.message || "";
    return (
      errorMsg.includes("no form field") ||
      errorMsg.includes("There is no form field")
    );
  });
};

/**
 * Create an SVG path element
 * @returns {SVGPathElement}
 */
const createSVGPath = () => {
  return document.createElementNS("http://www.w3.org/2000/svg", "path");
};

/**
 * Create top curve SVG path
 * @param {number} width - Signature width
 * @param {Object} config - Configuration object
 * @returns {Object} Object with path element and length
 */
export const createTopCurve = (width, config = DEFAULT_CONFIG) => {
  const path = createSVGPath();
  const curveLength = Math.min(
    width * config.curve.topLengthRatio,
    config.curve.topLengthMax,
  );

  path.setAttribute("d", `M 0,25 L 0,15 C 0,10 2,8 7,8 L ${curveLength},8`);
  path.setAttribute("stroke", config.curve.color);
  path.setAttribute("stroke-width", config.curve.strokeWidth);
  path.setAttribute("fill", "none");

  return { path, length: curveLength };
};

/**
 * Create bottom curve SVG path
 * @param {number} height - Signature height
 * @param {number} width - Signature width
 * @param {Object} config - Configuration object
 * @returns {Object} Object with path element and length
 */
export const createBottomCurve = (height, width, config = DEFAULT_CONFIG) => {
  const path = createSVGPath();
  const bottomY = height + 25;
  const curveLength = Math.min(
    width * config.curve.bottomLengthRatio,
    config.curve.bottomLengthMax,
  );

  path.setAttribute(
    "d",
    `M 0,${bottomY} L 0,${bottomY + 8} C 0,${bottomY + 13} 2,${bottomY + 15} 7,${bottomY + 15} L ${curveLength},${bottomY + 15}`,
  );
  path.setAttribute("stroke", config.curve.color);
  path.setAttribute("stroke-width", config.curve.strokeWidth);
  path.setAttribute("fill", "none");

  return { path, length: curveLength };
};

/**
 * Create a label element
 * @param {string} text - Label text
 * @param {string} styles - CSS styles string
 * @returns {HTMLDivElement}
 */
const createLabel = (text, styles) => {
  const label = document.createElement("div");
  label.style.cssText = styles;
  label.textContent = text;
  return label;
};

/**
 * Create top label (signer name)
 * @param {string} signerName - Name of the signer
 * @param {number} curveLength - Length of the curve
 * @param {Object} config - Configuration object
 * @returns {HTMLDivElement}
 */
export const createTopLabel = (
  signerName,
  curveLength,
  config = DEFAULT_CONFIG,
) => {
  const styles = `
    position: absolute;
    top: ${config.position.topLabelOffset}px;
    left: ${curveLength + config.text.gap}px;
    font-size: ${config.text.fontSize.top}px;
    color: ${config.text.color};
    white-space: nowrap;
    font-weight: 400;
  `;
  return createLabel(`By ${signerName}`, styles);
};

/**
 * Create bottom label (date/time)
 * @param {number} curveLength - Length of the curve
 * @param {number} width - Signature width
 * @param {Object} config - Configuration object
 * @returns {HTMLDivElement}
 */
export const createBottomLabel = (
  curveLength,
  width,
  config = DEFAULT_CONFIG,
) => {
  const formattedDateTime = getCurrentDateTime(config.dateTimeFormat);
  const styles = `
    position: absolute;
    bottom: ${config.position.bottomLabelOffset}px;
    left: ${curveLength + config.text.gap}px;
    font-size: ${config.text.fontSize.bottom}px;
    color: ${config.text.color};
    white-space: nowrap;
    font-weight: 400;
  `;
  return createLabel(formattedDateTime, styles);
};

/**
 * Create signature decoration renderer
 *
 * @param {Object} NutrientViewer - Nutrient Web SDK instance
 * @param {Object} options - Configuration options
 * @param {string} options.loggedInUser - Current logged-in user name
 * @param {Object} options.config - Custom configuration (merged with defaults)
 * @returns {Function} Custom annotation renderer function
 */
export const createSignatureRenderer = (NutrientViewer, options = {}) => {
  const { loggedInUser = null, config: customConfig = {} } = options;

  // Merge custom config with defaults
  const config = {
    ...DEFAULT_CONFIG,
    ...customConfig,
    curve: { ...DEFAULT_CONFIG.curve, ...customConfig.curve },
    text: {
      ...DEFAULT_CONFIG.text,
      ...customConfig.text,
      fontSize: {
        ...DEFAULT_CONFIG.text.fontSize,
        ...customConfig.text?.fontSize,
      },
    },
    position: { ...DEFAULT_CONFIG.position, ...customConfig.position },
    signatureIdentifiers: {
      ...DEFAULT_CONFIG.signatureIdentifiers,
      ...customConfig.signatureIdentifiers,
    },
    defaults: { ...DEFAULT_CONFIG.defaults, ...customConfig.defaults },
  };

  return ({ annotation }) => {
    const isInkAnnotation =
      annotation instanceof NutrientViewer.Annotations.InkAnnotation;
    const isImageAnnotation =
      annotation instanceof NutrientViewer.Annotations.ImageAnnotation;

    const customData =
      annotation.customData?.toJS?.() || annotation.customData || {};
    const isSignature = customData.isSignature || annotation.isSignature;

    if (!isInkAnnotation && !isImageAnnotation && !isSignature) {
      return null;
    }

    const signerName =
      customData.signerName || loggedInUser || config.defaults.signerName;
    const bbox = annotation.boundingBox;
    const width = bbox.width;
    const height = bbox.height;

    // Create wrapper container
    const wrapper = document.createElement("div");
    wrapper.className = "signature-metadata-wrapper";
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      font-family: ${config.text.fontFamily};
      background-color: transparent;
    `;

    // Create SVG container
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const svgWidth = Math.max(width * 0.4, 80);
    const svgHeight = height + 50;
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    svg.style.cssText = `
      position: absolute;
      top: ${config.position.svgTopOffset}px;
      left: ${config.position.svgLeftOffset}px;
      overflow: visible;
    `;

    // Create and add curves
    const { path: topPath, length: topLength } = createTopCurve(width, config);
    const { path: bottomPath, length: bottomLength } = createBottomCurve(
      height,
      width,
      config,
    );
    svg.appendChild(topPath);
    svg.appendChild(bottomPath);
    wrapper.appendChild(svg);

    // Create and add labels
    const topLabel = createTopLabel(signerName, topLength, config);
    const bottomLabel = createBottomLabel(bottomLength, width, config);
    wrapper.appendChild(topLabel);
    wrapper.appendChild(bottomLabel);

    return {
      node: wrapper,
      append: true,
      noZoom: false,
    };
  };
};

/**
 * Handle signature creation and widget deletion
 *
 * @param {Object} annotation - The signature annotation
 * @param {Object} instance - Nutrient Web SDK instance
 * @param {Object} NutrientViewer - Nutrient Web SDK class
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export const handleSignatureCreation = async (
  annotation,
  instance,
  NutrientViewer,
  config = DEFAULT_CONFIG,
) => {
  console.log("Signature detected:", annotation.constructor.name);

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const allAnnotations = await instance.getAnnotations(annotation.pageIndex);
    const formFields = await instance.getFormFields();
    const widgetAnnotations = allAnnotations.filter(
      (ann) => ann instanceof NutrientViewer.Annotations.WidgetAnnotation,
    );

    console.log(`Found ${widgetAnnotations.size} widget(s) on page`);

    let widgetToDelete = null;
    let formFieldToDelete = null;

    // Strategy 1: Match by formFieldName
    if (annotation.formFieldName) {
      widgetToDelete = widgetAnnotations.find(
        (widget) => widget.formFieldName === annotation.formFieldName,
      );
      formFieldToDelete = formFields.find(
        (ff) => ff.name === annotation.formFieldName,
      );

      if (widgetToDelete) {
        console.log("Strategy 1: Found widget by formFieldName");
      }
    }

    // Strategy 2: Find by bounding box overlap and signature field type
    if (!widgetToDelete) {
      const signatureBBox = annotation.boundingBox;

      for (const widget of widgetAnnotations) {
        const widgetBBox = widget.boundingBox;
        const overlaps = checkBoundingBoxOverlap(signatureBBox, widgetBBox);

        if (overlaps && widget.formFieldName) {
          const ff = formFields.find((f) => f.name === widget.formFieldName);

          if (isSignatureField(ff, config)) {
            widgetToDelete = widget;
            formFieldToDelete = ff;
            console.log(
              "Strategy 2: Found widget by overlap and signature field type",
            );
            break;
          }
        }
      }
    }

    // Delete widget annotation
    if (widgetToDelete) {
      await instance.delete(widgetToDelete);
      console.log("✓ Deleted widget annotation");
    } else {
      console.warn("Could not find widget annotation to delete");
    }

    // Delete form field (may already be deleted with widget)
    if (formFieldToDelete) {
      try {
        await instance.delete(formFieldToDelete);
        console.log("✓ Deleted form field");
      } catch (formFieldError) {
        if (isFormFieldNotFoundError(formFieldError)) {
          console.log("ℹ Form field already deleted (cleaned up with widget)");
        } else {
          throw formFieldError;
        }
      }
    }
  } catch (error) {
    if (isFormFieldNotFoundError(error)) {
      console.log("ℹ Form field already deleted (cleaned up with widget)");
    } else {
      console.error("Error deleting widget/form field:", error);
    }
  }
};

/**
 * Create annotation event handler
 *
 * @param {Object} instance - Nutrient Web SDK instance
 * @param {Object} NutrientViewer - Nutrient Web SDK class
 * @param {Object} config - Configuration object
 * @returns {Function} Event handler function
 */
export const createAnnotationHandler = (
  instance,
  NutrientViewer,
  config = DEFAULT_CONFIG,
) => {
  return async (annotations) => {
    for (const annotation of annotations) {
      const isInkAnnotation =
        annotation instanceof NutrientViewer.Annotations.InkAnnotation;
      const isImageAnnotation =
        annotation instanceof NutrientViewer.Annotations.ImageAnnotation;

      if (isInkAnnotation || isImageAnnotation) {
        await handleSignatureCreation(
          annotation,
          instance,
          NutrientViewer,
          config,
        );
      }
    }
  };
};

/**
 * Inject CSS styles to remove signature widget background
 */
export const injectSignatureStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .PSPDFKit-Ink-Signature,
    .PSPDFKit-Image-Annotation,
    [data-annotation-type="pspdfkit/ink"],
    [data-annotation-type="pspdfkit/image"] {
      background-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Initialize signature decorator for Nutrient Web SDK
 *
 * This is a convenience function that sets up everything needed for signature decoration.
 *
 * @param {Object} instance - Nutrient Web SDK instance
 * @param {Object} NutrientViewer - Nutrient Web SDK class
 * @param {Object} options - Configuration options
 * @param {string} options.loggedInUser - Current logged-in user name
 * @param {Object} options.config - Custom configuration
 * @returns {Function} Cleanup function to remove event listener
 *
 * @example
 * const cleanup = initializeSignatureDecorator(instance, NutrientViewer, {
 *   loggedInUser: "John Doe",
 *   config: {
 *     curve: { color: "#FF0000" },
 *     text: { color: "#0000FF" }
 *   }
 * });
 */
export const initializeSignatureDecorator = (
  instance,
  NutrientViewer,
  options = {},
) => {
  const config = { ...DEFAULT_CONFIG, ...options.config };

  // Inject styles
  injectSignatureStyles();

  // Create and register event handler
  const handler = createAnnotationHandler(instance, NutrientViewer, config);
  instance.addEventListener("annotations.create", handler);

  // Return cleanup function
  return () => {
    instance.removeEventListener("annotations.create", handler);
  };
};

export default {
  DEFAULT_CONFIG,
  createSignatureRenderer,
  handleSignatureCreation,
  createAnnotationHandler,
  initializeSignatureDecorator,
  injectSignatureStyles,
  // Utility functions
  getCurrentDateTime,
  isSignatureField,
  checkBoundingBoxOverlap,
  isFormFieldNotFoundError,
  createTopCurve,
  createBottomCurve,
  createTopLabel,
  createBottomLabel,
};
