import { jwtDecode } from 'jwt-decode';
import { AIAuthCookie, AiSettingsDto } from './ai-token.service';
import { AI_AGENT_COOKIE_NAME } from './ai-agent.constants';
import { MessageService } from '../messages.service';

export function getAiSettingsClaimFromToken(jwtToken: string, messageService?: MessageService): string | null {
  try {
    const decoded = jwtDecode<{ AISiteSettings?: string }>(jwtToken);

    return decoded.AISiteSettings ?? null;
  } catch (error) {
    console.error(messageService?.get('FAILED_DECODE_JWT_TOKEN'), error);

    return null;
  }
}

export function getAiUserClaims(aiJson: string, messageService?: MessageService): string[] {
  if (!aiJson) {
    return [];
  }

  try {
    const dto = JSON.parse(aiJson) as AiSettingsDto;
    if (dto?.AllowedFeatures && Array.isArray(dto.AllowedFeatures) && dto.AllowedFeatures.length > 0) {
      return dto.AllowedFeatures;
    }
  } catch (error) {
    console.error(messageService?.get('FAILED_PARSE_AI_SETTINGS_JSON'), error);
  }

  return [];
}

export function hasEnabledAiAssistant(cookieValue: string, messageService?: MessageService): boolean {
  if (!cookieValue) {
    return false;
  }

  try {
    const decodedValue = decodeURIComponent(cookieValue);
    const cookieData = JSON.parse(decodedValue) as AIAuthCookie;

    if (!cookieData?.Token) {
      return false;
    }

    const aiJson = getAiSettingsClaimFromToken(cookieData.Token, messageService);
    if (!aiJson) {
      return false;
    }

    const allowedFeatures = getAiUserClaims(aiJson, messageService);

    return allowedFeatures.length > 0;
  } catch (error) {
    console.error(messageService?.get('FAILED_CHECK_AI_ASSISTANT_COOKIE'), error);

    return false;
  }
}

export function getAiAgentCookieValue(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === AI_AGENT_COOKIE_NAME && value) {
      return value;
    }
  }

  return null;
}
