import React, { useState } from "react";
import UploadPage from "./pages/UploadPage.jsx";
import ViewerPage from "./pages/ViewerPage.jsx";

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUploaded = (fileInfo) => {
    setUploadedFile(fileInfo);
  };

  const handleBack = () => {
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {!uploadedFile ? (
        <UploadPage onFileUploaded={handleFileUploaded} />
      ) : (
        <ViewerPage file={uploadedFile} onBack={handleBack} />
      )}
    </div>
  );
}
