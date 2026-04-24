import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { MessageService } from '../messages.service';
import { AI_AGENT_CONFIG, AI_AGENT_LOADER_CONFIG } from './ai-agent.config';
import { AI_AGENT_COOKIE_NAME, AI_AGENT_TOKEN_DEFER_DELAY } from './ai-agent.constants';
import { getAiAgentCookieValue, hasEnabledAiAssistant } from './ai-claims-helper';

export interface AiTokenResponse {
  Customer?: {
    SiteId?: number;
    Identifier?: string;
    Company?: string | null;
  };
  Token?: string;
  access_token?: string;
  refresh_token?: string | null;
  refreshToken?: string | null;
  Expiration?: string;
  expires_in?: number;
  Initiated?: string;
  FirstName?: string;
  LastName?: string;
  UserId?: number;
  IsSuperAdmin?: boolean | null;
  SuperAdminGroupId?: number | null;
}

export interface AiTokenData {
  token: string;
  expiration?: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
  modulesPermissions?: Record<string, unknown>;
}

export interface AiSettingsDto {
  AllowedFeatures?: string[];
}

export interface AIAuthCookie {
  Token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiTokenService {
  private readonly http = inject(HttpClient);
  private readonly aiAgentLoaderConfig = inject(AI_AGENT_LOADER_CONFIG);
  private readonly messageService = inject(MessageService);
  private readonly aiAgentConfig = inject(AI_AGENT_CONFIG);

  public checkAiAgentCookieAndClaims(): Observable<boolean> {
    const cookieValue = getAiAgentCookieValue();

    if (cookieValue) {
      const hasEnabled = hasEnabledAiAssistant(cookieValue, this.messageService);

      return of(hasEnabled);
    }

    return this.getAiToken().pipe(
      switchMap(() => {
        const newCookieValue = getAiAgentCookieValue();

        if (newCookieValue) {
          return of(hasEnabledAiAssistant(newCookieValue, this.messageService));
        }

        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  public getAiToken(): Observable<AiTokenData> {
    const cookieTokenData = this.getTokenFromCookie();

    if (cookieTokenData) {
      // Use timer(0) to defer execution to next event loop tick
      // This ensures the widget library is ready to receive postMessage
      // Without this delay, postMessage may be sent before the iframe is ready
      return timer(AI_AGENT_TOKEN_DEFER_DELAY).pipe(map(() => cookieTokenData));
    }

    // Extract base URL (protocol + domain) from current page
    const baseUrl = window.location.origin;
    const environment = this.aiAgentConfig.agentEnvironment;

    const apiUrl = environment !== 'local' ? `${baseUrl}${this.aiAgentLoaderConfig.apiUrl}` : this.aiAgentLoaderConfig.apiUrl;

    return this.http
      .get<AiTokenResponse>(`${apiUrl}/AiToken`, {
        withCredentials: true
      })
      .pipe(
        map(response => {
          const tokenData = this.mapTokenResponse(response);

          if (!tokenData) {
            throw new Error(this.messageService.get('FAILED_GET_AI_TOKEN_INVALID_FORMAT'));
          }

          return tokenData;
        })
      );
  }

  private getTokenFromCookie(): AiTokenData | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');
    let cookieValue: string | null = null;

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === AI_AGENT_COOKIE_NAME) {
        cookieValue = decodeURIComponent(value);
        break;
      }
    }

    if (!cookieValue) {
      return null;
    }

    try {
      const response = JSON.parse(cookieValue) as AiTokenResponse;

      return this.mapTokenResponse(response);
    } catch (error) {
      console.error(this.messageService.get('FAILED_DECODE_TOKEN_DATA_COOKIE'), error);

      return null;
    }
  }

  /**
   * Maps AiTokenResponse to AiTokenData
   * @param response - The token response from API or cookie
   * @returns Mapped token data or null if token is missing
   */
  private mapTokenResponse(response: AiTokenResponse): AiTokenData | null {
    try {
      if (response.Token || response.access_token) {
        const token = response.Token || response.access_token || '';

        if (!token) {
          return null;
        }

        return {
          token,
          expiration: response.Expiration,
          firstName: response.FirstName,
          lastName: response.LastName,
          userId: response.UserId
        };
      }

      return null;
    } catch (error) {
      console.error(this.messageService.get('FAILED_DECODE_TOKEN_DATA_COOKIE'), error);

      return null;
    }
  }
}
