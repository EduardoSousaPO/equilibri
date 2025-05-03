import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/login/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renderiza a página de login corretamente', () => {
    render(<LoginPage />);
    
    // Verificar se o título está presente
    expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    
    // Verificar se os campos de formulário estão presentes
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    
    // Verificar se o botão de login está presente
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    
    // Verificar se há link para registro
    expect(screen.getByText(/não tem uma conta/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /registre-se/i })).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando campos estão vazios', () => {
    render(<LoginPage />);
    
    // Clicar no botão de login sem preencher os campos
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar se mensagens de erro são exibidas
    expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
  });
});
