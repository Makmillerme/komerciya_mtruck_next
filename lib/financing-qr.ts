import QRCode from "qrcode";

const QR_WIDTH = 220;

/**
 * Генерує data URL PNG для QR з тексту посилання.
 * Порожній рядок → null (шаблон показує статичний webp).
 */
export async function financingQrToDataUrl(
  rawUrl: string | undefined | null
): Promise<string | null> {
  const t = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!t) return null;
  try {
    new URL(t);
  } catch {
    return null;
  }
  return QRCode.toDataURL(t, {
    width: QR_WIDTH,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

/**
 * PNG buffer для GET /api/qr (той самий вміст, що й у data URL).
 */
export async function financingQrToPngBuffer(
  rawUrl: string | undefined | null
): Promise<Buffer | null> {
  const t = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!t) return null;
  try {
    new URL(t);
  } catch {
    return null;
  }
  return QRCode.toBuffer(t, {
    width: QR_WIDTH,
    margin: 1,
    errorCorrectionLevel: "M",
    type: "png",
  });
}
