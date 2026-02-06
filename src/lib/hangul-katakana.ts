// Hangul Unicode decomposition constants
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNG_COUNT = 21;
const JONG_COUNT = 28;

const CHO_LIST = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const JUNG_LIST = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];

const JONG_LIST = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

// Cho (initial consonant) → Katakana consonant mapping
const CHO_TO_KATA: Record<string, string> = {
  ㄱ: 'カ',
  ㄲ: 'ッカ',
  ㄴ: 'ナ',
  ㄷ: 'タ',
  ㄸ: 'ッタ',
  ㄹ: 'ラ',
  ㅁ: 'マ',
  ㅂ: 'パ',
  ㅃ: 'ッパ',
  ㅅ: 'サ',
  ㅆ: 'ッサ',
  ㅇ: '',
  ㅈ: 'チャ',
  ㅉ: 'ッチャ',
  ㅊ: 'チャ',
  ㅋ: 'カ',
  ㅌ: 'タ',
  ㅍ: 'パ',
  ㅎ: 'ハ',
};

// Jung (vowel) → Katakana vowel mapping
const JUNG_TO_KATA: Record<string, string> = {
  ㅏ: 'ア',
  ㅐ: 'エ',
  ㅑ: 'ヤ',
  ㅒ: 'イェ',
  ㅓ: 'オ',
  ㅔ: 'エ',
  ㅕ: 'ヨ',
  ㅖ: 'イェ',
  ㅗ: 'オ',
  ㅘ: 'ワ',
  ㅙ: 'ウェ',
  ㅚ: 'ウェ',
  ㅛ: 'ヨ',
  ㅜ: 'ウ',
  ㅝ: 'ウォ',
  ㅞ: 'ウェ',
  ㅟ: 'ウィ',
  ㅠ: 'ユ',
  ㅡ: 'ウ',
  ㅢ: 'ウィ',
  ㅣ: 'イ',
};

