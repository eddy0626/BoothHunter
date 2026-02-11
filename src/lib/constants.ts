export interface CategoryNode {
  jaName: string;
  koLabel: string;
  icon: string;
}

export const VRCHAT_CATEGORIES: CategoryNode[] = [
  { jaName: '3Dキャラクター', koLabel: '3D 캐릭터', icon: 'User' },
  { jaName: '3D衣装', koLabel: '3D 의상', icon: 'Shirt' },
  { jaName: '3D小道具', koLabel: '3D 소품', icon: 'Gem' },
  { jaName: '3Dテクスチャ', koLabel: '3D 텍스처', icon: 'Paintbrush' },
  { jaName: '3Dモデル（その他）', koLabel: '3D 모델 (기타)', icon: 'Box' },
  { jaName: '3D装飾品', koLabel: '3D 장식품', icon: 'Crown' },
  { jaName: '3D環境・ワールド', koLabel: '3D 환경/월드', icon: 'Globe' },
  { jaName: '3Dモーション・アニメーション', koLabel: '3D 모션/애니메이션', icon: 'Play' },
  { jaName: '3Dツール・システム', koLabel: '3D 툴/시스템', icon: 'Wrench' },
  { jaName: 'VRoid', koLabel: 'VRoid', icon: 'Sparkles' },
];

export const ITEMS_PER_PAGE = 24;
