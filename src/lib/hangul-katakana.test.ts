import { containsHangul, hangulToKatakana } from './hangul-katakana';

describe('containsHangul', () => {
  it('returns true for full Hangul syllables', () => {
    expect(containsHangul('가나다')).toBe(true);
  });

  it('returns true for Jamo characters', () => {
    expect(containsHangul('ㄱㅏ')).toBe(true);
  });

  it('returns true for mixed Korean and ASCII', () => {
    expect(containsHangul('hello가')).toBe(true);
  });

  it('returns false for pure ASCII', () => {
    expect(containsHangul('hello')).toBe(false);
  });

  it('returns false for Japanese Katakana', () => {
    expect(containsHangul('カタカナ')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(containsHangul('')).toBe(false);
  });

  it('returns false for numbers and symbols', () => {
    expect(containsHangul('123!@#')).toBe(false);
  });
});

describe('hangulToKatakana', () => {
  it('converts a simple syllable via syllable map', () => {
    // 가 = ㄱ + ㅏ → SYLLABLE_MAP["ㄱ"]["ㅏ"] = "カ"
    expect(hangulToKatakana('가')).toBe('カ');
  });

  it('converts a syllable with final consonant', () => {
    // 간 = ㄱ + ㅏ + ㄴ → カ + ン
    expect(hangulToKatakana('간')).toBe('カン');
  });

  it('handles silent initial ㅇ', () => {
    // 아 = ㅇ + ㅏ → SYLLABLE_MAP["ㅇ"]["ㅏ"] = "ア"
    expect(hangulToKatakana('아')).toBe('ア');
  });

  it('converts a multi-character word', () => {
    // 사쿠라 → サクラ
    expect(hangulToKatakana('사쿠라')).toBe('サクラ');
  });

  it('uses fallback path for tensed consonants not in syllable map', () => {
    // 빠 = ㅃ + ㅏ → ㅃ not in SYLLABLE_MAP, falls back to CHO_TO_KATA["ㅃ"]("ッパ") + JUNG_TO_KATA["ㅏ"]("ア")
    expect(hangulToKatakana('빠')).toBe('ッパア');
  });

  it('passes through non-Hangul characters unchanged', () => {
    expect(hangulToKatakana('ABC')).toBe('ABC');
  });

  it('handles mixed Korean and non-Korean characters', () => {
    expect(hangulToKatakana('가A나')).toBe('カAナ');
  });

  it('returns empty string for empty input', () => {
    expect(hangulToKatakana('')).toBe('');
  });

  it('converts a syllable with complex final consonant', () => {
    // 닭 = ㄷ + ㅏ + ㄺ → タ + ク
    expect(hangulToKatakana('닭')).toBe('タク');
  });

  it('converts a known VRChat avatar name', () => {
    // 마누카 → マヌカ
    expect(hangulToKatakana('마누카')).toBe('マヌカ');
  });

  it('converts syllables with various vowels', () => {
    expect(hangulToKatakana('기')).toBe('キ'); // ㄱ + ㅣ
    expect(hangulToKatakana('구')).toBe('ク'); // ㄱ + ㅜ
    expect(hangulToKatakana('고')).toBe('コ'); // ㄱ + ㅗ
    expect(hangulToKatakana('게')).toBe('ケ'); // ㄱ + ㅔ
  });

  it('converts syllables with various final consonants', () => {
    expect(hangulToKatakana('각')).toBe('カク'); // jong ㄱ → ク
    expect(hangulToKatakana('감')).toBe('カム'); // jong ㅁ → ム
    expect(hangulToKatakana('갑')).toBe('カプ'); // jong ㅂ → プ
    expect(hangulToKatakana('갓')).toBe('カツ'); // jong ㅅ → ツ
  });

  it('handles numbers and symbols as passthrough', () => {
    expect(hangulToKatakana('123')).toBe('123');
    expect(hangulToKatakana('가123나')).toBe('カ123ナ');
  });
});
