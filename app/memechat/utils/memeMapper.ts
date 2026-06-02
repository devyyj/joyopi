// ===================================================================
// 밈챗 밈 매퍼 - 얼굴 표정 20개 + 손 제스처 10개
// ===================================================================

// --- 얼굴 중심 밈 액션 ID (20개) ---
export type FaceMemeActionId =
  | 'FACE_POKER'       // 무표정 포커페이스
  | 'FACE_BLINK'       // 깜빡이 (Blinking Guy)
  | 'FACE_SIDEEYE'     // 사이드아이 (옆눈질)
  | 'FACE_SMILE'       // 능글 미소 (짱구)
  | 'FACE_BIG_SMILE'   // 큰 웃음 (무야호)
  | 'FACE_WINK'        // 윙크
  | 'FACE_SMIRK'       // 히죽 웃음 (한쪽 입꼬리)
  | 'FACE_SAD'         // 슬픔 (슬픈 페페)
  | 'FACE_CRY'         // 울상
  | 'FACE_POUT'        // 삐침 (핑구)
  | 'FACE_ANGRY'       // 분노 (화난 고양이)
  | 'FACE_YELL'        // 소리지르기 (문희)
  | 'FACE_SARCASTIC'   // 비꼬기 (침착맨)
  | 'FACE_DISGUST'     // 혐오 (고길동)
  | 'FACE_SHOCK'       // 놀람 (피카츄)
  | 'FACE_GASP'        // 억울 놀람 (곽튜브)
  | 'FACE_FREEZE'      // 얼어붙음 (원숭이 퍼핏)
  | 'FACE_TONGUE'      // 메롱 (자두)
  | 'FACE_KISSY'       // 쪽쪽이
  | 'FACE_SQUINT';     // 눈 찡그림 (의심)

// --- 손 모션 밈 액션 ID (10개) ---
export type HandMemeActionId =
  | 'HAND_THUMBSUP'    // 따봉 (엄지척)
  | 'HAND_PEACE'       // 브이 (묻고 더블로 가)
  | 'HAND_FIST'        // 주먹 (마동석)
  | 'HAND_POINT'       // 가리키기 (박명수)
  | 'HAND_PALM'        // 손바닥 (조세호)
  | 'HAND_DOUBLE_FIST' // 양주먹 (근육 댕댕이)
  | 'HAND_WAVE'        // 인사 (손 흔들기)
  | 'HAND_CHIN'        // 턱 괴기 (생각)
  | 'HAND_FOREHEAD'    // 이마 짚기 (절망)
  | 'HAND_DOUBLE_RAISE'; // 만세 (양팔 번쩍)

export type MemeActionId = FaceMemeActionId | HandMemeActionId;

export interface MemeInfo {
  actionId: MemeActionId;
  title: string;
  imagePath: string;
  category: 'face' | 'hand';
  emotion?: string; // 감정 분류 태그
}

// ===================================================================
// 밈 데이터 정의
// ===================================================================

