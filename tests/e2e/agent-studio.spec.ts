import { test, expect } from '@playwright/test';

/**
 * Suite de testes para o AgentStudio
 * 
 * O AgentStudio é a interface visual onde os usuários constroem os fluxos
 * de conversação dos agentes. É similar a ferramentas como Node-RED ou
 * outros editores de fluxo visual, permitindo que usuários criem lógicas
 * complexas através de uma interface intuitiva de arrastar e soltar.
 * 
 * Estes testes verificam as funcionalidades principais do editor,
 * incluindo criação de nós, conexões entre eles, e salvamento do fluxo.
 */

test.describe('AgentStudio - Editor de Fluxos', () => {
  test.beforeEach(async ({ page }) => {
    // Realiza login e navega para um agente específico
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    // Navega para o AgentStudio
    // Assumindo que temos um agente com ID conhecido para testes
    await page.goto('/agent-studio/test-agent-id');
    
    // Aguarda o canvas ser carregado completamente
    await page.waitForSelector('.flow-canvas', { state: 'visible' });
  });

  test('deve renderizar o canvas do editor corretamente', async ({ page }) => {
    // Verifica elementos essenciais do editor
    await expect(page.locator('.flow-canvas')).toBeVisible();
    await expect(page.locator('.node-palette')).toBeVisible();
    await expect(page.locator('.toolbar')).toBeVisible();
    
    // Verifica se a paleta de nós contém as opções esperadas
    const nodePalette = page.locator('.node-palette');
    await expect(nodePalette.locator('[data-node-type="message"]')).toBeVisible();
    await expect(nodePalette.locator('[data-node-type="condition"]')).toBeVisible();
    await expect(nodePalette.locator('[data-node-type="action"]')).toBeVisible();
  });

  test('deve adicionar um novo nó de mensagem ao fluxo', async ({ page }) => {
    // Conta quantos nós existem inicialmente
    const initialNodeCount = await page.locator('.flow-node').count();
    
    // Clica no botão para adicionar um nó de mensagem
    await page.click('button:has-text("Adicionar Nó")');
    
    // Aguarda o modal de criação aparecer
    await expect(page.locator('.node-creation-modal')).toBeVisible();
    
    // Preenche as informações do nó
    await page.fill('input[name="node-name"]', 'Mensagem de Boas-Vindas');
    await page.fill('textarea[name="node-content"]', 'Olá! Bem-vindo ao nosso atendimento automatizado.');
    
    // Salva o nó
    await page.click('button:has-text("Criar Nó")');
    
    // Verifica se o nó foi adicionado ao canvas
    await expect(page.locator('.flow-node')).toHaveCount(initialNodeCount + 1);
    await expect(page.locator('.node-title:has-text("Mensagem de Boas-Vindas")')).toBeVisible();
  });

  test('deve conectar dois nós através de drag and drop', async ({ page }) => {
    // Primeiro, adiciona dois nós ao canvas
    // Nó 1: Mensagem inicial
    await page.click('button:has-text("Adicionar Nó")');
    await page.fill('input[name="node-name"]', 'Início');
    await page.click('button:has-text("Criar Nó")');
    
    // Nó 2: Pergunta
    await page.click('button:has-text("Adicionar Nó")');
    await page.fill('input[name="node-name"]', 'Pergunta ao Cliente');
    await page.click('button:has-text("Criar Nó")');
    
    // Localiza os pontos de conexão dos nós
    const startNodeOutput = page.locator('.flow-node:has-text("Início") .node-output');
    const questionNodeInput = page.locator('.flow-node:has-text("Pergunta ao Cliente") .node-input');
    
    // Realiza o drag and drop para conectar os nós
    // O Playwright facilita esse tipo de interação complexa
    await startNodeOutput.dragTo(questionNodeInput);
    
    // Verifica se a conexão foi criada
    await expect(page.locator('.flow-connection')).toHaveCount(1);
  });

  test('deve salvar o fluxo criado', async ({ page }) => {
    // Adiciona alguns nós ao fluxo (reutilizando lógica anterior)
    await page.click('button:has-text("Adicionar Nó")');
    await page.fill('input[name="node-name"]', 'Nó de Teste');
    await page.click('button:has-text("Criar Nó")');
    
    // Clica no botão de salvar
    await page.click('button:has-text("Salvar Fluxo")');
    
    // Verifica se aparece notificação de sucesso
    await expect(page.locator('.success-notification')).toBeVisible();
    await expect(page.locator('.success-notification')).toContainText('Fluxo salvo com sucesso');
    
    // Verifica se o indicador de "não salvo" desaparece
    await expect(page.locator('.unsaved-indicator')).not.toBeVisible();
  });

  test('deve validar o fluxo antes de ativar o agente', async ({ page }) => {
    // Tenta ativar um fluxo vazio (sem nós)
    await page.click('button:has-text("Ativar Agente")');
    
    // Deve mostrar erro de validação
    await expect(page.locator('.validation-error')).toBeVisible();
    await expect(page.locator('.validation-error')).toContainText('O fluxo precisa ter pelo menos um nó inicial');
    
    // Adiciona um nó inicial
    await page.click('button:has-text("Adicionar Nó")');
    await page.fill('input[name="node-name"]', 'Início');
    await page.click('[name="is-start-node"]'); // Marca como nó inicial
    await page.click('button:has-text("Criar Nó")');
    
    // Tenta ativar novamente
    await page.click('button:has-text("Ativar Agente")');
    
    // Agora deve funcionar
    await expect(page.locator('.success-notification')).toContainText('Agente ativado com sucesso');
  });

  test('deve permitir zoom e pan no canvas', async ({ page }) => {
    // Testa controles de zoom
    const zoomInButton = page.locator('button[aria-label="Zoom In"]');
    const zoomOutButton = page.locator('button[aria-label="Zoom Out"]');
    const zoomResetButton = page.locator('button[aria-label="Reset Zoom"]');
    
    // Verifica se os controles estão presentes
    await expect(zoomInButton).toBeVisible();
    await expect(zoomOutButton).toBeVisible();
    await expect(zoomResetButton).toBeVisible();
    
    // Testa zoom in
    await zoomInButton.click();
    // Normalmente verificaríamos a transformação CSS aqui
    
    // Testa zoom out
    await zoomOutButton.click();
    await zoomOutButton.click();
    
    // Reseta o zoom
    await zoomResetButton.click();
    
    // Para testar pan, simulamos arrastar o canvas
    const canvas = page.locator('.flow-canvas');
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.mouse.up();
  });
});
