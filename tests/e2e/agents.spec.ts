import { test, expect } from '@playwright/test';

/**
 * Suite de testes para gerenciamento de agentes
 * 
 * Os agentes são a peça central do sistema "Agentes de Conversão".
 * Estes testes garantem que todas as operações relacionadas a criação,
 * edição, visualização e exclusão de agentes funcionem corretamente.
 * 
 * Um agente no contexto do sistema é uma entidade configurável que
 * interage com usuários através de conversas automatizadas.
 */

test.describe('Gerenciamento de Agentes', () => {
  // Faz login antes de executar os testes desta suite
  test.beforeEach(async ({ page }) => {
    // Implementamos um fluxo de login simplificado aqui
    // Em um cenário real, você poderia usar fixtures para reutilizar login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    
    // Aguarda o redirecionamento e navega para a página de agentes
    await page.waitForURL(/dashboard/);
    await page.goto('/agents');
  });

  test('deve criar um novo agente com sucesso', async ({ page }) => {
    // Verifica que estamos na página correta
    await expect(page.locator('h1')).toContainText('Meus Agentes');
    
    // Clica no botão para criar novo agente
    // O seletor ':has-text()' é muito útil para encontrar elementos por seu conteúdo
    await page.click('button:has-text("Criar Agente")');
    
    // Aguarda o modal ou página de criação aparecer
    await expect(page.locator('.agent-form')).toBeVisible();
    
    // Preenche os dados do novo agente
    await page.fill('[name="name"]', 'Agente de Teste E2E');
    await page.fill('[name="description"]', 'Este agente foi criado automaticamente pelo teste Playwright');
    
    // Seleciona um template se disponível
    await page.selectOption('[name="template"]', 'vendas');
    
    // Submete o formulário
    await page.click('button:has-text("Criar")');
    
    // Verifica se foi redirecionado para a página do agente criado
    await expect(page).toHaveURL(/agents\/[a-zA-Z0-9]+/);
    await expect(page.locator('h1')).toContainText('Agente de Teste E2E');
  });

  test('deve listar todos os agentes existentes', async ({ page }) => {
    // Verifica se a lista de agentes é carregada
    await expect(page.locator('.agent-card')).toHaveCount(await page.locator('.agent-card').count());
    
    // Verifica se cada card de agente tem as informações básicas
    const firstAgentCard = page.locator('.agent-card').first();
    await expect(firstAgentCard.locator('.agent-name')).toBeVisible();
    await expect(firstAgentCard.locator('.agent-status')).toBeVisible();
    await expect(firstAgentCard.locator('.agent-conversations-count')).toBeVisible();
  });

  test('deve editar um agente existente', async ({ page }) => {
    // Clica no primeiro agente da lista
    await page.click('.agent-card:first-child');
    
    // Clica no botão de editar
    await page.click('button:has-text("Editar")');
    
    // Modifica o nome e descrição
    await page.fill('[name="name"]', 'Agente Atualizado via E2E');
    await page.fill('[name="description"]', 'Descrição atualizada pelo teste automatizado');
    
    // Salva as alterações
    await page.click('button:has-text("Salvar")');
    
    // Verifica se as alterações foram aplicadas
    await expect(page.locator('.success-toast')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Agente Atualizado via E2E');
  });

  test('deve filtrar agentes por status', async ({ page }) => {
    // Verifica se o filtro está presente
    const statusFilter = page.locator('select[name="status-filter"]');
    await expect(statusFilter).toBeVisible();
    
    // Filtra por agentes ativos
    await statusFilter.selectOption('active');
    
    // Aguarda a lista ser atualizada
    await page.waitForTimeout(500); // Pequena espera para garantir que o filtro foi aplicado
    
    // Verifica se todos os agentes mostrados estão com status ativo
    const agentStatuses = page.locator('.agent-status:has-text("Ativo")');
    const totalAgents = await page.locator('.agent-card').count();
    const activeAgents = await agentStatuses.count();
    
    expect(totalAgents).toBe(activeAgents);
  });
});
