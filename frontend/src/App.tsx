import { useState } from "react";
import UploadPage from "./pages/UploadPage";
import ViewerPage from "./pages/ViewerPage";

// Define the shape of file info based on expectations
export interface FileInfo {
    fileUrl: string;
    originalName: string;
    // add other fields if necessary
    [key: string]: any;
}

export default function App() {
    const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);

    const handleFileUploaded = (fileInfo: FileInfo) => {
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
