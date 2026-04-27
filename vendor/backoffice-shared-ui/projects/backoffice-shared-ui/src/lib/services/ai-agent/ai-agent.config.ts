import { InjectionToken, inject } from '@angular/core';
import { aiAgentEnvironments } from './config/ai-agent-environments';
import { UserPolicyPermission } from './ai-permissions-helper';

export interface AiAgentLoaderConfig {
  loaderUrl: string;
  apiUrl: string;
}

export type AgentEnvironment =
  | 'local'
  | 'development'
  | 'staging'
  | 'production'
  | 'production-ca'
  | 'ext-demo'
  | 'productiontest'
  | 'productiontest-ca';

export interface AiAgentConfig {
  agentEnvironment?: AgentEnvironment;
  policyPermissions: () => UserPolicyPermission | null;
  isSuperAdmin?: boolean | null;
}

export const AI_AGENT_CONFIG = new InjectionToken<AiAgentConfig>('AI_AGENT_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    policyPermissions: () => null
  })
});

function detectEnvironmentFromHostname(): AgentEnvironment | undefined {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('staging') || hostname.includes('stage')) {
      return 'staging';
    }

    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'local';
    }

    if (hostname.includes('dev')) {
      return 'development';
    }

    // Production (default for other hostnames)
    return 'production';
  }

  return undefined;
}

function getEnvironmentConfig(agentEnvironment?: AgentEnvironment): AiAgentLoaderConfig {
  if (agentEnvironment && agentEnvironment in aiAgentEnvironments) {
    return aiAgentEnvironments[agentEnvironment];
  }

  const detectedEnv = detectEnvironmentFromHostname();

  if (detectedEnv === undefined) {
    throw new Error('AI Agent environment not detected');
  }

  return aiAgentEnvironments[detectedEnv];
}

export const AI_AGENT_LOADER_CONFIG = new InjectionToken<AiAgentLoaderConfig>('AI_AGENT_LOADER_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const config = inject(AI_AGENT_CONFIG, { optional: true });
    const agentEnvironment = config?.agentEnvironment;

    const environmentConfig = getEnvironmentConfig(agentEnvironment);

    return environmentConfig;
  }
});
