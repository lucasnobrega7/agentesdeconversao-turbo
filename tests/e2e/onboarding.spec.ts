import { test, expect } from '@playwright/test';

/**
 * Suite de testes para o fluxo de Onboarding
 * 
 * O onboarding é a jornada inicial do usuário no sistema, desde o cadastro
 * até a criação do primeiro agente. É um processo crítico que determina
 * se o usuário conseguirá extrair valor da plataforma rapidamente.
 * 
 * Estes testes verificam cada etapa do onboarding, garantindo que novos
 * usuários consigam se cadastrar, configurar sua conta e criar seu
 * primeiro agente de forma intuitiva e sem obstáculos.
 * 
 * O fluxo de onboarding bem projetado reduz drasticamente a taxa de
 * abandono e aumenta o engajamento inicial dos usuários.
 */

test.describe('Fluxo de Onboarding Completo', () => {
  // Para testes de onboarding, não fazemos login prévio
  // pois estamos testando a experiência de novos usuários
  
  test('deve completar o cadastro de novo usuário com sucesso', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Clica no botão de começar/cadastrar
    await page.click('a:has-text("Começar Gratuitamente")');
    
    // Verifica se foi redirecionado para a página de cadastro
    await expect(page).toHaveURL(/signup/);
    
    // Preenche o formulário de cadastro
    // Nota: Em produção, você usaria emails únicos para cada execução de teste
    const uniqueEmail = `testuser_${Date.now()}@e2e.com`;
    
    await page.fill('input[name="fullName"]', 'Usuário de Teste E2E');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'SenhaSegura123!');
    await page.fill('input[name="confirmPassword"]', 'SenhaSegura123!');
    
    // Aceita os termos de uso
    await page.check('input[name="acceptTerms"]');
    
    // Submete o formulário
    await page.click('button[type="submit"]:has-text("Criar Conta")');
    
    // Aguarda o redirecionamento para a página de boas-vindas
    await expect(page).toHaveURL(/welcome/);
    
    // Verifica mensagem de boas-vindas personalizada
    await expect(page.locator('h1')).toContainText('Bem-vindo, Usuário de Teste!');
  });

  test('deve guiar o usuário através do setup inicial', async ({ page }) => {
    // Simula um usuário recém-cadastrado acessando o welcome
    await page.goto('/welcome?first_login=true');
    
    // Etapa 1: Escolha do tipo de negócio
    await expect(page.locator('h2')).toContainText('Qual é o seu tipo de negócio?');
    
    // Seleciona uma opção
    await page.click('[data-business-type="ecommerce"]');
    await page.click('button:has-text("Próximo")');
    
    // Etapa 2: Objetivos principais
    await expect(page.locator('h2')).toContainText('Quais são seus principais objetivos?');
    
    // Seleciona múltiplos objetivos
    await page.check('[data-goal="increase-sales"]');
    await page.check('[data-goal="customer-support"]');
    await page.check('[data-goal="lead-qualification"]');
    await page.click('button:has-text("Próximo")');
    
    // Etapa 3: Volume esperado de conversas
    await expect(page.locator('h2')).toContainText('Quantas conversas você espera ter por mês?');
    
    await page.selectOption('select[name="expectedVolume"]', '1000-5000');
    await page.click('button:has-text("Próximo")');
    
    // Etapa 4: Integrações desejadas
    await expect(page.locator('h2')).toContainText('Quais plataformas você gostaria de integrar?');
    
    await page.check('[data-integration="whatsapp"]');
    await page.check('[data-integration="instagram"]');
    await page.click('button:has-text("Finalizar Setup")');
    
    // Verifica conclusão do setup
    await expect(page.locator('.setup-complete-message')).toBeVisible();
    await expect(page.locator('.setup-complete-message')).toContainText('Setup concluído com sucesso!');
  });

  test('deve criar o primeiro agente durante o onboarding', async ({ page }) => {
    // Continua do ponto onde o setup foi finalizado
    await page.goto('/onboarding/create-first-agent');
    
    // Verifica a página de criação do primeiro agente
    await expect(page.locator('h1')).toContainText('Vamos criar seu primeiro agente');
    await expect(page.locator('.helper-text')).toContainText('Não se preocupe, você poderá editar tudo depois');
    
    // Escolhe um template para começar
    await expect(page.locator('.template-grid')).toBeVisible();
    
    // Clica no template de vendas
    const salesTemplate = page.locator('[data-template="sales-agent"]');
    await expect(salesTemplate).toBeVisible();
    await salesTemplate.click();
    
    // Verifica que o template foi selecionado
    await expect(salesTemplate).toHaveClass(/selected/);
    
    // Personaliza o agente
    await page.fill('input[name="agentName"]', 'Meu Primeiro Agente de Vendas');
    await page.fill('textarea[name="welcomeMessage"]', 'Olá! Sou seu assistente de vendas. Como posso ajudar hoje?');
    
    // Configura horário de atendimento
    await page.selectOption('select[name="workingHours.start"]', '09:00');
    await page.selectOption('select[name="workingHours.end"]', '18:00');
    
    // Seleciona dias de atendimento
    await page.check('[name="workingDays.monday"]');
    await page.check('[name="workingDays.tuesday"]');
    await page.check('[name="workingDays.wednesday"]');
    await page.check('[name="workingDays.thursday"]');
    await page.check('[name="workingDays.friday"]');
    
    // Cria o agente
    await page.click('button:has-text("Criar Meu Primeiro Agente")');
    
    // Aguarda a criação e redirecionamento
    await page.waitForURL(/agents\/[a-zA-Z0-9]+/, { timeout: 10000 });
    
    // Verifica página do agente criado
    await expect(page.locator('h1')).toContainText('Meu Primeiro Agente de Vendas');
    await expect(page.locator('.agent-status')).toContainText('Ativo');
  });

  test('deve mostrar tour guiado na primeira visita ao dashboard', async ({ page }) => {
    // Simula primeira visita ao dashboard após onboarding
    await page.goto('/dashboard?onboarding_complete=true');
    
    // Verifica que o tour começou automaticamente
    await expect(page.locator('.tour-overlay')).toBeVisible();
    await expect(page.locator('.tour-tooltip')).toBeVisible();
    
    // Passo 1: Apresenta o dashboard
    await expect(page.locator('.tour-tooltip')).toContainText('Este é seu painel de controle');
    await page.click('.tour-tooltip button:has-text("Próximo")');
    
    // Passo 2: Mostra métricas principais
    await expect(page.locator('.tour-tooltip')).toContainText('Aqui você acompanha suas métricas em tempo real');
    await page.click('.tour-tooltip button:has-text("Próximo")');
    
    // Passo 3: Explica navegação
    await expect(page.locator('.tour-tooltip')).toContainText('Use o menu lateral para navegar');
    await page.click('.tour-tooltip button:has-text("Próximo")');
    
    // Passo 4: Destaca ações importantes
    await expect(page.locator('.tour-tooltip')).toContainText('Crie novos agentes a qualquer momento');
    await page.click('.tour-tooltip button:has-text("Entendi")');
    
    // Verifica que o tour foi concluído
    await expect(page.locator('.tour-overlay')).not.toBeVisible();
    
    // Verifica que uma flag foi setada para não mostrar o tour novamente
    // Isso seria verificado em um teste subsequente de navegação
  });

  test('deve validar todos os campos obrigatórios no cadastro', async ({ page }) => {
    await page.goto('/signup');
    
    // Tenta submeter o formulário vazio
    await page.click('button[type="submit"]');
    
    // Verifica mensagens de erro para cada campo
    await expect(page.locator('.error-message[data-field="fullName"]')).toContainText('Nome completo é obrigatório');
    await expect(page.locator('.error-message[data-field="email"]')).toContainText('E-mail é obrigatório');
    await expect(page.locator('.error-message[data-field="password"]')).toContainText('Senha é obrigatória');
    await expect(page.locator('.error-message[data-field="acceptTerms"]')).toContainText('Você deve aceitar os termos');
    
    // Testa validação de formato de email
    await page.fill('input[name="email"]', 'emailinvalido');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message[data-field="email"]')).toContainText('Digite um e-mail válido');
    
    // Testa validação de força da senha
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message[data-field="password"]')).toContainText('A senha deve ter pelo menos 8 caracteres');
    
    // Testa confirmação de senha
    await page.fill('input[name="password"]', 'SenhaForte123!');
    await page.fill('input[name="confirmPassword"]', 'SenhaDiferente123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message[data-field="confirmPassword"]')).toContainText('As senhas não coincidem');
  });

  test('deve permitir pular etapas opcionais do onboarding', async ({ page }) => {
    await page.goto('/welcome?first_login=true');
    
    // Verifica que existe opção de pular
    await expect(page.locator('button:has-text("Pular por enquanto")')).toBeVisible();
    
    // Clica em pular
    await page.click('button:has-text("Pular por enquanto")');
    
    // Deve ir direto para o dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verifica que aparece um banner sugerindo completar o setup
    await expect(page.locator('.incomplete-setup-banner')).toBeVisible();
    await expect(page.locator('.incomplete-setup-banner')).toContainText('Complete seu perfil para aproveitar todos os recursos');
  });
});
