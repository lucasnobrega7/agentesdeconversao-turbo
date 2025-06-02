import { test, expect } from '@playwright/test';

/**
 * Suite de testes para o módulo de Conversas
 * 
 * As conversas são o coração do sistema "Agentes de Conversão", onde
 * acontece a mágica da interação entre clientes e agentes automatizados.
 * Esta suite verifica que os usuários conseguem visualizar, gerenciar e
 * interagir com as conversas de forma eficiente.
 * 
 * Um aspecto importante destes testes é lidar com a natureza assíncrona
 * das conversas - mensagens que chegam em tempo real, atualizações de
 * status, e indicadores de digitação. O Playwright nos permite testar
 * esses cenários complexos de forma confiável.
 */

test.describe('Módulo de Conversas', () => {
  test.beforeEach(async ({ page }) => {
    // Configuração inicial: login e navegação
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('deve exibir lista de conversas com informações relevantes', async ({ page }) => {
    await page.goto('/conversas');
    
    // Aguarda a lista carregar - importante em aplicações que fazem fetch de dados
    await page.waitForSelector('.conversation-card', { state: 'visible' });
    
    // Verifica que existem conversas na lista
    const conversationCards = page.locator('.conversation-card');
    await expect(conversationCards).toHaveCount(await conversationCards.count());
    
    // Examina o primeiro card para garantir que contém todas as informações necessárias
    const firstCard = conversationCards.first();
    
    // Cada card deve mostrar: nome do cliente, última mensagem, timestamp e status
    await expect(firstCard.locator('.customer-name')).toBeVisible();
    await expect(firstCard.locator('.last-message-preview')).toBeVisible();
    await expect(firstCard.locator('.conversation-timestamp')).toBeVisible();
    await expect(firstCard.locator('.conversation-status')).toBeVisible();
    
    // Verifica se o timestamp está em formato legível
    const timestamp = await firstCard.locator('.conversation-timestamp').textContent();
    expect(timestamp).toMatch(/\d{1,2}:\d{2}|há \d+ (minutos?|horas?|dias?)/);
  });

  test('deve filtrar conversas por status', async ({ page }) => {
    await page.goto('/conversas');
    await page.waitForSelector('.conversation-card');
    
    // Testa filtro por conversas ativas
    await page.selectOption('select[name="status-filter"]', 'active');
    await page.waitForTimeout(300); // Pequeno delay para aplicação do filtro
    
    // Verifica que apenas conversas ativas são mostradas
    const activeConversations = page.locator('.conversation-card[data-status="active"]');
    const totalConversations = page.locator('.conversation-card');
    
    const activeCount = await activeConversations.count();
    const totalCount = await totalConversations.count();
    
    expect(activeCount).toBe(totalCount);
    
    // Testa filtro por conversas finalizadas
    await page.selectOption('select[name="status-filter"]', 'closed');
    await page.waitForTimeout(300);
    
    // Verifica que apenas conversas finalizadas aparecem
    const closedConversations = page.locator('.conversation-card[data-status="closed"]');
    expect(await closedConversations.count()).toBe(await totalConversations.count());
  });

  test('deve abrir detalhes de uma conversa e exibir histórico completo', async ({ page }) => {
    await page.goto('/conversas');
    await page.waitForSelector('.conversation-card');
    
    // Captura informações da conversa antes de clicar
    const customerName = await page.locator('.conversation-card:first-child .customer-name').textContent();
    
    // Clica na primeira conversa
    await page.click('.conversation-card:first-child');
    
    // Verifica se foi redirecionado para a página de detalhes
    await expect(page).toHaveURL(/\/conversas\/\d+/);
    
    // Verifica elementos da página de detalhes
    await expect(page.locator('.conversation-header')).toContainText(customerName || '');
    await expect(page.locator('.message-container')).toBeVisible();
    await expect(page.locator('.message-input-area')).toBeVisible();
    
    // Verifica que existem mensagens no histórico
    const messages = page.locator('.message');
    await expect(messages).toHaveCount(await messages.count());
    
    // Verifica estrutura de uma mensagem
    const firstMessage = messages.first();
    await expect(firstMessage.locator('.message-author')).toBeVisible();
    await expect(firstMessage.locator('.message-content')).toBeVisible();
    await expect(firstMessage.locator('.message-time')).toBeVisible();
  });

  test('deve enviar uma nova mensagem na conversa', async ({ page }) => {
    await page.goto('/conversas');
    await page.click('.conversation-card:first-child');
    await page.waitForSelector('.message-container');
    
    // Conta mensagens antes de enviar
    const initialMessageCount = await page.locator('.message').count();
    
    // Localiza o campo de input e envia uma mensagem
    const messageInput = page.locator('[placeholder="Digite sua mensagem..."]');
    await messageInput.fill('Esta é uma mensagem de teste enviada pelo Playwright');
    
    // Envia a mensagem (pode ser Enter ou clicando no botão)
    await messageInput.press('Enter');
    
    // Aguarda a mensagem aparecer no chat
    // Importante: em chats reais, pode haver delay de rede
    await page.waitForSelector(`.message:nth-child(${initialMessageCount + 1})`, {
      state: 'visible',
      timeout: 5000
    });
    
    // Verifica que a mensagem foi adicionada
    await expect(page.locator('.message')).toHaveCount(initialMessageCount + 1);
    
    // Verifica que a última mensagem contém nosso texto
    const lastMessage = page.locator('.message').last();
    await expect(lastMessage).toContainText('Esta é uma mensagem de teste enviada pelo Playwright');
    
    // Aguarda resposta do agente (simulando comportamento real)
    await page.waitForSelector('.message-agent:last-child .typing-indicator', {
      state: 'visible',
      timeout: 3000
    });
    
    // Aguarda o indicador de digitação desaparecer e a resposta aparecer
    await page.waitForSelector('.message-agent:last-child .typing-indicator', {
      state: 'hidden',
      timeout: 5000
    });
    
    // Verifica que o agente respondeu
    const agentMessages = page.locator('.message-agent');
    const finalAgentCount = await agentMessages.count();
    expect(finalAgentCount).toBeGreaterThan(0);
  });

  test('deve marcar uma conversa como resolvida', async ({ page }) => {
    await page.goto('/conversas');
    
    // Encontra uma conversa ativa
    const activeConversation = page.locator('.conversation-card[data-status="active"]').first();
    await activeConversation.click();
    
    // Aguarda página carregar
    await page.waitForSelector('.conversation-header');
    
    // Clica no botão de marcar como resolvida
    await page.click('button:has-text("Marcar como Resolvida")');
    
    // Confirma a ação no modal
    await page.waitForSelector('.confirmation-modal');
    await page.click('.confirmation-modal button:has-text("Confirmar")');
    
    // Verifica se aparece notificação de sucesso
    await expect(page.locator('.success-toast')).toBeVisible();
    await expect(page.locator('.success-toast')).toContainText('Conversa marcada como resolvida');
    
    // Verifica se o status mudou na interface
    await expect(page.locator('.conversation-status')).toContainText('Resolvida');
    
    // Volta para a lista e verifica se o status foi atualizado lá também
    await page.goto('/conversas');
    await page.selectOption('select[name="status-filter"]', 'closed');
    
    // A conversa deve aparecer na lista de finalizadas
    const closedConversations = page.locator('.conversation-card[data-status="closed"]');
    await expect(closedConversations).toHaveCount(await closedConversations.count());
  });

  test('deve buscar conversas por palavra-chave', async ({ page }) => {
    await page.goto('/conversas');
    await page.waitForSelector('.conversation-card');
    
    // Usa a barra de busca
    const searchInput = page.locator('input[placeholder="Buscar conversas..."]');
    await searchInput.fill('problema');
    
    // Aguarda os resultados serem filtrados
    // Em aplicações reais, pode haver debounce na busca
    await page.waitForTimeout(500);
    
    // Verifica que apenas conversas relevantes aparecem
    const searchResults = page.locator('.conversation-card');
    const resultCount = await searchResults.count();
    
    // Verifica que cada resultado contém a palavra buscada
    for (let i = 0; i < resultCount; i++) {
      const card = searchResults.nth(i);
      const cardText = await card.textContent();
      expect(cardText?.toLowerCase()).toContain('problema');
    }
    
    // Limpa a busca e verifica se todas as conversas voltam
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    const allConversations = await page.locator('.conversation-card').count();
    expect(allConversations).toBeGreaterThan(resultCount);
  });
});
