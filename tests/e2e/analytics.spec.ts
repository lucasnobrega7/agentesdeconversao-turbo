import { test, expect } from '@playwright/test';

/**
 * Suite de testes para o módulo de Analytics
 * 
 * O Analytics é onde os usuários transformam dados brutos em insights
 * acionáveis. É através desta interface que eles entendem o ROI de seus
 * agentes, identificam gargalos no funil de conversão e descobrem
 * oportunidades de otimização.
 * 
 * Testar interfaces de analytics é particularmente desafiador porque
 * precisamos verificar não apenas se os gráficos são renderizados, mas
 * também se os dados estão corretos, se as interações (como filtros e
 * drill-downs) funcionam adequadamente, e se a performance é aceitável
 * mesmo com grandes volumes de dados.
 * 
 * O Playwright nos permite verificar valores específicos em gráficos,
 * interagir com visualizações complexas e até mesmo validar que
 * animações e transições ocorrem conforme esperado.
 */

test.describe('Módulo de Analytics e Métricas', () => {
  test.beforeEach(async ({ page }) => {
    // Setup padrão: login e navegação
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    // Navega para a seção de analytics
    await page.goto('/analytics');
    
    // Aguarda os dados carregarem
    // Em aplicações reais, isso pode envolver múltiplas requisições API
    await page.waitForSelector('.analytics-container', { state: 'visible' });
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir KPIs principais no topo da página', async ({ page }) => {
    // Verifica a presença dos cards de KPI
    const kpiCards = page.locator('.kpi-card');
    await expect(kpiCards).toHaveCount(4);
    
    // Verifica cada KPI individualmente
    // Total de Conversas
    const conversationsKPI = page.locator('.kpi-card[data-metric="total-conversations"]');
    await expect(conversationsKPI).toBeVisible();
    await expect(conversationsKPI.locator('.kpi-value')).toHaveText(/\d+/);
    await expect(conversationsKPI.locator('.kpi-label')).toContainText('Total de Conversas');
    
    // Taxa de Conversão
    const conversionKPI = page.locator('.kpi-card[data-metric="conversion-rate"]');
    await expect(conversionKPI).toBeVisible();
    await expect(conversionKPI.locator('.kpi-value')).toHaveText(/\d+(\.\d+)?%/);
    await expect(conversionKPI.locator('.kpi-label')).toContainText('Taxa de Conversão');
    
    // Tempo Médio de Resposta
    const responseTimeKPI = page.locator('.kpi-card[data-metric="avg-response-time"]');
    await expect(responseTimeKPI).toBeVisible();
    await expect(responseTimeKPI.locator('.kpi-value')).toHaveText(/\d+s/);
    
    // Satisfação do Cliente
    const satisfactionKPI = page.locator('.kpi-card[data-metric="customer-satisfaction"]');
    await expect(satisfactionKPI).toBeVisible();
    await expect(satisfactionKPI.locator('.kpi-value')).toHaveText(/\d+(\.\d+)?/);
    
    // Verifica indicadores de tendência (setas para cima/baixo)
    const trendIndicators = page.locator('.trend-indicator');
    expect(await trendIndicators.count()).toBeGreaterThan(0);
  });

  test('deve permitir filtrar dados por período de tempo', async ({ page }) => {
    // Localiza o seletor de período
    const periodSelector = page.locator('.date-range-selector');
    await expect(periodSelector).toBeVisible();
    
    // Captura valor inicial de uma métrica para comparação
    const initialConversations = await page.locator('.kpi-card[data-metric="total-conversations"] .kpi-value').textContent();
    
    // Muda o período para "Últimos 7 dias"
    await periodSelector.click();
    await page.click('[data-period="last-7-days"]');
    
    // Aguarda os dados serem atualizados
    await page.waitForResponse(response => 
      response.url().includes('/api/analytics') && response.status() === 200
    );
    
    // Verifica se o valor mudou
    const updatedConversations = await page.locator('.kpi-card[data-metric="total-conversations"] .kpi-value').textContent();
    expect(updatedConversations).not.toBe(initialConversations);
    
    // Testa seleção customizada de datas
    await periodSelector.click();
    await page.click('[data-period="custom"]');
    
    // Seleciona datas específicas
    const startDate = page.locator('input[name="start-date"]');
    const endDate = page.locator('input[name="end-date"]');
    
    // Define um período de 15 dias atrás até hoje
    const today = new Date();
    const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
    
    await startDate.fill(fifteenDaysAgo.toISOString().split('T')[0]);
    await endDate.fill(today.toISOString().split('T')[0]);
    
    await page.click('button:has-text("Aplicar")');
    
    // Verifica se o período selecionado é exibido
    await expect(page.locator('.selected-period-display')).toContainText(/\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/);
  });

  test('deve exibir e interagir com o gráfico de funil de conversão', async ({ page }) => {
    // Localiza o gráfico de funil
    const funnelChart = page.locator('.funnel-chart');
    await expect(funnelChart).toBeVisible();
    
    // Verifica se todas as etapas do funil estão presentes
    const funnelStages = funnelChart.locator('.funnel-stage');
    await expect(funnelStages).toHaveCount(5); // Visitantes → Engajados → Qualificados → Negociação → Convertidos
    
    // Verifica valores e porcentagens em cada etapa
    const firstStage = funnelStages.first();
    await expect(firstStage.locator('.stage-count')).toHaveText(/\d+/);
    await expect(firstStage.locator('.stage-percentage')).toHaveText('100%');
    
    // Testa interação - hover para ver detalhes
    await firstStage.hover();
    const tooltip = page.locator('.chart-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(/Visitantes.*\d+.*100%/);
    
    // Clica em uma etapa para ver detalhamento
    await funnelStages.nth(2).click(); // Clica em "Qualificados"
    
    // Verifica se abre painel de detalhes
    const detailsPanel = page.locator('.stage-details-panel');
    await expect(detailsPanel).toBeVisible();
    await expect(detailsPanel.locator('h3')).toContainText('Leads Qualificados');
    
    // Verifica lista de conversas nesta etapa
    const conversationsList = detailsPanel.locator('.stage-conversations-list');
    await expect(conversationsList.locator('.conversation-item')).toHaveCount(await conversationsList.locator('.conversation-item').count());
  });

  test('deve exibir gráfico de evolução temporal das métricas', async ({ page }) => {
    // Localiza o gráfico de linha temporal
    const timeSeriesChart = page.locator('.time-series-chart');
    await expect(timeSeriesChart).toBeVisible();
    
    // Verifica se o gráfico tem os elementos esperados
    await expect(timeSeriesChart.locator('.chart-legend')).toBeVisible();
    await expect(timeSeriesChart.locator('.y-axis')).toBeVisible();
    await expect(timeSeriesChart.locator('.x-axis')).toBeVisible();
    
    // Testa seleção de métricas para visualizar
    const metricSelector = page.locator('.metric-selector');
    await metricSelector.click();
    
    // Desmarca todas e seleciona apenas "Conversas" e "Conversões"
    await page.uncheck('[data-metric="response-time"]');
    await page.uncheck('[data-metric="satisfaction"]');
    await page.check('[data-metric="conversations"]');
    await page.check('[data-metric="conversions"]');
    
    // Verifica se o gráfico foi atualizado
    const legendItems = timeSeriesChart.locator('.legend-item');
    await expect(legendItems).toHaveCount(2);
    await expect(legendItems.first()).toContainText('Conversas');
    await expect(legendItems.last()).toContainText('Conversões');
    
    // Testa zoom no gráfico
    const chartCanvas = timeSeriesChart.locator('canvas, svg');
    const box = await chartCanvas.boundingBox();
    
    if (box) {
      // Simula seleção de área para zoom
      await page.mouse.move(box.x + 100, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 300, box.y + 150);
      await page.mouse.up();
      
      // Verifica se apareceu botão de reset zoom
      await expect(page.locator('button:has-text("Resetar Zoom")')).toBeVisible();
    }
  });

  test('deve permitir exportar dados de analytics', async ({ page }) => {
    // Localiza e clica no botão de exportar
    await page.click('button:has-text("Exportar Dados")');
    
    // Verifica se o modal de exportação aparece
    const exportModal = page.locator('.export-modal');
    await expect(exportModal).toBeVisible();
    
    // Verifica opções de formato
    await expect(exportModal.locator('input[value="csv"]')).toBeVisible();
    await expect(exportModal.locator('input[value="xlsx"]')).toBeVisible();
    await expect(exportModal.locator('input[value="pdf"]')).toBeVisible();
    
    // Seleciona CSV
    await exportModal.locator('input[value="csv"]').check();
    
    // Seleciona quais dados exportar
    await exportModal.locator('[data-export="kpis"]').check();
    await exportModal.locator('[data-export="funnel"]').check();
    await exportModal.locator('[data-export="timeseries"]').uncheck();
    
    // Configura o download antes de clicar
    const downloadPromise = page.waitForEvent('download');
    
    // Clica em exportar
    await exportModal.locator('button:has-text("Exportar")').click();
    
    // Aguarda e verifica o download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/analytics.*\.csv/);
    
    // Verifica notificação de sucesso
    await expect(page.locator('.success-toast')).toContainText('Dados exportados com sucesso');
  });

  test('deve exibir comparação entre diferentes agentes', async ({ page }) => {
    // Ativa modo de comparação
    await page.click('button:has-text("Comparar Agentes")');
    
    // Verifica se o seletor de agentes aparece
    const agentSelector = page.locator('.agent-comparison-selector');
    await expect(agentSelector).toBeVisible();
    
    // Seleciona múltiplos agentes para comparar
    await agentSelector.locator('[data-agent-id="agent-1"]').check();
    await agentSelector.locator('[data-agent-id="agent-2"]').check();
    await agentSelector.locator('[data-agent-id="agent-3"]').check();
    
    await page.click('button:has-text("Aplicar Comparação")');
    
    // Verifica se a visualização mudou para modo comparação
    await expect(page.locator('.comparison-view')).toBeVisible();
    
    // Verifica se há uma tabela comparativa
    const comparisonTable = page.locator('.comparison-table');
    await expect(comparisonTable).toBeVisible();
    
    // Verifica cabeçalhos da tabela
    const headers = comparisonTable.locator('thead th');
    await expect(headers).toHaveCount(4); // Métrica + 3 agentes
    
    // Verifica se há dados para cada métrica
    const rows = comparisonTable.locator('tbody tr');
    expect(await rows.count()).toBeGreaterThan(5); // Pelo menos 5 métricas diferentes
    
    // Verifica destaque do melhor performer
    const bestPerformer = comparisonTable.locator('.best-performer');
    expect(await bestPerformer.count()).toBeGreaterThan(0);
  });

  test('deve salvar configurações de dashboard personalizadas', async ({ page }) => {
    // Entra no modo de edição do dashboard
    await page.click('button:has-text("Personalizar Dashboard")');
    
    // Verifica se entrou no modo de edição
    await expect(page.locator('.edit-mode-indicator')).toBeVisible();
    await expect(page.locator('.widget')).toHaveClass(/draggable/);
    
    // Remove um widget
    const widgetToRemove = page.locator('.widget[data-widget="response-time-chart"]');
    await widgetToRemove.hover();
    await widgetToRemove.locator('.remove-widget').click();
    
    // Adiciona um novo widget
    await page.click('button:has-text("Adicionar Widget")');
    await page.click('[data-widget-type="agent-performance-matrix"]');
    
    // Salva a configuração
    await page.click('button:has-text("Salvar Layout")');
    
    // Dá um nome para a configuração
    await page.fill('input[name="layout-name"]', 'Meu Dashboard Customizado');
    await page.click('button:has-text("Confirmar")');
    
    // Verifica se foi salvo
    await expect(page.locator('.success-toast')).toContainText('Layout salvo com sucesso');
    
    // Recarrega a página para verificar persistência
    await page.reload();
    
    // Verifica se o layout customizado foi mantido
    await expect(page.locator('.widget[data-widget="response-time-chart"]')).not.toBeVisible();
    await expect(page.locator('.widget[data-widget="agent-performance-matrix"]')).toBeVisible();
  });
});
