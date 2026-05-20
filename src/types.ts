export interface HeadPose {
  tiltAngle: number; // degrees
  label: string;
}

export interface EyeState {
  leftOpenness: number;
  rightOpenness: number;
  label: string;
}

export interface MouthState {
  openness: number;
  widthRatio: number;
  label: string;
}

export interface BiomechanicalMetrics {
  headPose: HeadPose;
  browOpenness: {
    leftBrowHeight: number;
    rightBrowHeight: number;
    browSqueeze: number;
    label: string;
  };
  eyeRatio: EyeState;
  mouthRatio: MouthState;
  smileCoefficient: {
    smileLeft: number;
    smileRight: number;
    smileAvg: number;
    label: string;
  };
}

export interface LandmarkAnalysis {
  faceFound: boolean;
  landmarksCount: number;
  simplifiedData?: BiomechanicalMetrics;
}

export interface GeneratedResult {
  prompt: string;
  landmarkAnalysis?: LandmarkAnalysis;
  imageUrl: string;
}
