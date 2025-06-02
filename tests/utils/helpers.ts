import { Page, expect } from '@playwright/test';

/**
 * Utilitários compartilhados para testes E2E
 * 
 * Este arquivo contém funções auxiliares que simplificam operações
 * comuns nos testes, promovendo reutilização de código e mantendo
 * os testes mais limpos e focados em seu objetivo principal.
 * 
 * A criação de utilitários bem pensados é fundamental para a
 * manutenibilidade dos testes a longo prazo. Conforme o projeto
 * cresce, ter essas abstrações evita que mudanças na aplicação
 * exijam alterações em dezenas de arquivos de teste.
 */

/**
 * Realiza login no sistema com as credenciais fornecidas
 * 
 * Esta função encapsula o processo de login, que é necessário
 * em quase todos os testes. Se o processo de login mudar no
 * futuro (por exemplo, adicionando captcha ou 2FA), precisaremos
 * alterar apenas esta função.
 * 
 * @param page - Instância da página do Playwright
 * @param email - Email do usuário
 * @param password - Senha do usuário
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Aguarda o redirecionamento para o dashboard
  // O timeout maior aqui considera possíveis delays de rede
  await page.waitForURL(/dashboard/, { timeout: 10000 });
}

/**
 * Aguarda uma notificação aparecer e verifica seu conteúdo
 * 
 * Notificações (toasts) são elementos temporários que aparecem
 * e desaparecem. Esta função garante que conseguimos capturar
 * e verificar seu conteúdo antes que desapareçam.
 * 
 * @param page - Instância da página
 * @param text - Texto esperado na notificação
 * @param type - Tipo da notificação (success, error, warning, info)
 */
export async function expectNotification(
  page: Page, 
  text: string, 
  type: 'success' | 'error' | 'warning' | 'info' = 'success'
) {
  const selector = `.${type}-toast, .${type}-notification`;
  const notification = page.locator(selector);
  
  // Aguarda a notificação aparecer
  await expect(notification).toBeVisible({ timeout: 5000 });
  
  // Verifica o conteúdo
  await expect(notification).toContainText(text);
  
  // Opcionalmente, aguarda a notificação desaparecer
  // Isso evita que ela interfira em interações subsequentes
  await expect(notification).not.toBeVisible({ timeout: 10000 });
}

/**
 * Aguarda o carregamento completo de dados
 * 
 * Muitas aplicações modernas carregam dados assincronamente.
 * Esta função aguarda indicadores comuns de que o carregamento
 * foi concluído, como spinners desaparecendo ou dados aparecendo.
 * 
 * @param page - Instância da página
 * @param options - Opções de configuração
 */
export async function waitForDataLoad(
  page: Page,
  options: {
    timeout?: number;
    waitForSelector?: string;
    waitForLoadState?: boolean;
  } = {}
) {
  const { 
    timeout = 15000, 
    waitForSelector,
    waitForLoadState = true 
  } = options;
  
  // Aguarda spinners/loaders desaparecerem
  const loaders = page.locator('.loader, .spinner, .loading, [data-loading="true"]');
  const loaderCount = await loaders.count();
  
  if (loaderCount > 0) {
    await expect(loaders.first()).not.toBeVisible({ timeout });
  }
  
  // Se especificado, aguarda um seletor específico
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { 
      state: 'visible', 
      timeout 
    });
  }
  
  // Aguarda o estado de rede ficar idle
  if (waitForLoadState) {
    await page.waitForLoadState('networkidle', { timeout });
  }
}

/**
 * Cria um agente de teste com configurações padrão
 * 
 * Muitos testes precisam de um agente para trabalhar. Esta
 * função cria um agente com configurações consistentes,
 * facilitando a preparação dos testes.
 * 
 * @param page - Instância da página
 * @param name - Nome do agente (opcional, gera um único se não fornecido)
 * @returns ID do agente criado
 */
export async function createTestAgent(
  page: Page, 
  name?: string
): Promise<string> {
  const agentName = name || `Test Agent ${Date.now()}`;
  
  await page.goto('/agents');
  await page.click('button:has-text("Criar Agente")');
  
  // Preenche o formulário
  await page.fill('[name="name"]', agentName);
  await page.fill('[name="description"]', 'Agente criado automaticamente para testes E2E');
  await page.selectOption('[name="template"]', 'vendas');
  
  // Submete
  await page.click('button:has-text("Criar")');
  
  // Aguarda redirecionamento e captura o ID da URL
  await page.waitForURL(/agents\/([a-zA-Z0-9]+)/);
  const url = page.url();
  const agentId = url.match(/agents\/([a-zA-Z0-9]+)/)?.[1] || '';
  
  return agentId;
}

