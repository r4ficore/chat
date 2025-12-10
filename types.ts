export interface Message {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  imageUrl?: string; // For generated or attached images
}

export type AppMode = 'CORE' | 'VISION' | 'STORY' | 'VALUE' | 'SCALE';

export enum ModelId {
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-3-pro-preview',
  DEEPSEEK_CHAT = 'deepseek-chat',
  DEEPSEEK_REASONER = 'deepseek-reasoner'
}

export const ModelLabels: Record<ModelId, string> = {
  [ModelId.GEMINI_FLASH]: 'Gemini 2.5 Flash',
  [ModelId.GEMINI_PRO]: 'Gemini 3 Pro',
  [ModelId.DEEPSEEK_CHAT]: 'DeepSeek V3',
  [ModelId.DEEPSEEK_REASONER]: 'DeepSeek R1'
};

export interface ImageGenerationSettings {
  model: 'flux-dev' | 'nano-banana';
  aspectRatio: 'auto' | '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  outputFormat: 'jpeg' | 'png' | 'webp';
  webSearch?: boolean;
}