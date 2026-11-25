/** Downscale an uploaded image in the browser (keeps transparency via WebP/PNG) so rooms stay small. */
export async function fileToDataUrl(file: File, maxH = 1100, maxW = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Could not read image")); i.src = url; });
    const k = Math.min(1, maxH / img.height, maxW / img.width);
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    let out = c.toDataURL("image/webp", 0.86);
    if (!out.startsWith("data:image/webp")) out = c.toDataURL("image/png");
    return out;
  } finally { URL.revokeObjectURL(url); }
}
