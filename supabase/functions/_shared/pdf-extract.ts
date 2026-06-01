import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { LayoutMetadata, LayoutType } from "./resume-pre-analysis.ts";

function decoder() {
  return new TextDecoder();
}

type TextItemLike = {
  str?: string;
  transform?: number[];
  width?: number;
};

type PositionedTextItem = {
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
};

export type ResumeTextExtraction = {
  text: string;
  layoutMetadata: LayoutMetadata;
};

function createTextLayoutMetadata(text: string): LayoutMetadata {
  return {
    layoutType: "unknown",
    layoutWarnings: text.trim().length < 450
      ? ["Very little readable text was extracted, so ATS risk should be checked carefully."]
      : [],
    textItemCount: 0,
    lineCount: text.split(/\r?\n/).filter((line) => line.trim()).length
  };
}

function clusterPositions(values: number[], tolerance = 42) {
  const sorted = [...values].sort((a, b) => a - b);
  const clusters: Array<{ center: number; count: number }> = [];

  for (const value of sorted) {
    const cluster = clusters.find((item) => Math.abs(item.center - value) <= tolerance);

    if (cluster) {
      cluster.center = (cluster.center * cluster.count + value) / (cluster.count + 1);
      cluster.count += 1;
    } else {
      clusters.push({ center: value, count: 1 });
    }
  }

  return clusters;
}

function groupLineKeys(items: PositionedTextItem[]) {
  const keys = new Set<string>();

  for (const item of items) {
    keys.add(`${item.page}:${Math.round(item.y / 4) * 4}`);
  }

  return keys;
}

function detectPdfLayout(items: PositionedTextItem[], pageCount: number): LayoutMetadata {
  const warnings: string[] = [];
  const readableItems = items.filter((item) => item.text.trim().length > 0);
  const textItemCount = readableItems.length;
  const lineCount = groupLineKeys(readableItems).size;
  const totalWords = readableItems.reduce((sum, item) => sum + item.text.split(/\s+/).filter(Boolean).length, 0);
  const averageWordsPerItem = textItemCount ? totalWords / textItemCount : 0;
  const clusters = clusterPositions(readableItems.map((item) => item.x));
  const strongClusters = clusters.filter((cluster) => cluster.count / Math.max(textItemCount, 1) >= 0.16);
  const strongestClusters = [...strongClusters].sort((a, b) => b.count - a.count).slice(0, 2);
  const hasTwoStrongColumns =
    strongestClusters.length >= 2 &&
    Math.abs(strongestClusters[0].center - strongestClusters[1].center) >= 145;
  const fragmentationScore = lineCount ? textItemCount / lineCount : textItemCount;
  let backwardJumps = 0;

  for (let index = 1; index < readableItems.length; index += 1) {
    const previous = readableItems[index - 1];
    const current = readableItems[index];

    if (previous.page === current.page && current.y - previous.y > 28) {
      backwardJumps += 1;
    }
  }

  const suspiciousReadingOrder = textItemCount > 25 && backwardJumps / textItemCount > 0.16;
  let layoutType: LayoutType = "unknown";

  if (textItemCount < 18 || lineCount < 8) {
    warnings.push("Very little readable PDF text was detected; the resume may be image-based or hard for ATS systems to parse.");
  }

  if (hasTwoStrongColumns) {
    layoutType = "possible_two_column";
    warnings.push("The PDF appears to use two strong vertical text regions, which can create ATS reading-order risk.");
  } else if (strongClusters.length <= 2 && textItemCount >= 18) {
    layoutType = "single_column";
  }

  if (fragmentationScore > 5.8 || averageWordsPerItem < 1.7) {
    warnings.push("The PDF text is highly fragmented, which can make automated parsing less reliable.");
  }

  if (suspiciousReadingOrder) {
    warnings.push("The extracted text order jumps between regions, so recruiters or ATS tools may read content out of order.");
  }

  if (hasTwoStrongColumns && strongestClusters.some((cluster) => cluster.count / Math.max(textItemCount, 1) >= 0.28)) {
    warnings.push("A sidebar/contact-heavy layout may be present; keep critical contact details in plain text.");
  }

  return {
    layoutType,
    layoutWarnings: [...new Set(warnings)],
    pageCount,
    textItemCount,
    lineCount,
    averageWordsPerItem: Number(averageWordsPerItem.toFixed(2)),
    xClusterCount: strongClusters.length,
    fragmentationScore: Number(fragmentationScore.toFixed(2)),
    suspiciousReadingOrder
  };
}

async function extractPdfText(fileBytes: Uint8Array) {
  const loadingTask = pdfjs.getDocument({
    data: fileBytes,
    disableFontFace: true,
    isImageDecoderSupported: false,
    isOffscreenCanvasSupported: false,
    useSystemFonts: true
  });
  try {
    const document = await loadingTask.promise;
    const pages: string[] = [];
    const positionedItems: PositionedTextItem[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items
        .map((item) => {
          const textItem = item as TextItemLike;
          const text = textItem.str ?? "";
          const transform = textItem.transform ?? [];
          const x = typeof transform[4] === "number" ? transform[4] : 0;
          const y = typeof transform[5] === "number" ? transform[5] : 0;

          if (text.trim()) {
            positionedItems.push({
              page: pageNumber,
              text,
              x,
              y,
              width: textItem.width ?? 0
            });
          }

          return text;
        })
        .filter(Boolean);
      const pageText = pageItems
        .join(" ");
      pages.push(pageText);
    }

    const text = pages.join("\n").trim();

    return {
      text,
      layoutMetadata: detectPdfLayout(positionedItems, document.numPages)
    };
  } finally {
    await loadingTask.destroy();
  }
}

export async function extractTextFromBuffer(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  fileName: string
): Promise<ResumeTextExtraction> {
  const fileBytes = new Uint8Array(fileBuffer);

  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return extractPdfText(fileBytes);
  }

  const text = decoder().decode(fileBytes).trim();

  return {
    text,
    layoutMetadata: createTextLayoutMetadata(text)
  };
}
