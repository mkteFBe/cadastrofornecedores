import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
export interface PdfToImageOptions { scale?: number; pageNumber?: number; format?: 'image/png' | 'image/jpeg'; quality?: number; }
export async function pdfToImage(pdfData: ArrayBuffer | Uint8Array, options: PdfToImageOptions = {}): Promise<string> {
  const { scale = 2, pageNumber = 1, format = 'image/jpeg', quality = 0.85 } = options;
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context error');
  canvas.width = viewport.width; canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL(format, quality).split(',')[1];
}
export async function pdfFileToImage(file: File, options: PdfToImageOptions = {}): Promise<string> {
  return pdfToImage(await file.arrayBuffer(), options);
}
