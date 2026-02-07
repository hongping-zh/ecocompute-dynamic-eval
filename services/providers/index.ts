import { Provider, ProviderId } from '../types';
import { demoProvider } from './demo';
import { geminiProvider } from './gemini';
import { openaiProvider } from './openai';
import { groqProvider } from './groq';

/** Provider registry — add new providers here, zero changes to routing core */
const PROVIDER_REGISTRY: Record<ProviderId, Provider> = {
  demo: demoProvider,
  gemini: geminiProvider,
  openai: openaiProvider,
  groq: groqProvider,
};

export const getProvider = (id: ProviderId): Provider | undefined => PROVIDER_REGISTRY[id];
export const getAllProviders = (): Provider[] => Object.values(PROVIDER_REGISTRY);
export const getProviderIds = (): ProviderId[] => Object.keys(PROVIDER_REGISTRY) as ProviderId[];
