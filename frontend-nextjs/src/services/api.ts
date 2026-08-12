import axios from 'axios';

type RequestPayload = Record<string, unknown>;

// Instância principal do Axios configurada com a URL do backend e credentials
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para injetar o token JWT automaticamente em todas as requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        const cleanToken = token.replace(/^["'](.+)["']$/, '$1');
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Métodos centralizados de requisição para o backend
export const apiService = {
  // --- Autenticação ---
  async login(credenciais: RequestPayload) {
    const response = await api.post('/login', credenciais);
    return response.data;
  },

  async trocarSenha(dados: RequestPayload) {
    const response = await api.post('/trocar-senha', dados);
    return response.data;
  },

  // --- Clientes ---
  async getClientes() {
    const response = await api.get('/clientes');
    return response.data;
  },

  async criarCliente(dados: RequestPayload) {
    const response = await api.post('/clientes', dados);
    return response.data;
  },

  async atualizarCliente(id: number, dados: RequestPayload) {
    const response = await api.put(`/clientes/${id}`, dados);
    return response.data;
  },

  async deletarCliente(id: number) {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },

  // --- Documentos ---
  async getDocumentos() {
    const response = await api.get('/documentos');
    return response.data;
  },

  async uploadDocumento(formData: FormData) {
    const response = await api.post('/documentos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // --- Admin / Logs ---
  async getLogs() {
    const response = await api.get('/admin/logs');
    return response.data;
  },

  async restaurarCliente(logId: number) {
    const response = await api.post(`/admin/restaurar/cliente/${logId}`);
    return response.data;
  }
};