// Combined consonant+vowel → syllable row index (for more natural katakana)
const SYLLABLE_MAP: Record<string, Record<string, string>> = {
  ㄱ: {
    ㅏ: 'カ',
    ㅐ: 'ケ',
    ㅑ: 'キャ',
    ㅓ: 'コ',
    ㅔ: 'ケ',
    ㅕ: 'キョ',
    ㅗ: 'コ',
    ㅛ: 'キョ',
    ㅜ: 'ク',
    ㅠ: 'キュ',
    ㅡ: 'ク',
    ㅣ: 'キ',
    ㅘ: 'クヮ',
    ㅚ: 'クェ',
    ㅝ: 'クォ',
    ㅟ: 'クィ',
  },
  ㄴ: {
    ㅏ: 'ナ',
    ㅐ: 'ネ',
    ㅑ: 'ニャ',
    ㅓ: 'ノ',
    ㅔ: 'ネ',
    ㅕ: 'ニョ',
    ㅗ: 'ノ',
    ㅛ: 'ニョ',
    ㅜ: 'ヌ',
    ㅠ: 'ニュ',
    ㅡ: 'ヌ',
    ㅣ: 'ニ',
    ㅘ: 'ヌヮ',
    ㅚ: 'ヌェ',
    ㅝ: 'ヌォ',
    ㅟ: 'ヌィ',
  },
  ㄷ: {
    ㅏ: 'タ',
    ㅐ: 'テ',
    ㅑ: 'チャ',
    ㅓ: 'ト',
    ㅔ: 'テ',
    ㅕ: 'チョ',
    ㅗ: 'ト',
    ㅛ: 'チョ',
    ㅜ: 'ツ',
    ㅠ: 'チュ',
    ㅡ: 'ツ',
    ㅣ: 'チ',
    ㅘ: 'トヮ',
    ㅚ: 'トェ',
    ㅝ: 'トォ',
    ㅟ: 'トィ',
  },
  ㄹ: {
    ㅏ: 'ラ',
    ㅐ: 'レ',
    ㅑ: 'リャ',
    ㅓ: 'ロ',
    ㅔ: 'レ',
    ㅕ: 'リョ',
    ㅗ: 'ロ',
    ㅛ: 'リョ',
    ㅜ: 'ル',
    ㅠ: 'リュ',
    ㅡ: 'ル',
    ㅣ: 'リ',
    ㅘ: 'ルヮ',
    ㅚ: 'ルェ',
    ㅝ: 'ルォ',
    ㅟ: 'ルィ',
  },
  ㅁ: {
    ㅏ: 'マ',
    ㅐ: 'メ',
    ㅑ: 'ミャ',
    ㅓ: 'モ',
    ㅔ: 'メ',
    ㅕ: 'ミョ',
    ㅗ: 'モ',
    ㅛ: 'ミョ',
    ㅜ: 'ム',
    ㅠ: 'ミュ',
    ㅡ: 'ム',
    ㅣ: 'ミ',
    ㅘ: 'ムヮ',
    ㅚ: 'ムェ',
    ㅝ: 'ムォ',
    ㅟ: 'ムィ',
  },
  ㅂ: {
    ㅏ: 'パ',
    ㅐ: 'ペ',
    ㅑ: 'ピャ',
    ㅓ: 'ポ',
    ㅔ: 'ペ',
    ㅕ: 'ピョ',
    ㅗ: 'ポ',
    ㅛ: 'ピョ',
    ㅜ: 'プ',
    ㅠ: 'ピュ',
    ㅡ: 'プ',
    ㅣ: 'ピ',
    ㅘ: 'プヮ',
    ㅚ: 'プェ',
    ㅝ: 'プォ',
    ㅟ: 'プィ',
  },
  ㅅ: {
    ㅏ: 'サ',
    ㅐ: 'セ',
    ㅑ: 'シャ',
    ㅓ: 'ソ',
    ㅔ: 'セ',
    ㅕ: 'ショ',
    ㅗ: 'ソ',
    ㅛ: 'ショ',
    ㅜ: 'ス',
    ㅠ: 'シュ',
    ㅡ: 'ス',
    ㅣ: 'シ',
    ㅘ: 'スヮ',
    ㅚ: 'スェ',
    ㅝ: 'スォ',
    ㅟ: 'スィ',
  },
  ㅇ: {
    ㅏ: 'ア',
    ㅐ: 'エ',
    ㅑ: 'ヤ',
    ㅓ: 'オ',
    ㅔ: 'エ',
    ㅕ: 'ヨ',
    ㅗ: 'オ',
    ㅛ: 'ヨ',
    ㅜ: 'ウ',
    ㅠ: 'ユ',
    ㅡ: 'ウ',
    ㅣ: 'イ',
    ㅘ: 'ワ',
    ㅚ: 'ウェ',
    ㅝ: 'ウォ',
    ㅟ: 'ウィ',
  },
  ㅈ: {
    ㅏ: 'チャ',
    ㅐ: 'チェ',
    ㅑ: 'チャ',
    ㅓ: 'チョ',
    ㅔ: 'チェ',
    ㅕ: 'チョ',
    ㅗ: 'チョ',
    ㅛ: 'チョ',
    ㅜ: 'チュ',
    ㅠ: 'チュ',
    ㅡ: 'チュ',
    ㅣ: 'チ',
    ㅘ: 'チュヮ',
    ㅚ: 'チュェ',
    ㅝ: 'チュォ',
    ㅟ: 'チュィ',
  },
  ㅊ: {
    ㅏ: 'チャ',
    ㅐ: 'チェ',
    ㅑ: 'チャ',
    ㅓ: 'チョ',
    ㅔ: 'チェ',
    ㅕ: 'チョ',
    ㅗ: 'チョ',
    ㅛ: 'チョ',
    ㅜ: 'チュ',
    ㅠ: 'チュ',
    ㅡ: 'チュ',
    ㅣ: 'チ',
    ㅘ: 'チュヮ',
    ㅚ: 'チュェ',
    ㅝ: 'チュォ',
    ㅟ: 'チュィ',
  },
  ㅋ: {
    ㅏ: 'カ',
    ㅐ: 'ケ',
    ㅑ: 'キャ',
    ㅓ: 'コ',
    ㅔ: 'ケ',
    ㅕ: 'キョ',
    ㅗ: 'コ',
    ㅛ: 'キョ',
    ㅜ: 'ク',
    ㅠ: 'キュ',
    ㅡ: 'ク',
    ㅣ: 'キ',
    ㅘ: 'クヮ',
    ㅚ: 'クェ',
    ㅝ: 'クォ',
    ㅟ: 'クィ',
  },
  ㅌ: {
    ㅏ: 'タ',
    ㅐ: 'テ',
    ㅑ: 'チャ',
    ㅓ: 'ト',
    ㅔ: 'テ',
    ㅕ: 'チョ',
    ㅗ: 'ト',
    ㅛ: 'チョ',
    ㅜ: 'ツ',
    ㅠ: 'チュ',
    ㅡ: 'ツ',
    ㅣ: 'チ',
    ㅘ: 'トヮ',
    ㅚ: 'トェ',
    ㅝ: 'トォ',
    ㅟ: 'トィ',
  },
  ㅍ: {
    ㅏ: 'パ',
    ㅐ: 'ペ',
    ㅑ: 'ピャ',
    ㅓ: 'ポ',
    ㅔ: 'ペ',
    ㅕ: 'ピョ',
    ㅗ: 'ポ',
    ㅛ: 'ピョ',
    ㅜ: 'プ',
    ㅠ: 'ピュ',
    ㅡ: 'プ',
    ㅣ: 'ピ',
    ㅘ: 'プヮ',
    ㅚ: 'プェ',
    ㅝ: 'プォ',
    ㅟ: 'プィ',
  },
  ㅎ: {
    ㅏ: 'ハ',
    ㅐ: 'ヘ',
    ㅑ: 'ヒャ',
    ㅓ: 'ホ',
    ㅔ: 'ヘ',
    ㅕ: 'ヒョ',
    ㅗ: 'ホ',
    ㅛ: 'ヒョ',
    ㅜ: 'フ',
    ㅠ: 'ヒュ',
    ㅡ: 'フ',
    ㅣ: 'ヒ',
    ㅘ: 'フヮ',
    ㅚ: 'フェ',
    ㅝ: 'フォ',
    ㅟ: 'フィ',
  },
};

