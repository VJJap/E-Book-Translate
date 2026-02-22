import React, { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFViewer({ file, onTextSelected }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRendering, setIsRendering] = useState(false);

  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    loadPDF();
  }, [file]);

  const loadPDF = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let pdfSource;
      if (file.localFile) {
        const arrayBuffer = await file.localFile.arrayBuffer();
        pdfSource = { data: arrayBuffer };
      } else {
        pdfSource = { url: file.url };
      }

      const doc = await pdfjsLib.getDocument(pdfSource).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
    } catch (err) {
      setError("ไม่สามารถโหลด PDF ได้ กรุณาลองใหม่อีกครั้ง");
      console.error("PDF load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    setIsRendering(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = "";
        textLayerRef.current.style.width = `${viewport.width}px`;
        textLayerRef.current.style.height = `${viewport.height}px`;

        const textContent = await page.getTextContent();
        const textItems = textContent.items;

        textItems.forEach((item) => {
          if (!item.str || item.str.trim() === "") return;

          const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
          const span = document.createElement("span");

          const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
          const angle = Math.atan2(tx[1], tx[0]);

          span.textContent = item.str;
          span.style.left = `${tx[4]}px`;
          span.style.top = `${tx[5] - fontHeight}px`;
          span.style.fontSize = `${fontHeight}px`;
          span.style.fontFamily = item.fontName || "sans-serif";
          span.style.transform = angle !== 0 ? `rotate(${angle}rad)` : "";

          textLayerRef.current.appendChild(span);
        });
      }
    } catch (err) {
      if (err.name !== "RenderingCancelledException") {
        console.error("Render error:", err);
      }
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 1) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = textLayerRef.current?.closest(".pdf-canvas-wrapper")?.getBoundingClientRect();

    if (!containerRect) return;

    const position = {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top,
      screenX: rect.left + rect.width / 2,
      screenY: rect.top,
    };

    onTextSelected(selectedText, position);
    selection.removeAllRanges();
  }, [onTextSelected]);

  const handleDoubleClick = useCallback((e) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = textLayerRef.current?.closest(".pdf-canvas-wrapper")?.getBoundingClientRect();

    if (!containerRect) return;

    const position = {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top,
      screenX: rect.left + rect.width / 2,
      screenY: rect.top,
    };

    onTextSelected(selectedText, position);
    selection.removeAllRanges();
  }, [onTextSelected]);

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <Loader2 size={48} className="text-indigo-400 animate-spin" />
        <p className="text-slate-400">กำลังโหลด PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-3 bg-slate-800/90 backdrop-blur border-b border-slate-700 w-full justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-slate-300 text-sm min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-600" />

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.6}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-slate-300 text-sm min-w-[48px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {isRendering && (
          <Loader2 size={16} className="text-indigo-400 animate-spin ml-2" />
        )}
      </div>

      <div className="py-8 px-4">
        <div
          className="pdf-canvas-wrapper relative select-text"
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <canvas ref={canvasRef} className="rounded-lg" />
          <div ref={textLayerRef} className="text-layer" />
        </div>
      </div>
    </div>
  );
}
