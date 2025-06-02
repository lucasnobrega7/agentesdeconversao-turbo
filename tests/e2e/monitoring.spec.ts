import { test, expect } from '@playwright/test';

/**
 * Suite de testes para o módulo de Monitoramento em Tempo Real
 * 
 * O monitoramento é o centro nervoso operacional do sistema, onde os
 * usuários acompanham em tempo real o que está acontecendo com seus
 * agentes. É como uma torre de controle que fornece visibilidade
 * instantânea sobre conversas ativas, performance do sistema e
 * potenciais problemas.
 * 
 * Testar funcionalidades em tempo real requer técnicas especiais no
 * Playwright. Precisamos lidar com dados que chegam via WebSocket,
 * elementos que se atualizam dinamicamente, e garantir que as
 * atualizações ocorram dentro de intervalos de tempo aceitáveis.
 * 
 * Este módulo é crítico para operações diárias, especialmente em
 * momentos de alto volume, onde a capacidade de identificar e
 * responder rapidamente a problemas pode fazer toda a diferença.
 */

test.describe('Módulo de Monitoramento em Tempo Real', () => {
  test.beforeEach(async ({ page }) => {
    // Configuração inicial com login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    // Navega para o monitoramento
    await page.goto('/monitoramento');
    
    // Aguarda a conexão WebSocket ser estabelecida
    // Isso é importante para garantir que os dados em tempo real funcionem
    await page.waitForFunction(() => {
      // Verifica se o indicador de conexão está verde
      const indicator = document.querySelector('.connection-status');
      return indicator?.classList.contains('connected');
    }, { timeout: 10000 });
  });

  test('deve exibir painel de monitoramento com todos os componentes principais', async ({ page }) => {
    // Verifica o cabeçalho e status de conexão
    await expect(page.locator('h1')).toContainText('Monitoramento');
    await expect(page.locator('.connection-status')).toHaveClass(/connected/);
    await expect(page.locator('.connection-status')).toContainText('Conectado');
    
    // Verifica componentes principais do dashboard
    await expect(page.locator('.active-conversations-panel')).toBeVisible();
    await expect(page.locator('.system-health-panel')).toBeVisible();
    await expect(page.locator('.heat-map')).toBeVisible();
    await expect(page.locator('.live-feed')).toBeVisible();
    await expect(page.locator('.alerts-panel')).toBeVisible();
  });

  test('deve mostrar conversas ativas em tempo real', async ({ page }) => {
    // Localiza o painel de conversas ativas
    const activeConversationsPanel = page.locator('.active-conversations-panel');
    await expect(activeConversationsPanel).toBeVisible();
    
    // Verifica que mostra o número total de conversas ativas
    const activeCount = activeConversationsPanel.locator('.active-count');
    await expect(activeCount).toHaveText(/\d+ conversas ativas/);
    
    // Captura o número inicial
    const initialCount = await activeCount.textContent();
    const initialNumber = parseInt(initialCount?.match(/\d+/)?.[0] || '0');
    
    // Simula uma nova conversa chegando (em um teste real, isso viria do backend)
    // Aguarda por uma mudança no contador
    await page.waitForFunction(
      (startCount) => {
        const element = document.querySelector('.active-count');
        const currentText = element?.textContent || '';
        const currentNumber = parseInt(currentText.match(/\d+/)?.[0] || '0');
        return currentNumber !== startCount;
      },
      initialNumber,
      { timeout: 30000, polling: 1000 }
    );
    
    // Verifica que a lista de conversas foi atualizada
    const conversationItems = activeConversationsPanel.locator('.conversation-item');
    expect(await conversationItems.count()).toBeGreaterThan(0);
    
    // Verifica informações em cada item de conversa
    const firstConversation = conversationItems.first();
    await expect(firstConversation.locator('.customer-info')).toBeVisible();
    await expect(firstConversation.locator('.agent-name')).toBeVisible();
    await expect(firstConversation.locator('.duration')).toBeVisible();
    await expect(firstConversation.locator('.status-indicator')).toBeVisible();
  });

  test('deve exibir e atualizar o heat map de atividade', async ({ page }) => {
    // Localiza o heat map
    const heatMap = page.locator('.heat-map');
    await expect(heatMap).toBeVisible();
    
    // Verifica o título e legenda
    await expect(heatMap.locator('h3')).toContainText('Mapa de Calor - Atividade por Hora');
    await expect(heatMap.locator('.legend')).toBeVisible();
    
    // Verifica a grade do heat map (7 dias x 24 horas)
    const heatMapCells = heatMap.locator('.heat-cell');
    expect(await heatMapCells.count()).toBe(168); // 7 * 24
    
    // Testa interação - hover em uma célula
    const randomCell = heatMapCells.nth(50);
    await randomCell.hover();
    
    // Verifica tooltip com detalhes
    const tooltip = page.locator('.heatmap-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(/.*\d+ conversas/);
    await expect(tooltip).toContainText(/.*\d{2}:\d{2}/); // Horário
    
    // Verifica que as cores refletem intensidade
    // Células com mais atividade devem ter classes diferentes
    const hotCells = heatMap.locator('.heat-cell.high-activity');
    const coldCells = heatMap.locator('.heat-cell.low-activity');
    
    expect(await hotCells.count()).toBeGreaterThan(0);
    expect(await coldCells.count()).toBeGreaterThan(0);
  });

  test('deve mostrar feed ao vivo de eventos do sistema', async ({ page }) => {
    // Localiza o feed ao vivo
    const liveFeed = page.locator('.live-feed');
    await expect(liveFeed).toBeVisible();
    
    // Verifica que existem eventos no feed
    const feedItems = liveFeed.locator('.feed-item');
    const initialCount = await feedItems.count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Verifica estrutura de um evento
    const firstEvent = feedItems.first();
    await expect(firstEvent.locator('.event-time')).toBeVisible();
    await expect(firstEvent.locator('.event-type')).toBeVisible();
    await expect(firstEvent.locator('.event-description')).toBeVisible();
    
    // Aguarda por novos eventos (simulando atividade em tempo real)
    await page.waitForTimeout(5000);
    
    // Verifica que novos eventos foram adicionados ao topo
    const updatedCount = await feedItems.count();
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
    
    // Verifica tipos diferentes de eventos
    const eventTypes = await page.locator('.event-type').allTextContents();
    const uniqueTypes = new Set(eventTypes);
    expect(uniqueTypes.size).toBeGreaterThan(1); // Deve haver variedade de eventos
    
    // Testa filtro de eventos
    await page.selectOption('select[name="event-filter"]', 'errors');
    
    // Verifica que apenas eventos de erro são mostrados
    const errorEvents = liveFeed.locator('.feed-item[data-type="error"]');
    const visibleEvents = liveFeed.locator('.feed-item:visible');
    
    expect(await errorEvents.count()).toBe(await visibleEvents.count());
  });

  test('deve exibir métricas de saúde do sistema', async ({ page }) => {
    // Localiza o painel de saúde do sistema
    const healthPanel = page.locator('.system-health-panel');
    await expect(healthPanel).toBeVisible();
    
    // Verifica indicadores principais
    const cpuUsage = healthPanel.locator('.metric[data-type="cpu"]');
    const memoryUsage = healthPanel.locator('.metric[data-type="memory"]');
    const responseTime = healthPanel.locator('.metric[data-type="response-time"]');
    const uptime = healthPanel.locator('.metric[data-type="uptime"]');
    
    // Verifica que cada métrica tem valor e indicador visual
    for (const metric of [cpuUsage, memoryUsage, responseTime, uptime]) {
      await expect(metric).toBeVisible();
      await expect(metric.locator('.metric-value')).toHaveText(/\d+/);
      await expect(metric.locator('.metric-gauge, .metric-chart')).toBeVisible();
    }
    
    // Verifica alertas de saúde
    const healthStatus = healthPanel.locator('.overall-health-status');
    await expect(healthStatus).toBeVisible();
    
    // O status deve ser um dos valores esperados
    const statusText = await healthStatus.textContent();
    expect(['Saudável', 'Atenção', 'Crítico']).toContain(statusText?.trim());
    
    // Se houver problemas, deve mostrar detalhes
    if (statusText?.includes('Atenção') || statusText?.includes('Crítico')) {
      await expect(healthPanel.locator('.health-issues')).toBeVisible();
    }
  });

  test('deve gerenciar alertas e notificações', async ({ page }) => {
    // Localiza o painel de alertas
    const alertsPanel = page.locator('.alerts-panel');
    await expect(alertsPanel).toBeVisible();
    
    // Verifica se há alertas ativos
    const activeAlerts = alertsPanel.locator('.alert-item');
    const alertCount = await activeAlerts.count();
    
    if (alertCount > 0) {
      // Examina o primeiro alerta
      const firstAlert = activeAlerts.first();
      await expect(firstAlert.locator('.alert-severity')).toBeVisible();
      await expect(firstAlert.locator('.alert-message')).toBeVisible();
      await expect(firstAlert.locator('.alert-time')).toBeVisible();
      
      // Testa ação de reconhecer alerta
      await firstAlert.locator('button:has-text("Reconhecer")').click();
      
      // Verifica mudança de status
      await expect(firstAlert).toHaveClass(/acknowledged/);
      
      // Testa resolver alerta
      await firstAlert.locator('button:has-text("Resolver")').click();
      
      // Confirma resolução
      await page.locator('.confirm-resolution button:has-text("Confirmar")').click();
      
      // Alerta deve desaparecer ou mudar de status
      await expect(firstAlert).not.toBeVisible();
    }
    
    // Testa configuração de novos alertas
    await page.click('button:has-text("Configurar Alertas")');
    
    const alertConfigModal = page.locator('.alert-configuration-modal');
    await expect(alertConfigModal).toBeVisible();
    
    // Configura um novo alerta
    await page.selectOption('select[name="metric"]', 'response-time');
    await page.selectOption('select[name="condition"]', 'greater-than');
    await page.fill('input[name="threshold"]', '5000'); // 5 segundos
    await page.fill('input[name="alert-name"]', 'Tempo de Resposta Alto');
    
    await page.click('button:has-text("Criar Alerta")');
    
    // Verifica notificação de sucesso
    await expect(page.locator('.success-toast')).toContainText('Alerta configurado com sucesso');
  });

  test('deve permitir visualização em tela cheia para monitoramento', async ({ page }) => {
    // Localiza e clica no botão de tela cheia
    await page.click('button[aria-label="Tela Cheia"]');
    
    // Verifica se entrou no modo tela cheia
    await expect(page.locator('body')).toHaveClass(/fullscreen-mode/);
    
    // Verifica que elementos desnecessários foram ocultados
    await expect(page.locator('.main-navigation')).not.toBeVisible();
    await expect(page.locator('.header')).not.toBeVisible();
    
    // Verifica que os painéis foram reorganizados para melhor visualização
    await expect(page.locator('.monitoring-grid')).toHaveClass(/fullscreen-layout/);
    
    // Testa rotação automática entre painéis (se implementado)
    const rotationIndicator = page.locator('.rotation-indicator');
    if (await rotationIndicator.isVisible()) {
      // Aguarda uma rotação
      await page.waitForTimeout(10000); // Assumindo rotação a cada 10 segundos
      
      // Verifica que o painel ativo mudou
      const activePanel = page.locator('.panel.active');
      const activePanelId = await activePanel.getAttribute('data-panel-id');
      
      await page.waitForTimeout(10000);
      
      const newActivePanel = page.locator('.panel.active');
      const newActivePanelId = await newActivePanel.getAttribute('data-panel-id');
      
      expect(newActivePanelId).not.toBe(activePanelId);
    }
    
    // Sai do modo tela cheia
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveClass(/fullscreen-mode/);
  });

  test('deve exportar relatório de monitoramento', async ({ page }) => {
    // Clica no botão de gerar relatório
    await page.click('button:has-text("Gerar Relatório")');
    
    // Configura opções do relatório
    const reportModal = page.locator('.report-configuration-modal');
    await expect(reportModal).toBeVisible();
    
    // Seleciona período do relatório
    await page.selectOption('select[name="report-period"]', 'last-24-hours');
    
    // Seleciona métricas para incluir
    await page.check('[name="include-conversations"]');
    await page.check('[name="include-system-health"]');
    await page.check('[name="include-alerts"]');
    
    // Seleciona formato
    await page.click('input[value="pdf"]');
    
    // Gera o relatório
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Gerar")');
    
    // Aguarda o download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/monitoring-report.*\.pdf/);
    
    // Verifica notificação
    await expect(page.locator('.success-toast')).toContainText('Relatório gerado com sucesso');
  });
});
