export interface DictEntry {
  ko: string;
  ja: string;
  category: "avatar" | "item" | "vrc";
}

export const AVATAR_DICT: DictEntry[] = [
  { ko: "키프펠", ja: "キプフェル", category: "avatar" },
  { ko: "루루네", ja: "ルルネ", category: "avatar" },
  { ko: "밀티나", ja: "ミルティナ", category: "avatar" },
  { ko: "마메히나타", ja: "まめひなた", category: "avatar" },
  { ko: "쇼콜라", ja: "ショコラ", category: "avatar" },
  { ko: "시오", ja: "しお", category: "avatar" },
  { ko: "그루스", ja: "Grus", category: "avatar" },
  { ko: "리리카", ja: "りりか", category: "avatar" },
  { ko: "코유키", ja: "狐雪", category: "avatar" },
  { ko: "민트", ja: "ミント", category: "avatar" },
  { ko: "미나호시", ja: "みなほし", category: "avatar" },
  { ko: "시라츠메", ja: "しらつめ", category: "avatar" },
  { ko: "리루모와", ja: "リルモワ", category: "avatar" },
  { ko: "소라하", ja: "ソラハ", category: "avatar" },
  { ko: "마키", ja: "碼希", category: "avatar" },
  { ko: "카르네", ja: "カルネ", category: "avatar" },
  { ko: "리파", ja: "リーファ", category: "avatar" },
  { ko: "라즈리", ja: "ラズリ", category: "avatar" },
  { ko: "루나릿", ja: "ルーナリット", category: "avatar" },
  { ko: "하오란", ja: "ハオラン", category: "avatar" },
];

export const ITEM_DICT: DictEntry[] = [
  { ko: "원피스", ja: "ワンピース", category: "item" },
  { ko: "치마", ja: "スカート", category: "item" },
  { ko: "바지", ja: "パンツ", category: "item" },
  { ko: "셔츠", ja: "シャツ", category: "item" },
  { ko: "신발", ja: "シューズ", category: "item" },
  { ko: "부츠", ja: "ブーツ", category: "item" },
  { ko: "모자", ja: "帽子", category: "item" },
  { ko: "안경", ja: "メガネ", category: "item" },
  { ko: "귀걸이", ja: "イヤリング", category: "item" },
  { ko: "목걸이", ja: "ネックレス", category: "item" },
  { ko: "양말", ja: "ソックス", category: "item" },
  { ko: "장갑", ja: "グローブ", category: "item" },
  { ko: "가방", ja: "バッグ", category: "item" },
  { ko: "날개", ja: "翼", category: "item" },
  { ko: "꼬리", ja: "しっぽ", category: "item" },
  { ko: "귀", ja: "耳", category: "item" },
  { ko: "머리카락", ja: "ヘアー", category: "item" },
  { ko: "헤어", ja: "ヘアー", category: "item" },
  { ko: "속옷", ja: "下着", category: "item" },
  { ko: "수영복", ja: "水着", category: "item" },
  { ko: "제복", ja: "制服", category: "item" },
  { ko: "메이드복", ja: "メイド服", category: "item" },
];

export const VRC_DICT: DictEntry[] = [
  { ko: "대응", ja: "対応", category: "vrc" },
  { ko: "전용", ja: "専用", category: "vrc" },
  { ko: "의상", ja: "衣装", category: "vrc" },
  { ko: "소품", ja: "小道具", category: "vrc" },
  { ko: "텍스처", ja: "テクスチャ", category: "vrc" },
  { ko: "아바타", ja: "アバター", category: "vrc" },
  { ko: "월드", ja: "ワールド", category: "vrc" },
  { ko: "기믹", ja: "ギミック", category: "vrc" },
  { ko: "셰이더", ja: "シェーダー", category: "vrc" },
  { ko: "파티클", ja: "パーティクル", category: "vrc" },
  { ko: "무료", ja: "無料", category: "vrc" },
];

export const ALL_DICT: DictEntry[] = [...AVATAR_DICT, ...ITEM_DICT, ...VRC_DICT];
