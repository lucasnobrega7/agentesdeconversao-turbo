import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração principal do Playwright para testes E2E
 * Este arquivo define como os testes serão executados, incluindo timeouts,
 * dispositivos alvo, estratégias de retry e relatórios
 */
export default defineConfig({
  // Diretório onde estão localizados os arquivos de teste
  testDir: './tests/e2e',
  
  // Timeout máximo para cada teste individual (30 segundos)
  timeout: 30 * 1000,
  
  // Configurações de expectativas (assertions)
  expect: {
    // Timeout para cada assertion (5 segundos)
    timeout: 5000
  },
  
  // Executa testes em paralelo para melhor performance
  fullyParallel: true,
  
  // Número de tentativas em caso de falha
  retries: 1,
  
  // Configuração de relatórios
  reporter: [
    ['list'],  // Mostra progresso em lista no terminal
    ['html', { open: 'never' }]  // Gera relatório HTML mas não abre automaticamente
  ],
  
  // Configurações globais compartilhadas entre todos os testes
  use: {
    // URL base do aplicativo para testes locais
    baseURL: 'http://localhost:3000',
    
    // Captura traces apenas quando um teste falha na primeira tentativa
    trace: 'on-first-retry',
    
    // Grava vídeos apenas para testes que falharam
    video: 'retain-on-failure',
    
    // Captura screenshots apenas quando há falhas
    screenshot: 'only-on-failure'
  },
  
  // Define diferentes navegadores e dispositivos para teste
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    }
  ]
});
