import * as pdfjsLib from 'pdfjs-dist';

// Configura o worker via URL relativa ao bundle — evita dependência de CDN externo
// O pdfjs-dist v5+ inclui o worker no próprio pacote npm
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export interface PdfToImageOptions {
  scale?: number;
  pageNumber?: number;
  format?: 'image/png' | 'image/jpeg';
  quality?: number;
}

export async function pdfToImage(
  pdfData: ArrayBuffer | Uint8Array,
  options: PdfToImageOptions = {}
): Promise<string> {
  const { scale = 2, pageNumber = 1, format = 'image/jpeg', quality = 0.85 } = options;
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context error');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL(format, quality).split(',')[1];
}

export async function pdfFileToImage(
  file: File,
  options: PdfToImageOptions = {}
): Promise<string> {
  return pdfToImage(await file.arrayBuffer(), options);
}