/**
 * Limpa dados de teste após a execução
 * 
 * É importante que os testes não deixem sujeira no banco de dados.
 * Esta função remove entidades criadas durante os testes.
 * 
 * @param page - Instância da página
 * @param agentId - ID do agente a ser removido
 */
export async function cleanupTestAgent(page: Page, agentId: string) {
  await page.goto(`/agents/${agentId}`);
  
  // Abre menu de ações
  await page.click('button[aria-label="Mais ações"]');
  await page.click('button:has-text("Excluir Agente")');
  
  // Confirma exclusão
  const confirmModal = page.locator('.confirm-delete-modal');
  await expect(confirmModal).toBeVisible();
  await confirmModal.locator('button:has-text("Confirmar Exclusão")').click();
  
  // Verifica redirecionamento
  await page.waitForURL(/agents$/);
  await expectNotification(page, 'Agente excluído com sucesso');
}

/**
 * Simula diferentes tamanhos de tela para testes responsivos
 * 
 * É crucial testar como a aplicação se comporta em diferentes
 * dispositivos. Esta função facilita a mudança de viewport.
 * 
 * @param page - Instância da página
 * @param device - Tipo de dispositivo a simular
 */
export async function setDevice(
  page: Page, 
  device: 'mobile' | 'tablet' | 'desktop'
) {
  const viewports = {
    mobile: { width: 375, height: 667 },    // iPhone SE
    tablet: { width: 768, height: 1024 },   // iPad
    desktop: { width: 1920, height: 1080 }  // Full HD
  };
  
  await page.setViewportSize(viewports[device]);
}

/**
 * Captura e salva screenshot para debugging
 * 
 * Screenshots são valiosas para entender falhas em testes,
 * especialmente em ambientes CI/CD onde não temos acesso
 * visual direto.
 * 
 * @param page - Instância da página
 * @param name - Nome descritivo para o screenshot
 */
export async function captureDebugScreenshot(
  page: Page, 
  name: string
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `debug-${name}-${timestamp}.png`;
  
  await page.screenshot({ 
    path: `./test-results/${filename}`,
    fullPage: true 
  });
  
  console.log(`Screenshot salvo: ${filename}`);
}

/**
 * Aguarda e verifica mudanças em tempo real
 * 
 * Para funcionalidades que atualizam em tempo real (via WebSocket
 * ou polling), esta função facilita a verificação de que as
 * atualizações estão ocorrendo.
 * 
 * @param page - Instância da página
 * @param selector - Seletor do elemento a monitorar
 * @param expectedChange - Função que verifica se a mudança ocorreu
 * @param timeout - Tempo máximo de espera
 */
export async function waitForRealtimeUpdate(
  page: Page,
  selector: string,
  expectedChange: (oldValue: string | null, newValue: string | null) => boolean,
  timeout: number = 30000
) {
  const element = page.locator(selector);
  const initialValue = await element.textContent();
  
  await page.waitForFunction(
    ({ selector, initialValue, expectedChange }) => {
      const el = document.querySelector(selector);
      const currentValue = el?.textContent || null;
      
      // Converte a string da função de volta para função
      const checkChange = new Function('oldValue', 'newValue', 
        `return ${expectedChange}`
      );
      
      return checkChange(initialValue, currentValue);
    },
    { 
      selector, 
      initialValue, 
      expectedChange: expectedChange.toString() 
    },
    { timeout, polling: 500 }
  );
}

/**
 * Gera dados de teste únicos
 * 
 * Testes devem ser independentes e não conflitar entre si.
 * Usar dados únicos previne problemas quando testes rodam
 * em paralelo ou quando re-executamos testes.
 */
export const testData = {
  /**
   * Gera um email único para testes
   */
  generateEmail: () => `test.${Date.now()}@e2e-tests.com`,
  
  /**
   * Gera um nome de agente único
   */
  generateAgentName: () => `Agent E2E ${Date.now()}`,
  
  /**
   * Gera um nome de usuário único
   */
  generateUsername: () => `User_${Math.random().toString(36).substr(2, 9)}`,
  
  /**
   * Dados padrão de teste que podem ser reutilizados
   */
  defaults: {
    password: 'TestPassword123!',
    agentTemplate: 'vendas',
    businessType: 'ecommerce'
  }
};
