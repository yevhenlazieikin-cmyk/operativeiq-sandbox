import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MessageService } from '../messages.service';
import { AI_AGENT_LOADER_CONFIG } from './ai-agent.config';
import { AiWidget, AIChatWidgetConstructor } from './ai-context.service';

declare global {
  interface Window {
    aiWidget?: AiWidget;
    AIChatWidget?: AIChatWidgetConstructor;
  }
}

export interface AiWidgetConfig {
  authToken?: string;
  pageTitle?: string;
  moduleName?: string;
  userName?: string;
  currentPage?: string;
  modulesPermissions?: any;
  clientTokenExpiration?: number;
  embeddedConfig?: {
    buttonContainer?: string;
    widgetContainer?: string;
    openWidgetCB?: (successFn: () => void, errorFn: () => void) => void;
    closeWidgetCB?: () => void;
    initWidgetCB?: () => void;
    sizeChangedCB?: (data: any) => void;
    exceptionHandler?: (data: any) => void;
    redirectToKnowledgeCenter?: (url: string) => void;
    iframeURLParams?: Record<string, any>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiAgentService {
  private readonly document = inject(DOCUMENT);
  private readonly loaderConfig = inject(AI_AGENT_LOADER_CONFIG);
  private readonly messageService = inject(MessageService);
  private scriptLoaded = false;
  private widgetInitialized = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Gets the configured loader URL
   */
  public getLoaderUrl(): string {
    return this.loaderConfig.loaderUrl;
  }

  /**
   * Loads the AI widget script dynamically
   */
  public loadScript(loaderUrl?: string): Promise<void> {
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const urlToLoad = loaderUrl || this.loaderConfig.loaderUrl;

    this.loadPromise = new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        this.loadPromise = null;
        reject(new Error(`${this.messageService.get('FAILED_LOAD_AI_AGENT_SCRIPT')} ${urlToLoad}`));
      };

      script.src = urlToLoad;
      this.document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Initializes the AI widget with the provided configuration
   */
  public initializeWidget(config: AiWidgetConfig): void {
    if (this.widgetInitialized) {
      return;
    }

    try {
      // Script should be loaded before calling this
      if (!this.scriptLoaded) {
        throw new Error(this.messageService.get('AI_AGENT_SCRIPT_MUST_BE_LOADED'));
      }

      // Check if AIChatWidget class is available
      if (!window.AIChatWidget) {
        throw new Error(this.messageService.get('AI_CHAT_WIDGET_CLASS_NOT_FOUND'));
      }

      // Initialize the widget
      window.aiWidget = new window.AIChatWidget(config);
      this.widgetInitialized = true;
    } catch (error) {
      console.error(this.messageService.get('FAILED_INITIALIZE_AI_WIDGET'), error);
      throw error;
    }
  }

  /**
   * Gets the current AI widget instance
   */
  public getWidget(): AiWidget | undefined {
    return window.aiWidget;
  }

  /**
   * Checks if the widget is initialized
   */
  public isInitialized(): boolean {
    return this.widgetInitialized && !!window.aiWidget;
  }

  /**
   * Resets the service state (useful for testing)
   */
  public reset(): void {
    this.scriptLoaded = false;
    this.widgetInitialized = false;
    this.loadPromise = null;
    window.aiWidget = undefined;
  }
}
