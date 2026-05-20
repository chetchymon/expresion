import { BiomechanicalMetrics } from "../types";

// Standard Euclidean distance helper
function distance(p1: { x: number; y: number; z?: number }, p2: { x: number; y: number; z?: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z !== undefined && p2.z !== undefined) ? p1.z - p2.z : 0;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates high-level biometric metrics from MediaPipe 468/478 Face Mesh landmarks.
 * Normalized coordinates are typically values between 0.0 and 1.0.
 */
export function calculateBiomechanicalMetrics(landmarks: any[]): BiomechanicalMetrics {
  // Key points based on standard MediaPipe indices:
  // Forehead/Hairline: 10, Chin tip: 152
  // Eyes left: inner 133, outer 33, upper lid 159, lower lid 145
  // Eyes right: inner 263, outer 362, upper lid 386, lower lid 374
  // Eyebrows left: inner 70, outer 105, center 52
  // Eyebrows right: inner 300, outer 334, center 282
  // Mouth corners: left 61, right 291, upper lip 13, lower lip 14
  
  const p10 = landmarks[10];
  const p152 = landmarks[152];
  const faceHeight = distance(p10, p152);

  const p133 = landmarks[133];
  const p33 = landmarks[33];
  const p159 = landmarks[159];
  const p145 = landmarks[145];

  const p263 = landmarks[263];
  const p362 = landmarks[362];
  const p386 = landmarks[386];
  const p374 = landmarks[374];

  const p70 = landmarks[70];
  const p105 = landmarks[105];
  const p52 = landmarks[52] || landmarks[70];

  const p300 = landmarks[300];
  const p334 = landmarks[334];
  const p282 = landmarks[282] || landmarks[300];

  const p61 = landmarks[61];
  const p291 = landmarks[291];
  const p13 = landmarks[13];
  const p14 = landmarks[14];

  // 1. Head Pose (tilt estimation via eyes)
  const dy = p362.y - p33.y;
  const dx = p362.x - p33.x;
  const tiltAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  let headPoseLabel = "Straight / Level";
  if (tiltAngle > 8) headPoseLabel = "Tilted Right";
  else if (tiltAngle < -8) headPoseLabel = "Tilted Left";
  else if (Math.abs(tiltAngle) > 3) headPoseLabel = "Subtle Tilt";

  // 2. Eye Aspect Ratio (squint / wide open indicator)
  const eyeLeftHeight = distance(p159, p145);
  const eyeLeftWidth = distance(p133, p33);
  const leftOpenness = eyeLeftHeight / (eyeLeftWidth || 1);

  const eyeRightHeight = distance(p386, p374);
  const eyeRightWidth = distance(p263, p362);
  const rightOpenness = eyeRightHeight / (eyeRightWidth || 1);

  const avgEyeOpenness = (leftOpenness + rightOpenness) / 2;
  let eyeLabel = "Relaxed / Normal";
  if (avgEyeOpenness < 0.18) eyeLabel = "Squintey / Narrowed / Nearly Closed";
  else if (avgEyeOpenness > 0.32) eyeLabel = "Wide-eyed / Staring / Surprised";
  else if (Math.abs(leftOpenness - rightOpenness) > 0.08) eyeLabel = "Winking / Asymmetrical Squint";

  // 3. Eyebrow level / tension
  // Distance from eyebrows to eye centers normalized by face height
  const leftEyeCenter = { x: (p133.x + p33.x) / 2, y: (p133.y + p33.y) / 2, z: (p133.z + p33.z) / 2 };
  const rightEyeCenter = { x: (p263.x + p362.x) / 2, y: (p263.y + p362.y) / 2, z: (p263.z + p362.z) / 2 };

  const leftBrowHeight = distance(p52, leftEyeCenter) / (faceHeight || 1);
  const rightBrowHeight = distance(p282, rightEyeCenter) / (faceHeight || 1);
  const browSqueeze = distance(p70, p300) / (faceHeight || 1); // distance between inner brows

  const avgBrowHeight = (leftBrowHeight + rightBrowHeight) / 2;
  let browLabel = "Standard position";
  if (avgBrowHeight > 0.18) browLabel = "Highly Raised / Expressive";
  else if (avgBrowHeight < 0.11) browLabel = "Furrowed / Lowered / Angry or Concentrating";
  else if (Math.abs(leftBrowHeight - rightBrowHeight) > 0.04) browLabel = "Asymmetrical / Skeptical Raised Eyebrow";

  // 4. Mouth Openness & stretch ratio
  const mouthHeight = distance(p13, p14);
  const mouthWidth = distance(p61, p291);
  const mouthRatio = mouthHeight / (mouthWidth || 1);
  const mouthWidthNormalized = mouthWidth / (faceHeight || 1);

  let mouthLabel = "Neutral / Closed";
  if (mouthRatio > 0.6) mouthLabel = "Yawning / Gasping / Wide Open";
  else if (mouthRatio > 0.25) mouthLabel = "Partially Open / Speaking";
  else if (mouthWidthNormalized > 0.35) mouthLabel = "Lips Stretched Extremely Wide";
  else if (mouthWidthNormalized < 0.22) mouthLabel = "Pursed / Tightened / Displeased";

  // 5. Smile Coefficient (tilt up of mouth corners relative to top lip midpoint)
  // If corners are higher (lower y pixel value) than top lip midpoint
  const mouthCenterY = p13.y;
  const smileLeft = (mouthCenterY - p61.y) / (faceHeight || 1);
  const smileRight = (mouthCenterY - p291.y) / (faceHeight || 1);
  const smileAvg = (smileLeft + smileRight) / 2;

  let smileLabel = "Neutral Flat";
  if (smileAvg > 0.02) smileLabel = "Grinning / Pronounced Smiling";
  else if (smileAvg > 0.005) smileLabel = "Subtle Smile";
  else if (smileAvg < -0.015) smileLabel = "Frowning / Grimacing / Sad Lip Turn";

  return {
    headPose: {
      tiltAngle: parseFloat(tiltAngle.toFixed(1)),
      label: headPoseLabel
    },
    browOpenness: {
      leftBrowHeight: parseFloat(leftBrowHeight.toFixed(3)),
      rightBrowHeight: parseFloat(rightBrowHeight.toFixed(3)),
      browSqueeze: parseFloat(browSqueeze.toFixed(3)),
      label: browLabel
    },
    eyeRatio: {
      leftOpenness: parseFloat(leftOpenness.toFixed(3)),
      rightOpenness: parseFloat(rightOpenness.toFixed(3)),
      label: eyeLabel
    },
    mouthRatio: {
      openness: parseFloat(mouthRatio.toFixed(3)),
      widthRatio: parseFloat(mouthWidthNormalized.toFixed(3)),
      label: mouthLabel
    },
    smileCoefficient: {
      smileLeft: parseFloat(smileLeft.toFixed(3)),
      smileRight: parseFloat(smileRight.toFixed(3)),
      smileAvg: parseFloat(smileAvg.toFixed(3)),
      label: smileLabel
    }
  };
}
