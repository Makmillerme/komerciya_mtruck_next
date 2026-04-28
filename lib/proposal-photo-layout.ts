/**
 * Ліміт фото для КП (завантаження + PDF) та розкладка по сторінках A4.
 */
export const MAX_PROPOSAL_PHOTOS = 24;

/** Скільки фото на першій сторінці під блоком характеристик (сітка 2×2, як раніше). */
export const PROPOSAL_PHOTOS_PAGE1 = 4;

function nonEmptyPhotoUrls(imageUrls: string[]): string[] {
  return imageUrls.filter((u) => typeof u === "string" && u.trim().length > 0);
}

/** Унікальні непорожні URL, обрізані до MAX_PROPOSAL_PHOTOS. */
export function proposalPhotoSlots(imageUrls: string[]): string[] {
  return nonEmptyPhotoUrls(imageUrls).slice(0, MAX_PROPOSAL_PHOTOS);
}

export function splitProposalPhotosForPages(imageUrls: string[]): {
  page1: string[];
  page2: string[];
} {
  const slots = proposalPhotoSlots(imageUrls);
  return {
    page1: slots.slice(0, PROPOSAL_PHOTOS_PAGE1),
    page2: slots.slice(PROPOSAL_PHOTOS_PAGE1),
  };
}
