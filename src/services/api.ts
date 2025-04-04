
import axios from 'axios';
import { toast } from 'sonner';

// Base URL do backend - pode ser configurada de acordo com o ambiente
const BASE_URL = 'http://localhost:8080/atlas';

// Instância do axios com configuração base e CORS
const api = axios.create({
  baseURL: BASE_URL,
  // Configurando headers para CORS
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  withCredentials: false // Necessário para algumas configurações CORS
});

// Interceptor para incluir o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('plmds_me_salva_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      const status = error.response.status;
      
      if (status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('plmds_me_salva_token');
        localStorage.removeItem('plmds_me_salva_role');
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error('Você não tem permissão para acessar este recurso.');
      } else if (status === 404) {
        toast.error('Recurso não encontrado.');
      } else if (status === 400) {
        const errorMessage = error.response.data?.message || 'Dados inválidos.';
        toast.error(errorMessage);
      } else {
        // Erro genérico
        toast.error('Ocorreu um erro no servidor. Tente novamente mais tarde.');
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('Erro de conexão:', error);
      if (error.message && error.message.includes('CORS')) {
        toast.error('Erro de CORS: O servidor não permite requisições deste domínio. Verifique a configuração do CORS no backend.');
      } else {
        toast.error('Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    } else {
      // Erro na configuração da requisição
      toast.error('Ocorreu um erro ao processar sua solicitação.');
    }
    
    return Promise.reject(error);
  }
);

// Função para alterar a URL base da API
export const configureApiBaseUrl = (newBaseUrl: string) => {
  api.defaults.baseURL = newBaseUrl;
};

export default api;