export const ACTION_MEMES: Record<MemeActionId, MemeInfo> = {
  // ── 얼굴: 무표정/냉정 (3개) ──
  FACE_POKER: {
    actionId: 'FACE_POKER',
    title: '포커페이스',
    imagePath: '/images/memes/face_01_poker.jpg',
    category: 'face',
    emotion: 'neutral',
  },
  FACE_BLINK: {
    actionId: 'FACE_BLINK',
    title: '깜빡이 구이',
    imagePath: '/images/memes/face_02_blink.jpg',
    category: 'face',
    emotion: 'neutral',
  },
  FACE_SIDEEYE: {
    actionId: 'FACE_SIDEEYE',
    title: '사이드아이',
    imagePath: '/images/memes/face_03_sideeye.jpg',
    category: 'face',
    emotion: 'neutral',
  },

  // ── 얼굴: 행복/기쁨 (4개) ──
  FACE_SMILE: {
    actionId: 'FACE_SMILE',
    title: '짱구 능글 미소',
    imagePath: '/images/memes/face_04_smile.jpg',
    category: 'face',
    emotion: 'happy',
  },
  FACE_BIG_SMILE: {
    actionId: 'FACE_BIG_SMILE',
    title: '무야호 할아버지',
    imagePath: '/images/memes/face_05_bigsmile.jpg',
    category: 'face',
    emotion: 'happy',
  },
  FACE_WINK: {
    actionId: 'FACE_WINK',
    title: '윙크',
    imagePath: '/images/memes/face_06_wink.jpg',
    category: 'face',
    emotion: 'happy',
  },
  FACE_SMIRK: {
    actionId: 'FACE_SMIRK',
    title: '히죽 웃음',
    imagePath: '/images/memes/face_07_smirk.jpg',
    category: 'face',
    emotion: 'happy',
  },

  // ── 얼굴: 슬픔/우울 (3개) ──
  FACE_SAD: {
    actionId: 'FACE_SAD',
    title: '슬픈 페페',
    imagePath: '/images/memes/face_08_sad.jpg',
    category: 'face',
    emotion: 'sad',
  },
  FACE_CRY: {
    actionId: 'FACE_CRY',
    title: '눈물이 차올라',
    imagePath: '/images/memes/face_09_cry.jpg',
    category: 'face',
    emotion: 'sad',
  },
  FACE_POUT: {
    actionId: 'FACE_POUT',
    title: '핑구 삐침',
    imagePath: '/images/memes/face_10_pout.jpg',
    category: 'face',
    emotion: 'sad',
  },

  // ── 얼굴: 짜증/분노 (4개) ──
  FACE_ANGRY: {
    actionId: 'FACE_ANGRY',
    title: '하악질 고양이',
    imagePath: '/images/memes/face_11_angry.jpg',
    category: 'face',
    emotion: 'angry',
  },
  FACE_YELL: {
    actionId: 'FACE_YELL',
    title: '호박고구마!',
    imagePath: '/images/memes/face_12_yell.jpg',
    category: 'face',
    emotion: 'angry',
  },
  FACE_SARCASTIC: {
    actionId: 'FACE_SARCASTIC',
    title: '침착맨 킹받음',
    imagePath: '/images/memes/face_13_sarcastic.jpg',
    category: 'face',
    emotion: 'angry',
  },
  FACE_DISGUST: {
    actionId: 'FACE_DISGUST',
    title: '고길동 정색',
    imagePath: '/images/memes/face_14_disgust.jpg',
    category: 'face',
    emotion: 'angry',
  },

  // ── 얼굴: 놀람/충격 (3개) ──
  FACE_SHOCK: {
    actionId: 'FACE_SHOCK',
    title: '피카츄 깜짝 놀람',
    imagePath: '/images/memes/face_15_shock.jpg',
    category: 'face',
    emotion: 'surprised',
  },
  FACE_GASP: {
    actionId: 'FACE_GASP',
    title: '곽튜브 억울',
    imagePath: '/images/memes/face_16_gasp.jpg',
    category: 'face',
    emotion: 'surprised',
  },
  FACE_FREEZE: {
    actionId: 'FACE_FREEZE',
    title: '얼어붙은 원숭이',
    imagePath: '/images/memes/face_17_freeze.jpg',
    category: 'face',
    emotion: 'surprised',
  },

  // ── 얼굴: 재미/특수 (3개) ──
  FACE_TONGUE: {
    actionId: 'FACE_TONGUE',
    title: '자두 메롱',
    imagePath: '/images/memes/face_18_tongue.jpg',
    category: 'face',
    emotion: 'funny',
  },
  FACE_KISSY: {
    actionId: 'FACE_KISSY',
    title: '쪽쪽이',
    imagePath: '/images/memes/face_19_kissy.jpg',
    category: 'face',
    emotion: 'funny',
  },
  FACE_SQUINT: {
    actionId: 'FACE_SQUINT',
    title: '눈 찡그림 의심',
    imagePath: '/images/memes/face_20_squint.jpg',
    category: 'face',
    emotion: 'funny',
  },

  // ── 손: 제스처 밈 (10개) ──
  HAND_THUMBSUP: {
    actionId: 'HAND_THUMBSUP',
    title: '따봉 도치',
    imagePath: '/images/memes/hand_01_thumbsup.jpg',
    category: 'hand',
  },
  HAND_PEACE: {
    actionId: 'HAND_PEACE',
    title: '묻고 더블로 가!',
    imagePath: '/images/memes/hand_02_peace.jpg',
    category: 'hand',
  },
  HAND_FIST: {
    actionId: 'HAND_FIST',
    title: '마동석 주먹',
    imagePath: '/images/memes/hand_03_fist.jpg',
    category: 'hand',
  },
  HAND_POINT: {
    actionId: 'HAND_POINT',
    title: '박명수 훈수',
    imagePath: '/images/memes/hand_04_point.jpg',
    category: 'hand',
  },
  HAND_PALM: {
    actionId: 'HAND_PALM',
    title: '조세호 질문',
    imagePath: '/images/memes/hand_05_palm.jpg',
    category: 'hand',
  },
  HAND_DOUBLE_FIST: {
    actionId: 'HAND_DOUBLE_FIST',
    title: '근육 댕댕이',
    imagePath: '/images/memes/hand_06_doublefist.jpg',
    category: 'hand',
  },
  HAND_WAVE: {
    actionId: 'HAND_WAVE',
    title: '포레스트 검프 인사',
    imagePath: '/images/memes/hand_07_wave.jpg',
    category: 'hand',
  },
  HAND_CHIN: {
    actionId: 'HAND_CHIN',
    title: '턱 괴기 생각',
    imagePath: '/images/memes/hand_08_chin.jpg',
    category: 'hand',
  },
  HAND_FOREHEAD: {
    actionId: 'HAND_FOREHEAD',
    title: '이마 짚기 절망',
    imagePath: '/images/memes/hand_09_forehead.jpg',
    category: 'hand',
  },
  HAND_DOUBLE_RAISE: {
    actionId: 'HAND_DOUBLE_RAISE',
    title: '만세!',
    imagePath: '/images/memes/hand_10_raise.jpg',
    category: 'hand',
  },
};