// Jong (final consonant) → Katakana
const JONG_TO_KATA: Record<string, string> = {
  '': '',
  ㄱ: 'ク',
  ㄲ: 'ック',
  ㄴ: 'ン',
  ㄷ: 'ツ',
  ㄹ: 'ル',
  ㅁ: 'ム',
  ㅂ: 'プ',
  ㅅ: 'ツ',
  ㅆ: 'ッ',
  ㅇ: 'ン',
  ㅈ: 'ツ',
  ㅊ: 'ツ',
  ㅋ: 'ク',
  ㅌ: 'ツ',
  ㅍ: 'プ',
  ㅎ: 'ツ',
  ㄳ: 'ク',
  ㄵ: 'ン',
  ㄶ: 'ン',
  ㄺ: 'ク',
  ㄻ: 'ム',
  ㄼ: 'ル',
  ㄽ: 'ル',
  ㄾ: 'ル',
  ㄿ: 'ル',
  ㅀ: 'ル',
  ㅄ: 'プ',
};

export function containsHangul(text: string): boolean {
  return /[\uAC00-\uD7A3\u3131-\u3163]/.test(text);
}

function decomposeHangul(char: string): { cho: string; jung: string; jong: string } | null {
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return null;

  const offset = code - HANGUL_START;
  const choIdx = Math.floor(offset / (JUNG_COUNT * JONG_COUNT));
  const jungIdx = Math.floor((offset % (JUNG_COUNT * JONG_COUNT)) / JONG_COUNT);
  const jongIdx = offset % JONG_COUNT;

  return {
    cho: CHO_LIST[choIdx],
    jung: JUNG_LIST[jungIdx],
    jong: JONG_LIST[jongIdx],
  };
}

export function hangulToKatakana(text: string): string {
  let result = '';

  for (const char of text) {
    const decomposed = decomposeHangul(char);
    if (!decomposed) {
      result += char;
      continue;
    }

    const { cho, jung, jong } = decomposed;

    // Try syllable map first for more natural conversion
    const syllable = SYLLABLE_MAP[cho]?.[jung];
    if (syllable) {
      result += syllable;
    } else {
      // Fallback: concatenate consonant + vowel
      const choKata = CHO_TO_KATA[cho] ?? '';
      const jungKata = JUNG_TO_KATA[jung] ?? '';
      if (choKata && jungKata) {
        result += choKata + jungKata;
      } else {
        result += jungKata || choKata;
      }
    }

    // Add final consonant
    if (jong) {
      result += JONG_TO_KATA[jong] ?? '';
    }
  }

  return result;
}
