import { test, expect } from '@playwright/test';

// Testes de autenticação
test.describe('Autenticação', () => {
  test('deve permitir login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'usuario@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento para dashboard
    await expect(page).toHaveURL(/dashboard/);
  });
  
  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalido@teste.com');
    await page.fill('input[type="password"]', 'senhaerrada');
    await page.click('button[type="submit"]');
    
    // Verificar mensagem de erro
    await expect(page.locator('.error-message')).toBeVisible();
  });
});

// Testes de chat com Lari
test.describe('Chat com Lari', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'usuario@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    // Navegar para o chat
    await page.goto('/chat');
  });
  
  test('deve enviar mensagem e receber resposta', async ({ page }) => {
    await page.fill('textarea', 'Olá, como você está?');
    await page.click('button[type="submit"]');
    
    // Verificar se a mensagem aparece no chat
    await expect(page.locator('.message-user')).toContainText('Olá, como você está?');
    
    // Verificar se há resposta da Lari (pode demorar um pouco)
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 10000 });
  });
});

// Testes de transcrição de áudio
test.describe('Transcrição de áudio', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'usuario@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    // Navegar para o áudio
    await page.goto('/audio');
  });
  
  test('deve mostrar botão de gravação', async ({ page }) => {
    await expect(page.locator('button:has-text("Iniciar Gravação")')).toBeVisible();
  });
});

// Testes de limites e planos
test.describe('Limites e planos', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'usuario@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
  });
  
  test('deve mostrar banner de plano correto', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar se o banner do plano está visível
    await expect(page.locator('h2:has-text("Plano")')).toBeVisible();
  });
});

// Testes de responsividade
test.describe('Responsividade', () => {
  test('deve ser responsivo em dispositivos móveis', async ({ page }) => {
    // Definir viewport para simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verificar se o layout se adapta
    await expect(page.locator('body')).toBeVisible();
  });
});
