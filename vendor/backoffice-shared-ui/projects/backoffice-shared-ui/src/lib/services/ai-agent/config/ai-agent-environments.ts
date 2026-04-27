import { AgentEnvironment } from '../ai-agent.config';

export interface AiAgentEnvironment {
  loaderUrl: string;
  apiUrl: string;
}

export const aiAgentEnvironments: Record<AgentEnvironment, AiAgentEnvironment> = {
  local: {
    loaderUrl: 'http://localhost:8080/embedded-ai.min.js',
    apiUrl: 'https://localhost:7162'
  },
  development: {
    loaderUrl: 'https://assistant-dev.opiq.site',
    apiUrl: '/api/task-list'
  },
  staging: {
    loaderUrl: 'https://assistant-staging.opiq.site',
    apiUrl: '/api/task-list'
  },
  production: {
    loaderUrl: 'https://assistant.operativeiq.com',
    apiUrl: '/api/task-list'
  },
  'production-ca': {
    loaderUrl: 'https://assistant-ca.operativeiq.com',
    apiUrl: '/api/task-list'
  },
  'ext-demo': {
    loaderUrl: 'https://assistant-staging.opiq.site',
    apiUrl: '/api/task-list'
  },
  productiontest: {
    loaderUrl: 'https://assistant-productiontest.operativeiq.com',
    apiUrl: '/api/task-list'
  },
  'productiontest-ca': {
    loaderUrl: 'https://assistant-productiontest-ca.operativeiq.com',
    apiUrl: '/api/task-list'
  }
};
