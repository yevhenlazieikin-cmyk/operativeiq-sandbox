/**
 * Sandbox environment stub. Skills reference environment.CLIENT_API when
 * generating HTTP services; we keep the symbol so generated code compiles
 * even though there's no real backend running here.
 */
export const environment = {
  production: false,
  CLIENT_API: '/api',
  sandbox: true,
} as const;
