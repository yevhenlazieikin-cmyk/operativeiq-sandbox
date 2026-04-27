import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MessageService } from '../messages.service';

export interface AiContext {
  title?: string;
  moduleName?: string;
  currentPage?: string;
}

export interface AiTokenContext {
  authToken: string;
  pageTitle?: string;
  moduleName?: string;
  userName?: string;
  currentPage?: string;
  modulesPermissions?: string | Record<string, unknown>;
  clientTokenExpiration?: number;
}

export interface AiWidget {
  updateContext?: (context: AiContext | AiTokenContext | string) => void;
  getCurrentPage?: (url: string) => void;
  onMessageFromChatbot?: (callback: (data: string) => void) => void;
}

export type AIChatWidgetConstructor = new (config: any) => AiWidget;

export enum MessageType {
  StringType = 'String',
  Field = 'Field',
  URL = 'URL',
  Function = 'Function',
  Other = 'Other',
  Clipboard = 'Clipboard',
  Action = 'Action',
  ContextSynchronization = 'ContextSynchronization',
  WidgetSystemAction = 'WidgetSystemAction',
  ThrowException = 'ThrowException',
  AppLoaded = 'AppLoaded',
  ChangeHeader = 'ChangeHeader',
  ErrorNotification = 'ErrorNotification',
  KnowledgeCenterRedirect = 'KnowledgeCenterRedirect',
  NavigateToHomePage = 'NavigateToHomePage',
  StartOverChat = 'StartOverChat',
  StartOverAck = 'StartOverAck',
  StartOverClose = 'StartOverClose',
  HighlightField = 'HighlightField',
  GetCurrentPage = 'GetCurrentPage',
  ExpandSidebar = 'ExpandSidebar',
  CollapseSidebar = 'CollapseSidebar',
  SaveWorkOrder = 'SaveWorkOrder',
  FieldsLoaded = 'FieldsLoaded',
  OnSaveWorkOrder = 'OnSaveWorkOrder',
  NavigateToApp = 'NavigateToApp',
  FileUpload = 'FileUpload',
  GetNewContext = 'GetNewContext',
  UpdateNotifier = 'UpdateNotifier',
  ShowPopup = 'ShowPopup',
  UploadProgress = 'UploadProgress'
}

export enum ActionType {
  Focus = 'Focus',
  Open = 'Open'
}

export interface IContext {
  selector: string;
  action: ActionType;
}

export interface IMessage {
  type: MessageType;
  value: string | string[] | Record<string, any>;
  payload?: IMessage[];
}

declare global {
  interface Window {
    aiWidget?: AiWidget;
    AIChatWidget?: AIChatWidgetConstructor;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AiContextService {
  private readonly document = inject(DOCUMENT);
  private readonly messageService = inject(MessageService);

  private moduleName = '';

  public loadContext(): void {
    try {
      if (!window.aiWidget) {
        return;
      }

      const pageTitle = this.getPageTitle();
      const moduleName = this.getModuleName();
      const currentPage = window.location.href;

      const context: AiContext = {};
      if (pageTitle) {
        context.title = pageTitle.trim();
      }
      if (moduleName) {
        context.moduleName = moduleName.trim();
      }
      if (currentPage) {
        context.currentPage = currentPage.trim();
      }

      if (Object.keys(context).length > 0 && window.aiWidget.updateContext) {
        window.aiWidget.updateContext(context);
      }
    } catch (error) {
      console.error(this.messageService.get('AI_WIDGET_UPDATE_CONTEXT_FAILED'), error);
    }
  }

  public updateContextWithToken(tokenContext: AiTokenContext): void {
    try {
      if (!window.aiWidget || !window.aiWidget.updateContext) {
        return;
      }

      const pageTitle = this.getPageTitle();
      const moduleName = this.getModuleName();
      const currentPage = window.location.href;

      const modulesPermissionsValue =
        typeof tokenContext.modulesPermissions === 'string'
          ? tokenContext.modulesPermissions
          : JSON.stringify(tokenContext.modulesPermissions || {});

      window.aiWidget.updateContext({
        authToken: tokenContext.authToken,
        pageTitle,
        moduleName,
        userName: tokenContext.userName || '',
        currentPage,
        modulesPermissions: modulesPermissionsValue,
        clientTokenExpiration: tokenContext.clientTokenExpiration
      });
    } catch (error) {
      console.error(this.messageService.get('AI_WIDGET_UPDATE_CONTEXT_TOKEN_FAILED'), error);
    }
  }

  public aiCheckLocalStorage(): void {
    try {
      if (!window.aiWidget) {
        return;
      }

      const messagePayload = localStorage.getItem('messagePayload');
      if (messagePayload) {
        this.typeHandler(messagePayload);
        localStorage.removeItem('messagePayload');
      }

      if (window.aiWidget.onMessageFromChatbot) {
        window.aiWidget.onMessageFromChatbot((data: string) => this.typeHandler(data));
      }
    } catch (error) {
      this.processAIException(error);
    }
  }

  public processAIException(error: unknown): void {
    try {
      console.error(this.messageService.get('AI_EXCEPTION_HANDLER_ERROR'), error);
    } catch (e) {
      console.error(this.messageService.get('FAILED_PROCESS_AI_EXCEPTION'), e);
    }
  }

  public getPageTitle(): string {
    const contitleElement = this.document.querySelector('.action-panel .panel-title');

    if (contitleElement) {
      return contitleElement?.textContent?.trim() || '';
    }

    const titleElement = this.document.querySelector('title');

    return titleElement?.textContent?.trim() || '';
  }

  public setModuleName(moduleName: string): void {
    this.moduleName = moduleName;
  }

  public getModuleName(): string {
    return this.moduleName;
  }

  private testJSON(text: string): boolean {
    if (typeof text !== 'string') {
      return false;
    }
    try {
      JSON.parse(text);

      return true;
    } catch {
      return false;
    }
  }

  private typeHandler(data: string): void {
    if (!this.testJSON(data)) {
      return;
    }

    try {
      const messages: IMessage[] = JSON.parse(data);
      [...messages].forEach((message: IMessage) => {
        switch (message.type) {
          case MessageType.ContextSynchronization:
            this.loadContext();
            break;
          case MessageType.GetCurrentPage:
            if (window.aiWidget?.getCurrentPage) {
              window.aiWidget.getCurrentPage(window.location.href);
            }
            break;
          case MessageType.URL:
            if (message.payload) {
              localStorage.setItem('messagePayload', JSON.stringify(message.payload));
            }
            if (typeof message.value === 'object' && 'url' in message.value) {
              const url = (message.value as { url: string }).url;
              location.assign(url);
            }
            break;
          case MessageType.Function:
            if (Array.isArray(message.value)) {
              const funcArray = message.value as string[];
              setTimeout(() => {
                funcArray.forEach((func: string) => {
                  eval(func);
                });
              });
            }
            break;
          case MessageType.HighlightField:
          case MessageType.Clipboard:
            break;
          default:
            console.log('Unhandled message type:', message.type, message);
            break;
        }
      });
    } catch (error) {
      console.error(this.messageService.get('ERROR_HANDLING_AI_MESSAGE'), error);
    }
  }
}
