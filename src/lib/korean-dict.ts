export interface DictEntry {
  ko: string;
  en: string;
  ja: string;
  category: 'avatar' | 'item' | 'vrc';
}

export const AVATAR_DICT: DictEntry[] = [
  { ko: '키프펠', en: 'kipfel', ja: 'キプフェル', category: 'avatar' },
  { ko: '루루네', en: 'rurune', ja: 'ルルネ', category: 'avatar' },
  { ko: '밀티나', en: 'miltina', ja: 'ミルティナ', category: 'avatar' },
  { ko: '마메히나타', en: 'mamehinata', ja: 'まめひなた', category: 'avatar' },
  { ko: '쇼콜라', en: 'chocolat', ja: 'ショコラ', category: 'avatar' },
  { ko: '시오', en: 'shio', ja: 'しお', category: 'avatar' },
  { ko: '그루스', en: 'grus', ja: 'Grus', category: 'avatar' },
  { ko: '리리카', en: 'ririka', ja: 'りりか', category: 'avatar' },
  { ko: '코유키', en: 'koyuki', ja: '狐雪', category: 'avatar' },
  { ko: '민트', en: 'mint', ja: 'ミント', category: 'avatar' },
  { ko: '미나호시', en: 'minahoshi', ja: 'みなほし', category: 'avatar' },
  { ko: '시라츠메', en: 'shiratsume', ja: 'しらつめ', category: 'avatar' },
  { ko: '리루모와', en: 'lilmoire', ja: 'リルモワ', category: 'avatar' },
  { ko: '소라하', en: 'soraha', ja: 'ソラハ', category: 'avatar' },
  { ko: '마키', en: 'maki', ja: '碼希', category: 'avatar' },
  { ko: '카르네', en: 'carne', ja: 'カルネ', category: 'avatar' },
  { ko: '리파', en: 'leefa', ja: 'リーファ', category: 'avatar' },
  { ko: '라즈리', en: 'lazuli', ja: 'ラズリ', category: 'avatar' },
  { ko: '루나릿', en: 'lunalit', ja: 'ルーナリット', category: 'avatar' },
  { ko: '하오란', en: 'haolan', ja: 'ハオラン', category: 'avatar' },
];

export const ITEM_DICT: DictEntry[] = [
  { ko: '원피스', en: 'dress', ja: 'ワンピース', category: 'item' },
  { ko: '치마', en: 'skirt', ja: 'スカート', category: 'item' },
  { ko: '바지', en: 'pants', ja: 'パンツ', category: 'item' },
  { ko: '셔츠', en: 'shirt', ja: 'シャツ', category: 'item' },
  { ko: '신발', en: 'shoes', ja: 'シューズ', category: 'item' },
  { ko: '부츠', en: 'boots', ja: 'ブーツ', category: 'item' },
  { ko: '모자', en: 'hat', ja: '帽子', category: 'item' },
  { ko: '안경', en: 'glasses', ja: 'メガネ', category: 'item' },
  { ko: '귀걸이', en: 'earrings', ja: 'イヤリング', category: 'item' },
  { ko: '목걸이', en: 'necklace', ja: 'ネックレス', category: 'item' },
  { ko: '양말', en: 'socks', ja: 'ソックス', category: 'item' },
  { ko: '장갑', en: 'gloves', ja: 'グローブ', category: 'item' },
  { ko: '가방', en: 'bag', ja: 'バッグ', category: 'item' },
  { ko: '날개', en: 'wings', ja: '翼', category: 'item' },
  { ko: '꼬리', en: 'tail', ja: 'しっぽ', category: 'item' },
  { ko: '귀', en: 'ears', ja: '耳', category: 'item' },
  { ko: '머리카락', en: 'hair', ja: 'ヘアー', category: 'item' },
  { ko: '헤어', en: 'hairstyle', ja: 'ヘアー', category: 'item' },
  { ko: '속옷', en: 'underwear', ja: '下着', category: 'item' },
  { ko: '수영복', en: 'swimsuit', ja: '水着', category: 'item' },
  { ko: '제복', en: 'uniform', ja: '制服', category: 'item' },
  { ko: '메이드복', en: 'maid outfit', ja: 'メイド服', category: 'item' },
];

export const VRC_DICT: DictEntry[] = [
  { ko: '대응', en: 'compatible', ja: '対応', category: 'vrc' },
  { ko: '전용', en: 'exclusive', ja: '専用', category: 'vrc' },
  { ko: '의상', en: 'costume', ja: '衣装', category: 'vrc' },
  { ko: '소품', en: 'props', ja: '小道具', category: 'vrc' },
  { ko: '텍스처', en: 'texture', ja: 'テクスチャ', category: 'vrc' },
  { ko: '아바타', en: 'avatar', ja: 'アバター', category: 'vrc' },
  { ko: '월드', en: 'world', ja: 'ワールド', category: 'vrc' },
  { ko: '기믹', en: 'gimmick', ja: 'ギミック', category: 'vrc' },
  { ko: '셰이더', en: 'shader', ja: 'シェーダー', category: 'vrc' },
  { ko: '파티클', en: 'particle', ja: 'パーティクル', category: 'vrc' },
  { ko: '무료', en: 'free', ja: '無料', category: 'vrc' },
];

export const ALL_DICT: DictEntry[] = [...AVATAR_DICT, ...ITEM_DICT, ...VRC_DICT];
