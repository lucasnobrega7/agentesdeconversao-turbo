import { test, expect } from '@playwright/test';

/**
 * Suite de testes para o fluxo de login
 * 
 * Este arquivo contém testes essenciais para verificar que o sistema de
 * autenticação está funcionando corretamente. Os testes cobrem cenários
 * de sucesso e falha, garantindo que os usuários consigam acessar suas
 * contas de forma segura.
 */

test.describe('Fluxo de Login', () => {
  // Antes de cada teste, navega para a página de login
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('deve fazer login com sucesso usando credenciais válidas', async ({ page }) => {
    // Localiza e preenche o campo de email
    // O seletor 'input[name="email"]' busca especificamente o campo de email pelo atributo name
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Preenche o campo de senha
    await page.fill('input[name="password"]', 'testpass123');
    
    // Clica no botão de submit do formulário
    await page.click('button[type="submit"]');
    
    // Verifica se foi redirecionado para o dashboard após login bem-sucedido
    // O regex /dashboard/ verifica se a URL contém "dashboard"
    await expect(page).toHaveURL(/dashboard/);
    
    // Confirma que o título da página contém "Dashboard"
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('deve mostrar erro ao usar credenciais inválidas', async ({ page }) => {
    // Tenta fazer login com credenciais incorretas
    await page.fill('input[name="email"]', 'invalido@example.com');
    await page.fill('input[name="password"]', 'senhaerrada');
    await page.click('button[type="submit"]');
    
    // Verifica se permanece na página de login
    await expect(page).toHaveURL(/login/);
    
    // Verifica se aparece mensagem de erro
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Credenciais inválidas');
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    // Tenta submeter o formulário sem preencher nada
    await page.click('button[type="submit"]');
    
    // Verifica se mostra erros de validação para ambos os campos
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
  });
});