// ===================================================================
// 감지 상태명 → 밈 액션 ID 매핑
// useMotionDetection에서 방출하는 문자열 키를 밈 ID로 변환
// ===================================================================
const GESTURE_TO_ACTION: Record<string, MemeActionId> = {
  // 얼굴 표정 (20개)
  'Poker': 'FACE_POKER',
  'Blink': 'FACE_BLINK',
  'SideEye': 'FACE_SIDEEYE',
  'Smile': 'FACE_SMILE',
  'BigSmile': 'FACE_BIG_SMILE',
  'Wink': 'FACE_WINK',
  'Smirk': 'FACE_SMIRK',
  'Sad': 'FACE_SAD',
  'Cry': 'FACE_CRY',
  'Pout': 'FACE_POUT',
  'Angry': 'FACE_ANGRY',
  'Yell': 'FACE_YELL',
  'Sarcastic': 'FACE_SARCASTIC',
  'Disgust': 'FACE_DISGUST',
  'Shock': 'FACE_SHOCK',
  'Gasp': 'FACE_GASP',
  'Freeze': 'FACE_FREEZE',
  'Tongue': 'FACE_TONGUE',
  'Kissy': 'FACE_KISSY',
  'Squint': 'FACE_SQUINT',
  // 손 제스처 (10개)
  'ThumbsUp': 'HAND_THUMBSUP',
  'Peace': 'HAND_PEACE',
  'Fist': 'HAND_FIST',
  'Point': 'HAND_POINT',
  'Palm': 'HAND_PALM',
  'DoubleFist': 'HAND_DOUBLE_FIST',
  'Wave': 'HAND_WAVE',
  'Chin': 'HAND_CHIN',
  'Forehead': 'HAND_FOREHEAD',
  'DoubleRaise': 'HAND_DOUBLE_RAISE',
};

export function getMemeByAction(actionId: MemeActionId): MemeInfo | undefined {
  return ACTION_MEMES[actionId];
}

export function getMemeByGesture(gestureOrExpression: string): MemeInfo | null {
  const actionId = GESTURE_TO_ACTION[gestureOrExpression];
  if (!actionId) return null;
  return ACTION_MEMES[actionId] || null;
}

// 카테고리별 밈 목록 조회 유틸
export function getMemesByCategory(category: 'face' | 'hand'): MemeInfo[] {
  return Object.values(ACTION_MEMES).filter(m => m.category === category);
}

export function getMemesByEmotion(emotion: string): MemeInfo[] {
  return Object.values(ACTION_MEMES).filter(m => m.emotion === emotion);
}
