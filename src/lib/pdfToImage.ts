import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível criar contexto 2D do canvas');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport, canvas }).promise;

  const imageBase64 = canvas.toDataURL(format, quality);
  return imageBase64.split(',')[1];
}

export async function pdfFileToImage(file: File, options: PdfToImageOptions = {}): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return pdfToImage(arrayBuffer, options);
}

export async function pdfBase64ToImage(pdfBase64: string, options: PdfToImageOptions = {}): Promise<string> {
  const binaryString = atob(pdfBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return pdfToImage(bytes, options);
}
