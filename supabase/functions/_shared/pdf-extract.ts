import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

function decoder() {
  return new TextDecoder();
}

async function extractPdfText(fileBytes: Uint8Array) {
  const loadingTask = pdfjs.getDocument({
    data: fileBytes,
    disableFontFace: true,
    disableWorker: true,
    useSystemFonts: true
  });
  try {
    const document = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pages.push(pageText);
    }

    return pages.join("\n").trim();
  } finally {
    await loadingTask.destroy();
  }
}

export async function extractTextFromBuffer(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  fileName: string
) {
  const fileBytes = new Uint8Array(fileBuffer);

  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return extractPdfText(fileBytes);
  }

  return decoder().decode(fileBytes).trim();
}
