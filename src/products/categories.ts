export const CATEGORIES = [
  { id: 'bedsheet-set', en: 'Bedsheet Sets', ur: 'بیڈ شیٹ سیٹ' },
  { id: 'single', en: 'Single Bedsheets', ur: 'سنگل بیڈ شیٹ' },
  { id: 'fitted', en: 'Fitted Sheets', ur: 'فٹڈ شیٹ' },
  { id: 'duvet', en: 'Duvet Covers', ur: 'رضائی کور' },
  { id: 'comforter', en: 'Comforter Sets', ur: 'کمفرٹر سیٹ' },
  { id: 'hotel', en: 'Hotel & Hospital', ur: 'ہوٹل و ہسپتال' },
  { id: 'pillow', en: 'Pillow Covers', ur: 'تکیہ غلاف' },
] as const;
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as string[];
