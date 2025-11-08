// src/app.jsx
import { useRef, useState } from "react";

import Header from "./components/header.jsx";
import PdfViewerComponent from "./components/pdf-viewer-component.jsx";
import "./app.css";

function App() {
	const [document, setDocument] = useState("document.pdf");
	const fileInputRef = useRef(null);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setDocument(objectUrl);
		}
	};

	const handleOpenDocument = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="App">
			<Header onOpenDocument={handleOpenDocument} />
			<input
				ref={fileInputRef}
				type="file"
				onChange={handleFileChange}
				accept="application/pdf"
				name="pdf"
			/>
			<div className="App-viewer">
				<PdfViewerComponent document={document} />
			</div>
		</div>
	);
}

export default App;
