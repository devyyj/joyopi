import { useEffect, useRef, useState } from 'react';

// 내부에서 사용할 임시 인터페이스 정의
interface GestureRecognizerInstance {
  recognizeForVideo: (video: HTMLVideoElement, timestamp: number) => {
    gestures: { categoryName: string; score: number }[][];
    landmarks: { x: number; y: number }[][];
  };
  close: () => void;
}

interface FaceLandmarkerInstance {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
    faceLandmarks: { x: number; y: number }[][];
    faceBlendshapes: { categories: { categoryName: string; score: number }[] }[];
  };
  close: () => void;
}

export function useMotionDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onGestureDetected: (gesture: string) => void
) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const gestureRecognizerRef = useRef<GestureRecognizerInstance | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
  
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastProcessingTimeRef = useRef<number>(0);

  // 60fps 부드러운 드로잉을 위한 랜드마크 캐시 레퍼런스
  const latestHandLandmarksRef = useRef<{ x: number; y: number }[][]>([]);
  const latestFaceLandmarksRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    let active = true;

    async function initMediaPipe() {
      try {
        const { FilesetResolver, GestureRecognizer, FaceLandmarker } = await import('@mediapipe/tasks-vision');
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );

        // 1. 제스처(손동작) 모델 생성 (양손 지원)
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            // delegate 미지정 → MediaPipe가 자동으로 최적 가속기 선택
            // 'GPU' 명시 시 미지원 환경에서 XNNPACK 폴백 경고가 stderr로 출력되어
            // Next.js Turbopack 에러 오버레이에 Console Error로 표시됨
          },
          runningMode: 'VIDEO',
          numHands: 2, // 양손 트래킹 활성화
        });

        // 2. 페이스 랜드마크 모델 생성 (얼굴 및 표정 감지)
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            // delegate 미지정 → MediaPipe가 자동으로 최적 가속기 선택
          },
          runningMode: 'VIDEO',
          outputFaceBlendshapes: true,
        });

        if (active) {
          gestureRecognizerRef.current = recognizer as unknown as GestureRecognizerInstance;
          faceLandmarkerRef.current = landmarker as unknown as FaceLandmarkerInstance;
          setIsInitializing(false);
        }
      } catch (err: unknown) {
        console.error('Failed to initialize MediaPipe:', err);
        if (active) {
          const errMsg = err instanceof Error ? err.message : 'MediaPipe 초기화 실패';
          setError(errMsg);
          setIsInitializing(false);
        }
      }
    }

    initMediaPipe();

    return () => {
      active = false;
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  // 비디오 분석 및 60fps 드로잉 루프 통합
  useEffect(() => {
    const video = videoRef.current;
    if (isInitializing || !video) return;

    let isRunning = true;

    // 손가락 관절 연결
    const HAND_CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4], // 엄지
      [0, 5], [5, 6], [6, 7], [7, 8], // 검지
      [9, 10], [10, 11], [11, 12],    // 중지
      [13, 14], [14, 15], [15, 16],  // 약지
      [0, 17], [17, 18], [18, 19], [19, 20], // 새끼
      [5, 9], [9, 13], [13, 17]       // 손허리 연결
    ];

    // 얼굴 주요 랜드마크 연결 인덱스 리스트 (입술, 눈, 눈썹, 콧대, 얼굴 윤곽선 확장)
    const FACE_CONNECTIONS = [
      // 입술 라인
      [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291],
      [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324], [324, 308],
      // 왼쪽 눈
      [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133],
      [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133],
      // 오른쪽 눈
      [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390], [390, 249], [249, 263],
      [362, 398], [398, 384], [384, 385], [385, 386], [386, 387], [387, 388], [388, 466], [466, 263],
      // 눈썹
      [70, 63], [63, 105], [105, 66], [66, 107],
      [300, 293], [293, 334], [334, 296], [296, 336],
      // 콧대 및 코 끝
      [168, 6], [6, 197], [197, 195], [195, 5],
      [98, 97], [97, 2], [2, 326], [326, 327],
      // 얼굴 윤곽선 (턱선 및 볼 외곽라인 대칭 연결)
      [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
      [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10]
    ];

    function drawScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
      ctx.clearRect(0, 0, width, height);

      // 1. 손 랜드마크 드로잉 (양손 순회)
      latestHandLandmarksRef.current.forEach((hand) => {
        ctx.strokeStyle = '#818cf8'; // Indigo-400
        ctx.lineWidth = 3.5;
        HAND_CONNECTIONS.forEach(([start, end]) => {
          const pt1 = hand[start];
          const pt2 = hand[end];
          if (pt1 && pt2) {
            ctx.beginPath();
            ctx.moveTo((1 - pt1.x) * width, pt1.y * height);
            ctx.lineTo((1 - pt2.x) * width, pt2.y * height);
            ctx.stroke();
          }
        });

        ctx.fillStyle = '#34d399'; // Emerald-400
        hand.forEach((pt) => {
          ctx.beginPath();
          ctx.arc((1 - pt.x) * width, pt.y * height, 4.5, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // 2. 얼굴 랜드마크 드로잉
      const face = latestFaceLandmarksRef.current;
      if (face && face.length > 0) {
        ctx.strokeStyle = '#f472b6'; // Pink-400 (얼굴은 핑크색 뼈선)
        ctx.lineWidth = 1.5;
        FACE_CONNECTIONS.forEach(([start, end]) => {
          const pt1 = face[start];
          const pt2 = face[end];
          if (pt1 && pt2) {
            ctx.beginPath();
            ctx.moveTo((1 - pt1.x) * width, pt1.y * height);
            ctx.lineTo((1 - pt2.x) * width, pt2.y * height);
            ctx.stroke();
          }
        });

        // 랜드마크 포인트를 도트식으로 뿌려줌 (눈, 입 주변 일부 가중치점만 드로잉하여 성능 확보)
        ctx.fillStyle = '#f3f4f6'; // Gray-100
        const subsetPoints = [33, 133, 362, 263, 61, 291, 4, 1, 152]; // 주요 윤곽점
        subsetPoints.forEach((idx) => {
          const pt = face[idx];
          if (pt) {
            ctx.beginPath();
            ctx.arc((1 - pt.x) * width, pt.y * height, 3, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      }
    }

    function predictLoop() {
      if (!isRunning) return;

      const videoElement = videoRef.current;
      const gestureRecognizer = gestureRecognizerRef.current;
      const faceLandmarker = faceLandmarkerRef.current;
      const canvasElement = canvasRef.current;

      if (videoElement && videoElement.readyState >= 3) {
        const timestamp = performance.now();
        const videoTime = videoElement.currentTime;

        const ctx = canvasElement?.getContext('2d');
        const width = canvasElement?.width || 0;
        const height = canvasElement?.height || 0;

        // 매 프레임 캔버스 해상도 정합성 조율
        if (canvasElement && (canvasElement.width !== videoElement.videoWidth || canvasElement.height !== videoElement.videoHeight)) {
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
        }

        // 스로틀링(100ms) 하에서 비동기로 랜드마크 정보 업데이트
        if (videoTime !== lastVideoTimeRef.current && timestamp - lastProcessingTimeRef.current >= 100) {
          try {
            let detectedGesture = 'None';

            // 1. 얼굴 분석 (얼굴 랜드마크 및 정교한 표정 인식)
            let faceBlendshapes: { categoryName: string; score: number }[] | null = null;
            let faceLandmarks: { x: number; y: number }[] | null = null;

            if (faceLandmarker) {
              const faceResults = faceLandmarker.detectForVideo(videoElement, timestamp);
              if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
                faceLandmarks = faceResults.faceLandmarks[0];
                latestFaceLandmarksRef.current = faceLandmarks;
                if (faceResults.faceBlendshapes && faceResults.faceBlendshapes.length > 0) {
                  faceBlendshapes = faceResults.faceBlendshapes[0].categories;
                }
              } else {
                latestFaceLandmarksRef.current = [];
              }
            }

            // 2. 손 분석
            let handsLandmarks: { x: number; y: number }[][] = [];
            const handGestures: string[] = [];

            if (gestureRecognizer) {
              const handResults = gestureRecognizer.recognizeForVideo(videoElement, timestamp);
              handsLandmarks = handResults.landmarks || [];
              latestHandLandmarksRef.current = handsLandmarks;
              if (handResults.gestures) {
                handResults.gestures.forEach(gList => {
                  if (gList && gList[0] && gList[0].score > 0.6) {
                    handGestures.push(gList[0].categoryName);
                  } else {
                    handGestures.push('None');
                  }
                });
              }
            }

            // 3. 다차원 표정 및 제스처 유사도 분류 매핑 (30개 밈 체계)
            const getVal = (name: string) => {
              if (!faceBlendshapes) return 0;
              const found = faceBlendshapes.find(s => s.categoryName === name);
              return found ? found.score : 0;
            };

            // ── 표정 파라미터 수집 ──
            const smileLeft = getVal('mouthSmileLeft');
            const smileRight = getVal('mouthSmileRight');
            const smileAvg = (smileLeft + smileRight) / 2;
            const jawOpen = getVal('jawOpen');
            const browDownLeft = getVal('browDownLeft');
            const browDownRight = getVal('browDownRight');
            const browDownAvg = (browDownLeft + browDownRight) / 2;
            const browInnerUp = getVal('browInnerUp');
            const browOuterUpLeft = getVal('browOuterUpLeft');
            const browOuterUpRight = getVal('browOuterUpRight');
            const browUpAvg = (browOuterUpLeft + browOuterUpRight) / 2;
            const eyeBlinkLeft = getVal('eyeBlinkLeft');
            const eyeBlinkRight = getVal('eyeBlinkRight');
            const eyeBlinkAvg = (eyeBlinkLeft + eyeBlinkRight) / 2;
            const eyeSquintLeft = getVal('eyeSquintLeft');
            const eyeSquintRight = getVal('eyeSquintRight');
            const eyeSquintAvg = (eyeSquintLeft + eyeSquintRight) / 2;
            const mouthPucker = getVal('mouthPucker');
            const mouthFrownLeft = getVal('mouthFrownLeft');
            const mouthFrownRight = getVal('mouthFrownRight');
            const mouthFrownAvg = (mouthFrownLeft + mouthFrownRight) / 2;
            const tongueOut = getVal('tongueOut');
            const cheekPuff = getVal('cheekPuff');
            const noseSneerLeft = getVal('noseSneerLeft');
            const noseSneerRight = getVal('noseSneerRight');
            const noseSneerAvg = (noseSneerLeft + noseSneerRight) / 2;

            // 머리 회전(Yaw) 대략 계산 (고개 좌우 돌림 판단)
            let yawRatio = 1.0;
            if (faceLandmarks && faceLandmarks[1] && faceLandmarks[234] && faceLandmarks[454]) {
              const noseX = faceLandmarks[1].x;
              const leftCheekX = faceLandmarks[234].x;
              const rightCheekX = faceLandmarks[454].x;
              const leftDist = Math.abs(noseX - leftCheekX);
              const rightDist = Math.abs(noseX - rightCheekX);
              yawRatio = leftDist / (rightDist || 0.001);
            }

            // ═══════════════════════════════════════════════
            // A. 손 제스처 우선 매핑 (10개)
            // ═══════════════════════════════════════════════

            // 양손 복합 제스처
            if (handsLandmarks.length >= 2) {
              const h1 = handsLandmarks[0];
              const h2 = handsLandmarks[1];
              const h1G = handGestures[0] || 'None';
              const h2G = handGestures[1] || 'None';

              // 만세: 양손 모두 높이 올림
              if (h1[0].y < 0.35 && h2[0].y < 0.35) {
                detectedGesture = 'DoubleRaise';
              }
              // 양주먹: 양손 모두 Closed_Fist
              else if (h1G === 'Closed_Fist' && h2G === 'Closed_Fist') {
                detectedGesture = 'DoubleFist';
              }
            }

            // 단일 손 + 얼굴 위치 결합 제스처
            if (detectedGesture === 'None' && handsLandmarks.length >= 1) {
              const h = handsLandmarks[0];
              const hG = handGestures[0] || 'None';

              // 턱 괴기: 손이 턱 근처
              if (faceLandmarks && faceLandmarks[152]) {
                const distToChin = Math.hypot(h[0].x - faceLandmarks[152].x, h[0].y - faceLandmarks[152].y);
                if (distToChin < 0.12) {
                  detectedGesture = 'Chin';
                }
              }

              // 이마 짚기: 손이 이마 근처
              if (detectedGesture === 'None' && faceLandmarks && faceLandmarks[10]) {
                const distToForehead = Math.hypot(h[0].x - faceLandmarks[10].x, h[0].y - faceLandmarks[10].y);
                if (distToForehead < 0.12) {
                  detectedGesture = 'Forehead';
                }
              }

              // 손 흔들기 인사: 손바닥 + 얼굴 옆쪽 위치
              if (detectedGesture === 'None' && hG === 'Open_Palm' && h[0].y < 0.45) {
                detectedGesture = 'Wave';
              }

              // 기본 제스처 폴백
              if (detectedGesture === 'None') {
                if (hG === 'Thumbs_Up') {
                  detectedGesture = 'ThumbsUp';
                } else if (hG === 'Victory') {
                  detectedGesture = 'Peace';
                } else if (hG === 'Pointing_Up') {
                  detectedGesture = 'Point';
                } else if (hG === 'Open_Palm') {
                  detectedGesture = 'Palm';
                } else if (hG === 'Closed_Fist') {
                  detectedGesture = 'Fist';
                }
              }
            }

            // ═══════════════════════════════════════════════
            // B. 얼굴 표정 매핑 (20개) - 손 제스처 미감지 시
            // ═══════════════════════════════════════════════
            if (detectedGesture === 'None' && faceBlendshapes) {

              // ── 재미/특수 표정 (가장 먼저 체크, 독특한 트리거) ──
              if (tongueOut > 0.4) {
                // 혀 내밀기 → 자두 메롱
                detectedGesture = 'Tongue';
              }
              else if (mouthPucker > 0.5 && jawOpen < 0.15) {
                // 입술 쭉 내밈 + 입 닫힘 → 쪽쪽이
                detectedGesture = 'Kissy';
              }
              else if (mouthPucker > 0.4 && jawOpen < 0.1) {
                // 입술 내밈 (약간 낮은 임계값) → 핑구 삐침
                detectedGesture = 'Pout';
              }

              // ── 놀람/충격 ──
              else if (jawOpen > 0.5 && browUpAvg > 0.3 && smileAvg < 0.15) {
                // 입 크게 벌림 + 눈썹 올라감 + 미소 없음 → 피카츄 놀람
                detectedGesture = 'Shock';
              }
              else if (jawOpen > 0.35 && browInnerUp > 0.35 && mouthFrownAvg > 0.15) {
                // 입 벌림 + 눈썹 안쪽 올라감 + 입꼬리 처짐 → 곽튜브 억울
                detectedGesture = 'Gasp';
              }

              // ── 분노/짜증 ──
              else if (jawOpen > 0.45 && browDownAvg > 0.35 && smileAvg < 0.1) {
                // 입 크게 벌리고 + 눈썹 내림 → 호박고구마 소리지르기
                detectedGesture = 'Yell';
              }
              else if (browDownAvg > 0.45 && mouthFrownAvg > 0.2 && noseSneerAvg > 0.2 && smileAvg < 0.1) {
                // 눈썹 강하게 찌푸림 + 코 찡그림 + 입꼬리 처짐 → 고길동 혐오
                detectedGesture = 'Disgust';
              }
              else if (browDownAvg > 0.4 && jawOpen < 0.15 && smileAvg < 0.1) {
                // 눈썹 찌푸림 + 입 다문 상태 → 화난 고양이
                detectedGesture = 'Angry';
              }

              // ── 행복/기쁨 ──
              else if (smileAvg > 0.45 && eyeBlinkAvg > 0.45) {
                // 눈 감고 웃음 → 침착맨 킹받음 (비꼬는 미소)
                detectedGesture = 'Sarcastic';
              }
              else if (smileAvg > 0.5 && jawOpen > 0.25) {
                // 활짝 웃으며 입 벌림 → 무야호 큰 웃음
                detectedGesture = 'BigSmile';
              }
              else if ((smileLeft > 0.35 && smileRight < 0.12) || (smileRight > 0.35 && smileLeft < 0.12)) {
                // 한쪽 입꼬리만 올라감 → 히죽 웃음
                detectedGesture = 'Smirk';
              }
              else if (smileAvg > 0.3) {
                // 자연스러운 미소 → 짱구 능글 미소
                detectedGesture = 'Smile';
              }

              // ── 윙크 (비대칭 눈 깜빡임) ──
              else if ((eyeBlinkLeft > 0.5 && eyeBlinkRight < 0.2) || (eyeBlinkRight > 0.5 && eyeBlinkLeft < 0.2)) {
                detectedGesture = 'Wink';
              }

              // ── 슬픔 ──
              else if (browInnerUp > 0.35 && mouthFrownAvg > 0.2 && jawOpen > 0.15) {
                // 눈썹 안쪽 올림 + 입꼬리 처짐 + 입 살짝 벌림 → 울상
                detectedGesture = 'Cry';
              }
              else if (browDownAvg > 0.35 && mouthFrownAvg > 0.15 && smileAvg < 0.1) {
                // 눈썹 내림 + 입꼬리 처짐 → 슬픈 페페
                detectedGesture = 'Sad';
              }

              // ── 눈 관련 ──
              else if (eyeSquintAvg > 0.5 && smileAvg < 0.15) {
                // 눈 찡그림 + 미소 없음 → 의심 눈빛
                detectedGesture = 'Squint';
              }
              else if (eyeBlinkAvg > 0.6 && smileAvg < 0.1) {
                // 양쪽 눈 감김(깜빡임 감지) → 깜빡이 구이
                detectedGesture = 'Blink';
              }

              // ── 머리 회전 (사이드아이) ──
              else if (yawRatio < 0.55 || yawRatio > 1.8) {
                // 고개 돌림 → 사이드아이
                detectedGesture = 'SideEye';
              }

              // ── 표정 급변 (Freeze) ──
              // 이전에 강한 감정이 있다가 갑자기 무표정으로 전환 시
              // (이 판단은 포커페이스보다 우선; 별도의 이전 상태 추적 없이는 구현 어려우므로
              //  cheekPuff가 있을 때 대체 트리거로 사용)
              else if (cheekPuff > 0.4) {
                detectedGesture = 'Freeze';
              }

              // ── 무표정 기본 (포커페이스) ──
              // 위 모든 조건에 해당하지 않으면 포커페이스
              else if (faceBlendshapes && faceLandmarks && faceLandmarks.length > 0) {
                detectedGesture = 'Poker';
              }
            }

            onGestureDetected(detectedGesture);

            lastVideoTimeRef.current = videoTime;
            lastProcessingTimeRef.current = timestamp;
          } catch (err) {
            console.error('Inference error:', err);
          }
        }

        // 매 프레임(60fps) 클리어 & 캐시된 데이터를 기반으로 무조건 렌더링 (깜빡임 완벽 제거)
        if (ctx && width > 0 && height > 0) {
          drawScene(ctx, width, height);
        }
      }

      animationFrameRef.current = requestAnimationFrame(predictLoop);
    }

    predictLoop();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitializing, videoRef, canvasRef, onGestureDetected]);

  return { isInitializing, error };
}

