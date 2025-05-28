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
  
  test('deve permitir registro de novo usuário', async ({ page }) => {
    const email = `teste${Date.now()}@exemplo.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Usuário Teste');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Senha@123');
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento para verificação
    await expect(page).toHaveURL(/verify/);
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
  
  test('deve mostrar indicador de digitação enquanto processa', async ({ page }) => {
    await page.fill('textarea', 'Me conte sobre terapia cognitiva');
    await page.click('button[type="submit"]');
    
    // Verificar se o indicador de digitação aparece
    await expect(page.locator('.typing-indicator')).toBeVisible();
    
    // Verificar se eventualmente desaparece quando a resposta chega
    await expect(page.locator('.typing-indicator')).toBeHidden({ timeout: 15000 });
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
    
    // Navegar para o chat
    await page.goto('/chat');
  });
  
  test('deve mostrar botão de gravação', async ({ page }) => {
    await expect(page.locator('button.record-button')).toBeVisible();
  });
  
  // Nota: testes reais de gravação de áudio são complexos em automação
  // e geralmente precisam ser simulados ou testados manualmente
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
    await expect(page.locator('.plan-banner')).toBeVisible();
    
    // Verificar se mostra o plano correto (depende do usuário de teste)
    await expect(page.locator('.plan-badge')).toContainText(/Free|Premium|Clinical/);
  });
  
  test('deve mostrar opção de upgrade para usuários do plano gratuito', async ({ page }) => {
    // Nota: este teste assume que o usuário de teste está no plano gratuito
    await page.goto('/dashboard');
    
    // Verificar se o botão de upgrade está visível
    await expect(page.locator('button:has-text("Upgrade")')).toBeVisible();
  });
});

// Testes de agenda (apenas para plano clínico)
test.describe('Agenda', () => {
  test.beforeEach(async ({ page }) => {
    // Login com usuário do plano clínico
    await page.goto('/login');
    await page.fill('input[type="email"]', 'clinical@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
  });
  
  test('deve mostrar página de agenda para usuários do plano clínico', async ({ page }) => {
    await page.goto('/agenda');
    
    // Verificar se a página carrega corretamente
    await expect(page.locator('h1:has-text("Agende sua Sessão")')).toBeVisible();
  });
  
  test('deve mostrar slots disponíveis', async ({ page }) => {
    await page.goto('/agenda');
    
    // Verificar se há slots disponíveis
    await expect(page.locator('.available-slot')).toBeVisible();
  });
});

// Testes de responsividade
test.describe('Responsividade', () => {
  test('deve ser responsivo em dispositivos móveis', async ({ page }) => {
    // Definir viewport para simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verificar se o menu mobile está presente
    await expect(page.locator('.mobile-menu-button')).toBeVisible();
    
    // Abrir menu mobile
    await page.click('.mobile-menu-button');
    
    // Verificar se os itens do menu estão visíveis
    await expect(page.locator('.mobile-menu-items')).toBeVisible();
  });
});
