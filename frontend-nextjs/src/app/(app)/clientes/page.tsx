"use client";
import { useState, useEffect, useRef } from "react";
import { IMaskInput } from "react-imask";
import axios from "axios";
import useAlerts from "@/hooks/useAlerts"; // <-- Import mantido
import ClientesTelaCompacta from "./components/ClientesTelaCompacta";
interface GerarProcuracaoResponse {
  message: string;
}
const cleanData = <T extends Cliente | Empresa>(data: T): T => {
  const cleanedData: T = { ...data };
  for (const key in cleanedData) {
    if (cleanedData[key] === null || cleanedData[key] === undefined) {
      cleanedData[key] = "" as T[Extract<keyof T, string>];
    }
  }
  if ("data_nascimento" in cleanedData && cleanedData.data_nascimento) {
    try {
      const date = new Date(cleanedData.data_nascimento);
      if (!isNaN(date.getTime())) {
        // data_nascimento será string no formato YYYY-MM-DD
        cleanedData.data_nascimento = date.toISOString().split("T")[0];
      } else {
        cleanedData.data_nascimento = ""; // string vazia
      }
    } catch (e) {
      console.error("Erro ao formatar data de nascimento:", e);
      cleanedData.data_nascimento = ""; // string vazia
    }
  }
  return cleanedData;
};
interface Cliente {
  numero: string;
  id: string;
  nome: string;
  celular: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  nacionalidade: string;
  profissao: string;
  ctps: string;
  teleitor: string;
  endereco: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  estado_civil: string;
  conjuge: string;
  cpf_conjuge: string;
  rg_conjuge: string;
  status: string;
  cnpj?: string;
  razao_social?: string;
  inscricao_estadual?: string;
  tipo?: "fisica" | "juridica";
  tipo_acesso: "publico" | "privado";
  representante_nome?: string;
  representante_cpf?: string;
  representante_cargo?: string;
  representante_celular?: string;
  representante_email?: string;
  nome_fantasia?: string;
  representante_nacionalidade: string;
  representante_estado_civil: string;
  representante_profissao: string;
  representante_rg: string;
  valor_contrato: number;
  total_pago: number;
}
interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  celular: string;
  email: string;
  status: string;
  cpf?: string;
  razao_social?: string;
  inscricao_estadual?: string;
  representante_nome?: string;
  representante_cpf?: string;
  representante_cargo?: string;
  representante_celular?: string;
  representante_email?: string;
  nome_fantasia?: string;
  tipo_acesso: string;
}
interface Pdf {
  id: string;
  nome_arquivo: string;
  data: string;
  url: string;
  cliente_id: string;
}

// Atualize ou crie este tipo
interface GerarProcuracaoResponse {
  message: string;
  link?: string; // 👈 para o link da procuração gerada
  zapsignUrl?: string; // 👈 para o link enviado para assinatura no ZapSign
}
// Define a estrutura da resposta da sua API
interface ZapsignResponse {
  message: string;
  zapsignUrl: string;
}
const initialFormState: Cliente = {
  id: "",
  nome: "",
  celular: "",
  cpf: "",
  rg: "",
  data_nascimento: "",
  nacionalidade: "",
  profissao: "",
  ctps: "",
  teleitor: "",
  endereco: "",
  numero: "",
  cep: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  estado_civil: "",
  conjuge: "",
  cpf_conjuge: "",
  rg_conjuge: "",
  status: "",
  cnpj: "",
  razao_social: "",
  nome_fantasia: "",
  inscricao_estadual: "",
  representante_nome: "",
  representante_cpf: "",
  representante_cargo: "",
  representante_celular: "",
  representante_email: "",
  representante_nacionalidade: "",
  representante_estado_civil: "",
  representante_profissao: "",
  representante_rg: "",
  tipo: "fisica",
  tipo_acesso: "privado",
  valor_contrato: 0,
  total_pago: 0,
};
interface CepData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
export default function ClientesPage() {
  // =================================================================
  // 💡 CORREÇÃO 1: TODOS OS HOOKS DEVEM ESTAR NO TOPO E EM SEQUÊNCIA
  // =================================================================
  const { confirmAction, successToast, errorAlert } = useAlerts();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [formData, setFormData] = useState<Cliente>(initialFormState);
  const [originalFormData, setOriginalFormData] =
    useState<Cliente>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null,);

  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalClientes, setOriginalClientes] = useState<Cliente[]>([]);
  const [tipoCliente, setTipoCliente] = useState<"fisica" | "juridica">(
    "fisica",
  );
  // useRefs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  // Estados adicionados recentemente
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [linkProcuracao, setLinkProcuracao] = useState<string | null>(null);
  const [showProcuracaoList, setShowProcuracaoList] = useState(false);
  const [procuracaoList, setProcuracaoList] = useState<
    { id: number; nome_original: string }[]
  >([]);
  const [selectedLinkType, setSelectedLinkType] = useState("cadastro");
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  const [procuracaoSelecionada, setProcuracaoSelecionada] = useState<
    string | null
  >(null);
  const [tempNome, setTempNome] = useState("");
  const lastClickTimeRef = useRef<Record<string, number>>({});
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const isSavingRef = useRef(false);
  const [isMobileSaving, setIsMobileSaving] = useState(false);
  // =================================================================
  // Variáveis e Constantes (NÃO-HOOKS)
  // =================================================================
  const estados = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];


  // Lógica de verificação mais robusta
  const cpfMask = "000.000.000-00";
  const cnpjMask = "00.000.000/0000-00";
  const cepMask = "00000-000";
  const telefoneMask = "(00) 0000-0000";
  const celularMask = "(00) 00000-0000";
  const cpf_conjugeMask = "000.000.000-00";
  const cpf_representanteMask = "000.000.000-00";
  // =================================================================
  // 🚨 INÍCIO DOS USE EFFECTS 🚨
  // =================================================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId); // Atualiza o estado userId
      } else {
        setError(
          "ID do usuário não encontrado. Por favor, faça login novamente.",
        );
        setIsLoading(false);
      }
    }
  }, []);
  useEffect(() => {
    // 🚨 CORREÇÃO DO 403: Só busca se userId for uma string válida
    if (userId && tipoCliente) {
      fetchClientes(tipoCliente);
    }
  }, [userId, tipoCliente]);
  // =================================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // =================================================================
  const fetchClientes = async (tipo: "fisica" | "juridica") => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Sessão não autenticada. Faça login novamente.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/clientes?tipo=${tipo}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // ⬅️ SOMENTE ISSO
        },
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }
      const data = await response.json();
      setClientes(data);
      setOriginalClientes(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Erro ao buscar clientes:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchPdfs = async (clienteId: string) => {
    try {
      const token = localStorage.getItem("authToken"); // 🔥 obrigatório
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clientes/${clienteId}/pdfs`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 enviando token
          },
        },
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar os PDFs do cliente.");
      }
      const data = await response.json();
      setPdfs(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("Erro inesperado:", err);
      }
      setPdfs([]);
      setError("Erro ao carregar os PDFs.");
    }
  };
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");
    const segundo = String(data.getSeconds()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
  };
  const fetchAddressByCep = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, "");
    if (cleanedCep.length === 8) {
      try {
        const response = await axios.get<CepData>(
          `https://viacep.com.br/ws/${cleanedCep}/json/`,
        );
        const data = response.data;
        if (!data.erro) {
          setFormData((prevData) => ({
            ...prevData,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };
  const handleMaskedInputChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } },
  ) => {
    const { name, value } = e.target;
    if (name === "tipoCliente") {
      handleLimpar();
      setTipoCliente(value as "fisica" | "juridica");
      return;
    }
    setFormData({ ...formData, [name]: value });
    if (name === "cep") {
      fetchAddressByCep(value);
    }
  };
  const fetchLinkCadastroAtivo = async (clienteId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLinkGerado(null);
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/link-ativo/${clienteId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        setLinkGerado(null);
        return;
      }
      const data = await response.json();
      if (data.ativo && data.link) {
        setLinkGerado(data.link);
      } else {
        setLinkGerado(null);
      }
    } catch (error) {
      console.error("Erro ao buscar link de cadastro ativo:", error);
      setLinkGerado(null);
    }
  };
  const handleClienteSelect = (cliente: Cliente) => {
    const updatedCliente = cleanData(cliente);
    updatedCliente.tipo_acesso = cliente.tipo_acesso || ""; // <--- ADICIONE ESTA LINHA
    if (cliente.tipo === "juridica") {
      updatedCliente.nome = cliente.razao_social || "";
      updatedCliente.inscricao_estadual = cliente.inscricao_estadual || "";
      updatedCliente.cnpj = cliente.cnpj || "";
      updatedCliente.representante_nome = cliente.representante_nome || "";
      updatedCliente.representante_cpf = cliente.representante_cpf || "";
      updatedCliente.representante_cargo = cliente.representante_cargo || "";
      updatedCliente.representante_celular =
        cliente.representante_celular || "";
      updatedCliente.representante_email = cliente.representante_email || "";
      updatedCliente.representante_nacionalidade =
        cliente.representante_nacionalidade || "";
      updatedCliente.representante_estado_civil =
        cliente.representante_estado_civil || "";
      updatedCliente.representante_profissao =
        cliente.representante_profissao || "";
      updatedCliente.representante_rg = cliente.representante_rg || "";
    }
    setFormData(updatedCliente);
    setOriginalFormData(updatedCliente);
    setSelectedClienteId(cliente.id);
    setIsEditing(true);
    setSelectedPdfId(null);
    if (cliente.id) {
      // Carrega os PDFs do cliente
      fetchPdfs(cliente.id);
      // Verifica se ainda existe um link de cadastro ativo
      fetchLinkCadastroAtivo(cliente.id);
    } else {
      setLinkGerado(null);
      setPdfs([]);
      setError(
        "Não foi possível carregar PDFs para este cliente (ID ausente no backend).",
      );
    }
  };
  const handlePdfSelect = (pdfId: string) => {
    setSelectedPdfId(pdfId);
  };
  const handlePdfDoubleClick = (pdf: Pdf) => {
    let urlParaAbrir = pdf.url;
    if (urlParaAbrir) {
      // Limpa espaços em branco acidentais
      urlParaAbrir = urlParaAbrir.trim();
      // VALIDAÇÃO CRÍTICA:
      // Se a URL já for completa (S3), abrimos ela direto.
      // Se NÃO for (for apenas o ID ou caminho local), chamamos a nossa rota do backend.
      if (urlParaAbrir.startsWith("http")) {
        console.log("DEBUG - Abrindo link direto do S3:", urlParaAbrir);
        window.open(urlParaAbrir, "_blank");
      } else {
        // Caso o banco não tenha o link completo, chama a rota que criamos no backend
        const rotaBackend = `http://seu-backend.com/abrir-pdf/${pdf.id}`;
        console.log("DEBUG - Chamando rota do servidor:", rotaBackend);
        window.open(rotaBackend, "_blank");
      }
    } else {
      alert("Erro: Este PDF não possui um link válido.");
    }
  };
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.length === 0) {
      setClientes(originalClientes);
      handleLimpar();
      return;
    }
    const filteredClients = originalClientes.filter((c) => {
      const cpfLimpo = c.cpf?.replace(/\D/g, "") || "";
      const cnpjLimpo = c.cnpj?.replace(/\D/g, "") || "";
      return (
        c.nome.toLowerCase().includes(term) ||
        cpfLimpo.includes(term) ||
        cnpjLimpo.includes(term)
      );
    });
    setClientes(filteredClients);
    if (filteredClients.length === 0) {
      handleLimpar();
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // 1. Lógica de Checagem de Alterações e Segurança de Variáveis
    if (isEditing) {
      // Checagem de segurança para garantir que originalFormData existe
      if (!originalFormData) {
        errorAlert("Dados originais não carregados. Impossível salvar edição.");
        return;
      }
      let isDataChanged = false;
      const normalizeValue = (value: unknown): string => {
        return String(value ?? "").trim();
      };
      for (const key in formData) {
        if (originalFormData.hasOwnProperty(key)) {
          const oldValue = normalizeValue(
            originalFormData[key as keyof typeof originalFormData],
          );
          const newValue = normalizeValue(
            formData[key as keyof typeof formData],
          );
          if (oldValue !== newValue) {
            isDataChanged = true;
            break;
          }
        }
      }
      if (!file && !isDataChanged) {
        // Usamos errorAlert para bloqueios de fluxo, mas com título de aviso
        errorAlert("Nenhuma alteração detectada para ser salva.", "Aviso");
        return;
      }
    }
    // Checagem de segurança para 'clientes'
    if (!clientes) {
      errorAlert(
        "Lista de clientes não carregada. Impossível verificar duplicidade.",
      );
      return;
    }
    // 2. Lógica de Validação e Duplicidade
    const limparDocumento = (doc: string | undefined) =>
      doc ? doc.replace(/\D/g, "") : "";
    const cpfLimpo = limparDocumento(formData.cpf);
    const rgLimpo = limparDocumento(formData.rg);
    const cnpjLimpo = limparDocumento(formData.cnpj);
    const clienteDuplicado = clientes.find((c) => {
      const clienteCpfLimpo = limparDocumento(c.cpf);
      const clienteRgLimpo = limparDocumento(c.rg);
      const clienteCnpjLimpo = limparDocumento(c.cnpj);
      if (
        tipoCliente === "fisica" &&
        c.tipo === "fisica" &&
        c.id !== selectedClienteId
      ) {
        return clienteCpfLimpo === cpfLimpo || clienteRgLimpo === rgLimpo;
      }
      if (
        tipoCliente === "juridica" &&
        c.tipo === "juridica" &&
        c.id !== selectedClienteId
      ) {
        return clienteCnpjLimpo === cnpjLimpo;
      }
      return false;
    });
    if (clienteDuplicado) {
      const mensagemErro =
        tipoCliente === "fisica"
          ? "Já existe um cliente Pessoa Física com este CPF ou RG."
          : "Já existe um cliente Pessoa Jurídica com este CNPJ.";
      // Usamos errorAlert para duplicidade, definindo o título para clareza.
      errorAlert(mensagemErro, "Duplicidade Detectada");
      return;
    }
    // 3. Preparação dos Dados para Envio
    // 🎯 AÇÃO CRÍTICA (1): LER E VALIDAR O ID DO USUÁRIO
    const idDoUsuarioLogado = localStorage.getItem("userId");
    console.log(
      "ID do usuário lido do localStorage (userId):",
      idDoUsuarioLogado,
    );
    if (!idDoUsuarioLogado) {
      errorAlert(
        "ID do usuário logado não encontrado. Por favor, faça login novamente.",
      );
      return;
    }
    // 🎯 AÇÃO CRÍTICA (2): INCLUIR O ID DO USUÁRIO NA CARGA ÚTIL
    interface DataToSubmit {
      nome: string;
      email: string;
      telefone: string;
      tipoCliente: string;
      id_usuario: string;
      [key: string]: unknown; // caso existam campos extras dinâmicos
    }
    const dataToSubmit: DataToSubmit = {
      ...formData,
      tipoCliente,
      id_usuario: idDoUsuarioLogado,
    };
    console.log(
      "Valor enviado para o Backend (id_usuario):",
      dataToSubmit.id_usuario,
    );
    if (tipoCliente === "juridica") {
      dataToSubmit.razao_social = formData.nome;
      delete dataToSubmit.cpf;
      delete dataToSubmit.rg;
      delete dataToSubmit.data_nascimento;
      delete dataToSubmit.estado_civil;
      delete dataToSubmit.conjuge;
      delete dataToSubmit.cpf_conjuge;
      delete dataToSubmit.rg_conjuge;
    } else {
      delete dataToSubmit.cnpj;
      delete dataToSubmit.razao_social;
    }
    const method = isEditing ? "PUT" : "POST";
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = isEditing
      ? `${baseUrl}/clientes/${selectedClienteId}`
      : `${baseUrl}/clientes`;
    // 🎯 INJEÇÃO DO TOKEN (Para Autorização)
    const token = localStorage.getItem("authToken");
    if (!token) {
      errorAlert("Sessão expirada. Por favor, faça login novamente.");
      return;
    }
    // Configuração dos headers iniciais com o Token de Autorização
    let headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };
    let body;
    if (file) {
      // Envio com Arquivo (FormData)
      const formDataToSubmit = new FormData();
      // CORREÇÃO DE SEGURANÇA: Garante que os valores são strings para evitar falhas silenciosas
      for (const key in dataToSubmit) {
        formDataToSubmit.append(key, String(dataToSubmit[key] ?? ""));
      }
      formDataToSubmit.append("pdf_file", file);
      body = formDataToSubmit;
      // Quando usamos FormData, não definimos Content-Type (headers só contém Authorization)
      headers = { Authorization: `Bearer ${token}` };
    } else {
      // Envio Sem Arquivo (JSON)
      body = JSON.stringify(dataToSubmit);
      // Adiciona o Content-Type para JSON
      headers["Content-Type"] = "application/json";
    }
    try {
      const response = await fetch(url, {
        method,
        // 🎯 Usa os headers configurados (Autorização + Content-Type ou só Autorização)
        headers: headers,
        body,
      });
      // Adiciona tratamento de erro 401/403
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Acesso negado ou sessão expirada. Faça login novamente.",
        );
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
          `Erro ao ${isEditing ? "atualizar" : "cadastrar"} o cliente.`,
        );
      }
      // Ação de Sucesso: Usa o successToast
      successToast(
        `Cliente ${isEditing ? "atualizado" : "cadastrado"} com sucesso!`,
      );
      // 💡 CORREÇÃO: Removemos o useEffect e chamamos a função diretamente.
      if (tipoCliente && userId) {
        fetchClientes(tipoCliente);
      }
      if (selectedClienteId) {
        fetchPdfs(selectedClienteId);
      }
      if (method === "POST") {
        handleLimpar();
      } else {
        setFile(null);
        setFileName("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        const inputTelaCompacta = document.getElementById(
          "pdf-upload-mobile"
        ) as HTMLInputElement | null;

        if (inputTelaCompacta) {
          inputTelaCompacta.value = "";
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        // Ação de Erro: Usa o errorAlert
        errorAlert(err.message);
      } else {
        console.error("Erro desconhecido", err);
        // Ação de Erro: Usa o errorAlert
        errorAlert("Ocorreu um erro inesperado.");
      }
    }
  };
  // Certifique-se de que o nome da chave seja 'authToken' em todos os arquivos!
  const handleDelete = async () => {
    // --- Preparação de Variáveis ---
    let titulo = ""; // Adicionado para o título do modal
    let confirmationMessage = "";
    let urlEndpoint = "";
    let successMessage = "";
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = localStorage.getItem("authToken");
    const idDoUsuarioLogado = localStorage.getItem("userId");
    // Se o token estiver faltando
    if (!token) {
      // 🚨 REUTILIZADO: Alerta de Erro
      errorAlert(
        "Token de autenticação não encontrado. Você precisa fazer login novamente.",
        "Sessão Expirada",
      );
      return;
    }
    // 1. Determinação da Ação e Mensagem (mantida)
    if (selectedPdfId) {
      titulo = "Excluir PDF";
      confirmationMessage =
        "Tem certeza que deseja excluir este PDF? Esta ação será registrada para auditoria.";
      urlEndpoint = `/pdfs/${selectedPdfId}`;
      successMessage = "PDF excluído com sucesso!";
    } else if (selectedClienteId) {
      titulo = "Excluir Cliente";
      confirmationMessage =
        "Tem certeza que deseja excluir este cliente e TODOS os seus arquivos? Esta ação será registrada para auditoria.";
      urlEndpoint = `/clientes/${selectedClienteId}`;
      successMessage = "Cliente excluído com sucesso!";
    } else {
      return;
    }
    // 2. 🛡️ REUTILIZADO: Confirmação com Modal (Substitui o window.confirm())
    const confirmou = await confirmAction(titulo, confirmationMessage);
    // Se o usuário não confirmar a exclusão, interrompe o fluxo.
    if (!confirmou) {
      return;
    }
    // --- Se confirmou, executa a exclusão ---
    try {
      const response = await fetch(`${baseUrl}${urlEndpoint}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Tratamento de erro 401/403 (mantido)
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        throw new Error(
          "Acesso negado ou sessão expirada. Você foi desconectado.",
        );
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir.");
      }
      // 3. ✅ REUTILIZADO: Feedback de Sucesso (Substitui o alert())
      successToast(successMessage);
      // 4. Lógica de atualização (mantida)
      if (selectedPdfId) {
        setSelectedPdfId(null);
        fetchPdfs(selectedClienteId!);
      } else {
        if (idDoUsuarioLogado) {
          fetchClientes(tipoCliente);
          handleLimpar();
        } else {
          console.error("Erro de lógica: userId não disponível.");
        }
      }
    } catch (err: unknown) {
      // 5. ❌ REUTILIZADO: Feedback de Erro (Substitui o console.error)
      const mensagemErro =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro desconhecido durante a exclusão.";
      errorAlert(mensagemErro, "Erro na Operação"); // Use errorAlert para exibir o problema
      console.error(err); // Mantemos para debugging no console
    }
  };
  const handleLimpar = () => {
    setFormData(initialFormState);
    setOriginalFormData(initialFormState);
    setIsEditing(false);
    setFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPdfs([]);
    setError(null);
    setSelectedClienteId(null);
    setSelectedPdfId(null);
    setSearchTerm("");
    setLinkGerado(null); // Limpa o link gerado
    // 🚨 CORREÇÃO ESSENCIAL: Checa se userId existe antes de chamar 🚨
    if (userId) {
      fetchClientes(tipoCliente);
    } else {
      // Se userId ainda for null aqui, mostra uma mensagem para o usuário
      setError(
        "ID do usuário não carregado. Não foi possível atualizar a lista de clientes.",
      );
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setFileName(selectedFile.name);
    } else {
      setFileName("");
    }
  };
  // Sua função handleGerarLink corrigida
  const handleGerarLink = async (
    tipo: string,
    procuracaoNome: string | null = null,
  ) => {
    if (!selectedClienteId) {
      // SUBSTITUÍDO: alert() por errorAlert()
      errorAlert("Selecione um cliente para gerar o link.", "Aviso");
      return;
    }
    try {
      // --- Lógica para o link de PROCURAÇÃO ---
      if (tipo === "procuracao") {
        if (!procuracaoNome) {
          // SUBSTITUÍDO: alert() por errorAlert()
          errorAlert("Selecione um tipo de procuração.", "Aviso");
          return;
        }
        const response = await axios.post<GerarProcuracaoResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/gerar-procuracao`,
          {
            clienteId: selectedClienteId,
            documentoNome: procuracaoNome,
          },
        );
        console.log(
          "Variável de Ambiente:",
          process.env.NEXT_PUBLIC_BACKEND_URL,
        );
        console.log("💡 response.data completo:", response.data);
        if (response.data.link) {
          console.log("💡 link recebido do backend:", response.data.link);
          setLinkProcuracao(response.data.zapsignUrl ?? null); // Atualiza o state
          // SUBSTITUÍDO: alert() por successToast()
          successToast(
            "Link de procuração gerado com sucesso! \n\n" + response.data.link,
          );
        } else {
          // SUBSTITUÍDO: alert() por errorAlert()
          errorAlert(
            response.data.message || "Link não retornado pelo servidor.",
          );
        }
        if (selectedClienteId) {
          fetchPdfs(selectedClienteId);
        }
        // --- Lógica para a DECLARAÇÃO DE HIPOSSUFICIÊNCIA ---
      } else if (tipo === "declaracao") {
        if (!procuracaoNome) {
          errorAlert("Selecione um tipo de declaração.", "Aviso");
          return;
        }

        const response = await axios.post<GerarProcuracaoResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/gerar-declaracao-hipossuficiencia`,
          {
            clienteId: selectedClienteId,
            documentoNome: procuracaoNome,
          },
        );

        if (response.data.link) {
          successToast(
            "Declaração de hipossuficiência gerada com sucesso! \n\n" +
            response.data.link,
          );
        } else {
          errorAlert(
            response.data.message || "Link não retornado pelo servidor.",
          );
        }

        fetchPdfs(selectedClienteId);
        // --- Lógica para o link de CADASTRO (CORRIGIDA) ---
      } else if (tipo === "cadastro") {
        const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/gerar-link`;
        const bodyData = { clienteId: selectedClienteId };
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao gerar o link.");
        }
        const data = await response.json();
        setLinkGerado(data.link);
        // SUBSTITUÍDO: alert() por successToast()
        successToast("Link de cadastro gerado com sucesso! \n\n" + data.link);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erro ao gerar link:", err.message);
        // SUBSTITUÍDO: alert() por errorAlert()
        errorAlert(err.message);
      } else {
        console.error("Erro ao gerar link:", err);
        // SUBSTITUÍDO: alert() por errorAlert()
        errorAlert("Erro ao gerar o link. Por favor, verifique o console.");
      }
    } finally {
      setShowLinkOptions(false);
    }
  };
  const handleCopyLink = () => {
    console.log("DEBUG: Funcao handleCopyLink foi chamada.");
    if (linkRef.current) {
      linkRef.current.select();
      navigator.clipboard
        .writeText(linkRef.current.value)
        .then(() => {
          // SUBSTITUÍDO: alert() por successToast()
          successToast("Link copiado com sucesso!");
        })
        .catch((err) => {
          console.error("Erro ao copiar o link:", err);
          // SUBSTITUÍDO: alert() por errorAlert()
          errorAlert("Erro ao copiar o link.");
        });
    }
  };
  // useEffect para buscar o link da Zapsign quando um PDF é selecionado
  useEffect(() => {
    const fetchZapsignUrl = async () => {
      // Se não houver PDF selecionado, limpa o link da tela
      if (!selectedPdfId) {
        setLinkProcuracao(null);
        return;
      }
      try {
        // Chama a nova rota no backend para buscar o link do PDF
        const response = await axios.get<GerarProcuracaoResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/procuracao-url/${selectedPdfId}`,
        );
        if (response.data.zapsignUrl) {
          setLinkProcuracao(response.data.zapsignUrl);
        } else {
          setLinkProcuracao(null);
        }
      } catch (error) {
        console.error("Erro ao buscar URL da Zapsign:", error);
        setLinkProcuracao(null);
      }
    };
    fetchZapsignUrl();
  }, [selectedPdfId]); // Esta linha é crucial: o useEffect roda quando selectedPdfId muda
  const handleCopyProcuracaoLink = () => {
    if (!linkProcuracao) return; // nada para copiar
    navigator.clipboard
      .writeText(linkProcuracao)
      .then(() => {
        // SUBSTITUÍDO: alert() por successToast()
        successToast("Link copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar o link:", err);
        // SUBSTITUÍDO: alert() por errorAlert()
        errorAlert("Não foi possível copiar o link.");
      });
  };
  // Adicione esta nova função no seu componente ClientesPage
  const handleEnviarParaZapsign = async (
    pdfId: string,
    documentoNome: string,
  ) => {
    if (!selectedClienteId) {
      // SUBSTITUÍDO: alert() por errorAlert()
      errorAlert("Selecione um cliente primeiro.");
      return;
    }
    try {
      const response = await axios.post<ZapsignResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/enviar-para-zapsign`,
        {
          clienteId: selectedClienteId,
          documentoNome: documentoNome, // Usando o nome recebido do botão
        },
      );
      setLinkProcuracao(response.data.zapsignUrl ?? null); // Atualiza o state
      // SUBSTITUÍDO: alert() por successToast()
      successToast(
        response.data.message + "\nLink: " + response.data.zapsignUrl,
      );
      fetchPdfs(selectedClienteId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Caso seja um erro padrão
        console.error("Erro ao enviar para Zapsign:", err.message);
        // SUBSTITUÍDO: alert() por errorAlert()
        errorAlert(err.message);
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        console.error("Erro ao enviar para Zapsign:", axiosErr.response?.data);
        // SUBSTITUÍDO: alert() por errorAlert()
        errorAlert(
          "Erro ao enviar para Zapsign. Verifique o console para mais detalhes.",
        );
      } else {
        console.error("Erro desconhecido ao enviar para Zapsign:", err);
        // SUBSTITUÍDO: alert() por errorAlert()
        errorAlert(
          "Erro ao enviar para Zapsign. Verifique o console para mais detalhes.",
        );
      }
    }
  };
  // Adicione a tipagem : Pdf no parâmetro
  const handlePdfClick = (pdf: Pdf) => {
    const now = Date.now();
    const lastClick = lastClickTimeRef.current[pdf.id] || 0;
    const timeDiff = now - lastClick;
    lastClickTimeRef.current[pdf.id] = now;
    if (selectedPdfId === pdf.id && timeDiff >= 500 && timeDiff <= 2000) {
      setEditingPdfId(pdf.id);
      setTempNome(pdf.nome_arquivo);
    } else {
      handlePdfSelect(pdf.id);
    }
  };
  // 2. Substitua a sua função handleSalvarNome por esta versão ajustada:
  const handleSalvarNome = async (pdfId: string) => {
    // Se já estiver salvando ou se o ID não estiver mais em edição, bloqueia execuções paralelas/duplicadas
    if (isSavingRef.current || !editingPdfId) return;
    const pdfAtual = pdfs.find((p) => p.id === pdfId);
    // Se o nome não mudou ou está em branco, só fecha o modo de edição sem fazer requisição
    if (
      !tempNome.trim() ||
      (pdfAtual && pdfAtual.nome_arquivo === tempNome.trim())
    ) {
      setEditingPdfId(null);
      return;
    }
    try {
      isSavingRef.current = true; // Trava para impedir que o onBlur execute no mesmo instante
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/renomear-pdf/${pdfId}`,
        {
          novoNome: tempNome,
        },
      );
      const nomeAtualizado = response.data.novoNome;
      // Atualiza a lista no estado local
      setPdfs((prevPdfs: Pdf[]) =>
        prevPdfs.map((p) =>
          p.id === pdfId ? { ...p, nome_arquivo: nomeAtualizado } : p,
        ),
      );
    } catch (error) {
      console.error("Erro ao renomear PDF:", error);
      errorAlert("Não foi possível renomear o arquivo.");
    } finally {
      setEditingPdfId(null);
      // Libera o salvamento após o React processar a remoção do input
      setTimeout(() => {
        isSavingRef.current = false;
      }, 100);
    }
  };
  const handleMobileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.nome.trim()) {
      errorAlert(
        tipoCliente === "fisica"
          ? "Informe o nome completo do cliente."
          : "Informe a razão social.",
      );
      return;
    }
    if (!formData.email.trim()) {
      errorAlert("Informe o e-mail do cliente.");
      return;
    }
    if (!formData.celular.trim()) {
      errorAlert("Informe o celular do cliente.");
      return;
    }
    const token = localStorage.getItem("authToken");
    const idDoUsuarioLogado = localStorage.getItem("userId");
    if (!token || !idDoUsuarioLogado) {
      errorAlert(
        "Sessão expirada. Faça login novamente.",
        "Erro de Autenticação",
      );
      return;
    }
    setIsMobileSaving(true);
    try {
      const clienteData = {
        tipoCliente,
        tipo_acesso: formData.tipo_acesso,
        email: formData.email,
        celular: formData.celular,
        id_usuario: idDoUsuarioLogado,
        razao_social: tipoCliente === "juridica" ? formData.nome : null,
        nome: tipoCliente === "fisica" ? formData.nome : null,
        status: "ativo",
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clientes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(clienteData),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro ao adicionar cliente.");
      }
      successToast("Cliente adicionado com sucesso!");
      /*
       * Busca novamente a lista para localizar o cliente
       * recém-criado e já deixá-lo selecionado para gerar o link.
       */
      const clientesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clientes?tipo=${tipoCliente}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (clientesResponse.ok) {
        const listaAtualizada: Cliente[] = await clientesResponse.json();
        setClientes(listaAtualizada);
        setOriginalClientes(listaAtualizada);
        const clienteCriado = listaAtualizada.find((cliente) => {
          const mesmoEmail =
            (cliente.email || "").trim().toLowerCase() ===
            formData.email.trim().toLowerCase();
          const mesmoCelular =
            (cliente.celular || "").replace(/\D/g, "") ===
            formData.celular.replace(/\D/g, "");
          const mesmoNome =
            tipoCliente === "fisica"
              ? (cliente.nome || "").trim().toLowerCase() ===
              formData.nome.trim().toLowerCase()
              : (cliente.razao_social || cliente.nome || "")
                .trim()
                .toLowerCase() === formData.nome.trim().toLowerCase();
          return mesmoEmail && mesmoCelular && mesmoNome;
        });
        if (clienteCriado?.id) {
          setSelectedClienteId(clienteCriado.id);
        }
      }
      setLinkGerado(null);
      setFormData((prev) => ({
        ...initialFormState,
        tipo_acesso: prev.tipo_acesso,
      }));
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error ? err.message : "Erro ao cadastrar cliente.";
      console.error("Erro no cadastro rápido:", err);
      errorAlert(mensagem);
    } finally {
      setIsMobileSaving(false);
    }
  };
  return (
    <div className="w-full min-w-0">
      <ClientesTelaCompacta
        error={error}
        tipoCliente={tipoCliente}
        setTipoCliente={setTipoCliente}
        formData={formData}
        setFormData={setFormData}
        celularMask={celularMask}
        isMobileSaving={isMobileSaving}
        handleMobileSubmit={handleMobileSubmit}
        handleLimpar={handleLimpar}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        isLoading={isLoading}
        clientes={clientes}
        selectedClienteId={selectedClienteId}
        handleClienteSelect={handleClienteSelect}
        setSelectedLinkType={setSelectedLinkType}
        setProcuracaoSelecionada={setProcuracaoSelecionada}
        setShowProcuracaoList={setShowProcuracaoList}
        setShowLinkOptions={setShowLinkOptions}
        setProcuracaoList={setProcuracaoList}
        linkGerado={linkGerado}
        handleCopyLink={handleCopyLink}
        linkRef={linkRef}
        linkProcuracao={linkProcuracao}
        handleCopyProcuracaoLink={handleCopyProcuracaoLink}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        pdfs={pdfs}
        selectedPdfId={selectedPdfId}
        handlePdfClick={handlePdfClick}
        formatarData={formatarData}
        handleEnviarParaZapsign={handleEnviarParaZapsign}
        showLinkOptions={showLinkOptions}
        selectedLinkType={selectedLinkType}
        procuracaoList={procuracaoList}
        procuracaoSelecionada={procuracaoSelecionada}
        handleGerarLink={handleGerarLink}
        handleDelete={handleDelete}
        fileName={fileName}
      />
      <div className="hidden w-full min-w-0 lg:block">
        <div className="w-full min-w-0 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-slate-600">
            Clientes
          </h2>
          {error && (
            <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <form
            id="clienteForm"
            className="w-full min-w-0"
            onSubmit={handleSubmit}
          >
            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)]">
              {/* =====================================================
                        PAINEL ESQUERDO
                    ====================================================== */}
              <div className="min-w-0">
                {/* TIPO DE CLIENTE / ACESSO */}
                <div className="mb-3 flex flex-wrap items-start gap-x-10 gap-y-2 border-b border-slate-200 pb-3">
                  <div className="flex flex-wrap items-start gap-6">
                    {/* TIPO DE CLIENTE */}
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-600">
                        Tipo de Cliente:
                      </p>

                      <div className="grid grid-cols-2 gap-1.5">
                        <label
                          htmlFor="pf"
                          className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition ${tipoCliente === "fisica"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600"
                            }`}
                        >
                          <input
                            type="radio"
                            id="pf"
                            name="tipoCliente"
                            value="fisica"
                            checked={tipoCliente === "fisica"}
                            onChange={handleInputChange}
                            className="sr-only"
                          />

                          Pessoa Física
                        </label>

                        <label
                          htmlFor="pj"
                          className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition ${tipoCliente === "juridica"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600"
                            }`}
                        >
                          <input
                            type="radio"
                            id="pj"
                            name="tipoCliente"
                            value="juridica"
                            checked={tipoCliente === "juridica"}
                            onChange={handleInputChange}
                            className="sr-only"
                          />

                          Pessoa Jurídica
                        </label>
                      </div>
                    </div>

                    {/* TIPO DE ACESSO */}
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-600">
                        Tipo de Acesso:
                      </p>

                      <div className="grid grid-cols-2 gap-1.5">
                        <label
                          htmlFor="publico"
                          className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition ${formData.tipo_acesso === "publico"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600"
                            }`}
                        >
                          <input
                            type="radio"
                            id="publico"
                            name="tipo_acesso"
                            value="publico"
                            checked={formData.tipo_acesso === "publico"}
                            onChange={handleInputChange}
                            className="sr-only"
                          />

                          Público
                        </label>

                        <label
                          htmlFor="privado"
                          className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold transition ${formData.tipo_acesso === "privado"
                            ? "border-slate-600 bg-slate-100 text-slate-800"
                            : "border-slate-200 bg-white text-slate-600"
                            }`}
                        >
                          <input
                            type="radio"
                            id="privado"
                            name="tipo_acesso"
                            value="privado"
                            checked={formData.tipo_acesso === "privado"}
                            onChange={handleInputChange}
                            className="sr-only"
                          />

                          Privado
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {/* =====================================================
                            PESSOA FÍSICA
                        ====================================================== */}
                {tipoCliente === "fisica" ? (
                  <>
                    {/* NOME */}
                    <div className="mb-2 flex flex-col gap-1">
                      <label
                        htmlFor="nome"
                        className="text-xs font-medium text-slate-600"
                      >
                        Nome:
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                      />
                    </div>
                    {/* CPF / RG / NASCIMENTO */}
                    <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="cpf"
                          className="text-xs font-medium text-slate-600"
                        >
                          CPF:
                        </label>
                        <IMaskInput
                          mask={cpfMask}
                          type="text"
                          id="cpf"
                          name="cpf"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onAccept={(value) =>
                            handleMaskedInputChange("cpf", value)
                          }
                          required
                          className="h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="rg"
                          className="text-xs font-medium text-slate-600"
                        >
                          RG:
                        </label>
                        <input
                          type="text"
                          id="rg"
                          name="rg"
                          value={formData.rg}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="data_nascimento"
                          className="text-xs font-medium text-slate-600"
                        >
                          Data Nasc:
                        </label>
                        <input
                          type="date"
                          id="data_nascimento"
                          name="data_nascimento"
                          value={formData.data_nascimento ?? ""}
                          onChange={handleInputChange}
                          required
                          className="h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                    {/* NACIONALIDADE / PROFISSÃO / CTPS / TÍTULO */}
                    <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="nacionalidade"
                          className="text-xs font-medium text-slate-600"
                        >
                          Nacionalidade:
                        </label>
                        <input
                          type="text"
                          id="nacionalidade"
                          name="nacionalidade"
                          value={formData.nacionalidade}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="profissao"
                          className="text-xs font-medium text-slate-600"
                        >
                          Profissão:
                        </label>
                        <input
                          type="text"
                          id="profissao"
                          name="profissao"
                          value={formData.profissao}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="ctps"
                          className="text-xs font-medium text-slate-600"
                        >
                          CTPS:
                        </label>
                        <input
                          type="text"
                          id="ctps"
                          name="ctps"
                          value={formData.ctps}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="teleitor"
                          className="text-xs font-medium text-slate-600"
                        >
                          T. Eleitor:
                        </label>
                        <input
                          type="text"
                          id="teleitor"
                          name="teleitor"
                          value={formData.teleitor}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* =================================================
                                       PESSOA JURÍDICA
                                    ================================================== */
                  <>
                    <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="nome"
                          className="text-xs font-medium text-slate-600"
                        >
                          Razão Social:
                        </label>
                        <input
                          type="text"
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="nome_fantasia"
                          className="text-xs font-medium text-slate-600"
                        >
                          Nome Fantasia:
                        </label>
                        <input
                          type="text"
                          id="nome_fantasia"
                          name="nome_fantasia"
                          value={formData.nome_fantasia}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="inscricao_estadual"
                          className="text-xs font-medium text-slate-600"
                        >
                          Insc. Estadual:
                        </label>
                        <input
                          type="text"
                          id="inscricao_estadual"
                          name="inscricao_estadual"
                          value={formData.inscricao_estadual}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                    <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="cnpj"
                          className="text-xs font-medium text-slate-600"
                        >
                          CNPJ:
                        </label>
                        <IMaskInput
                          mask={cnpjMask}
                          type="text"
                          id="cnpj"
                          name="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj || ""}
                          onAccept={(value) =>
                            handleMaskedInputChange("cnpj", value)
                          }
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_nome"
                          className="text-xs font-medium text-slate-600"
                        >
                          Nome do Representante:
                        </label>
                        <input
                          type="text"
                          id="representante_nome"
                          name="representante_nome"
                          value={formData.representante_nome || ""}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_nacionalidade"
                          className="text-xs font-medium text-slate-600"
                        >
                          Nacionalidade:
                        </label>
                        <input
                          type="text"
                          id="representante_nacionalidade"
                          name="representante_nacionalidade"
                          value={formData.representante_nacionalidade || ""}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_cpf"
                          className="text-xs font-medium text-slate-600"
                        >
                          CPF do Representante:
                        </label>
                        <IMaskInput
                          mask={cpf_representanteMask}
                          type="text"
                          placeholder="000.000.000-00"
                          id="representante_cpf"
                          name="representante_cpf"
                          value={formData.representante_cpf || ""}
                          onAccept={(value) =>
                            handleMaskedInputChange("representante_cpf", value)
                          }
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_rg"
                          className="text-xs font-medium text-slate-600"
                        >
                          RG do Representante:
                        </label>
                        <input
                          type="text"
                          id="representante_rg"
                          name="representante_rg"
                          value={formData.representante_rg || ""}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_profissao"
                          className="text-xs font-medium text-slate-600"
                        >
                          Profissão:
                        </label>
                        <input
                          type="text"
                          id="representante_profissao"
                          name="representante_profissao"
                          value={formData.representante_profissao || ""}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_estado_civil"
                          className="text-xs font-medium text-slate-600"
                        >
                          Estado Civil:
                        </label>
                        <input
                          type="text"
                          id="representante_estado_civil"
                          name="representante_estado_civil"
                          value={formData.representante_estado_civil || ""}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_cargo"
                          className="text-xs font-medium text-slate-600"
                        >
                          Cargo:
                        </label>
                        <input
                          type="text"
                          id="representante_cargo"
                          name="representante_cargo"
                          value={formData.representante_cargo || ""}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_celular"
                          className="text-xs font-medium text-slate-600"
                        >
                          Telefone do Representante:
                        </label>
                        <IMaskInput
                          mask={celularMask}
                          type="tel"
                          id="representante_celular"
                          name="representante_celular"
                          placeholder="(00) 00000-0000"
                          value={formData.representante_celular || ""}
                          onAccept={(value) =>
                            handleMaskedInputChange(
                              "representante_celular",
                              value,
                            )
                          }
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor="representante_email"
                          className="text-xs font-medium text-slate-600"
                        >
                          E-mail do Representante:
                        </label>
                        <input
                          type="email"
                          id="representante_email"
                          name="representante_email"
                          placeholder="exemplo@dominio.com.br"
                          value={formData.representante_email || ""}
                          onChange={handleInputChange}
                          className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                  </>
                )}
                {/* =====================================================
                            ENDEREÇO
                        ====================================================== */}
                <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="cep"
                      className="text-xs font-medium text-slate-600"
                    >
                      CEP:
                    </label>
                    <IMaskInput
                      mask={cepMask}
                      type="text"
                      id="cep"
                      name="cep"
                      placeholder="00000-000"
                      value={formData.cep}
                      onAccept={(value) =>
                        handleMaskedInputChange("cep", value)
                      }
                      onBlur={() => fetchAddressByCep(formData.cep)}
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="numero"
                      className="text-xs font-medium text-slate-600"
                    >
                      Numero:
                    </label>
                    <input
                      type="text"
                      id="numero"
                      name="numero"
                      value={formData.numero}
                      onChange={handleInputChange}
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="cidade"
                      className="text-xs font-medium text-slate-600"
                    >
                      Cidade:
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="bairro"
                      className="text-xs font-medium text-slate-600"
                    >
                      Bairro:
                    </label>
                    <input
                      type="text"
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="endereco"
                      className="text-xs font-medium text-slate-600"
                    >
                      Endereço:
                    </label>
                    <input
                      type="text"
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleInputChange}
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                </div>
                {/* =====================================================
                            CONTATOS
                        ====================================================== */}
                <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="estado"
                      className="text-xs font-medium text-slate-600"
                    >
                      Estado:
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado || ""}
                      onChange={handleInputChange}
                      className="h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    >
                      <option value="">Selecione o Estado</option>
                      {estados.map((estado) => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="telefone"
                      className="text-xs font-medium text-slate-600"
                    >
                      Telefone:
                    </label>
                    <IMaskInput
                      mask={telefoneMask}
                      type="tel"
                      id="telefone"
                      name="telefone"
                      placeholder="(00) 0000-0000"
                      value={formData.telefone}
                      onAccept={(value) =>
                        handleMaskedInputChange("telefone", value)
                      }
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="celular"
                      className="text-xs font-medium text-slate-600"
                    >
                      Celular:
                    </label>
                    <IMaskInput
                      mask={celularMask}
                      type="tel"
                      id="celular"
                      name="celular"
                      placeholder="(00) 0000-0000"
                      value={formData.celular}
                      onAccept={(value) =>
                        handleMaskedInputChange("celular", value)
                      }
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label
                      htmlFor="email"
                      className="text-xs font-medium text-slate-600"
                    >
                      Email:
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="exemplo@dominio.com.br"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>
                </div>
                {/* =====================================================
                            CÔNJUGE
                        ====================================================== */}
                {tipoCliente === "fisica" && (
                  <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor="estado_civil"
                        className="text-xs font-medium text-slate-600"
                      >
                        Est. civil:
                      </label>
                      <input
                        type="text"
                        id="estado_civil"
                        name="estado_civil"
                        value={formData.estado_civil}
                        onChange={handleInputChange}
                        className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor="conjuge"
                        className="text-xs font-medium text-slate-600"
                      >
                        Cônjuge:
                      </label>
                      <input
                        type="text"
                        id="conjuge"
                        name="conjuge"
                        value={formData.conjuge}
                        onChange={handleInputChange}
                        className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor="cpf_conjuge"
                        className="text-xs font-medium text-slate-600"
                      >
                        CPF Cônjuge:
                      </label>
                      <IMaskInput
                        mask={cpf_conjugeMask}
                        type="text"
                        id="cpf_conjuge"
                        placeholder="000.000.000-00"
                        name="cpf_conjuge"
                        value={formData.cpf_conjuge}
                        onAccept={(value) =>
                          handleMaskedInputChange("cpf_conjuge", value)
                        }
                        className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <label
                        htmlFor="rg_conjuge"
                        className="text-xs font-medium text-slate-600"
                      >
                        RG Cônjuge:
                      </label>
                      <input
                        type="text"
                        id="rg_conjuge"
                        name="rg_conjuge"
                        value={formData.rg_conjuge}
                        onChange={handleInputChange}
                        className="h-8 w-full min-w-0 rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                )}
                {/* =====================================================
                            UPLOAD
                        ====================================================== */}
                <div
                  id="pdf-upload"
                  className="mb-3 rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-300"
                  />
                </div>
                {/* =====================================================
                            BOTÕES
                        ====================================================== */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    required
                    id="status-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`h-8 rounded border px-2.5 text-xs font-semibold outline-none ${formData.status === "EM ABERTO"
                      ? "border-green-300 bg-green-50 text-green-700"
                      : formData.status === "ENCERRADO"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-300 bg-white text-slate-600"
                      }`}
                  >
                    <option value="" disabled>
                      STATUS
                    </option>
                    <option value="EM ABERTO">EM ABERTO</option>
                    <option value="ENCERRADO">ENCERRADO</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleLimpar}
                    className="h-8 rounded bg-slate-500 px-3 text-xs font-semibold text-white transition hover:bg-slate-600"
                  >
                    LIMPAR
                  </button>
                  <button
                    type="submit"
                    className="h-8 rounded bg-blue-300 px-3 text-xs font-semibold text-white transition hover:bg-blue-600"
                  >
                    {isEditing ? "ATUALIZAR" : "CADASTRAR"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="h-8 rounded bg-red-500 px-3 text-xs font-semibold text-white transition hover:bg-red-600"
                    >
                      EXCLUIR
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!selectedClienteId}
                    className="h-8 rounded bg-orange-500 px-3 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const pdfSelecionado = pdfs.find(
                        (p) => p.id === selectedPdfId,
                      );
                      const isProcuracaoSelecionada =
                        pdfSelecionado &&
                        pdfSelecionado.nome_arquivo
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .toLowerCase()
                          .includes("procuracao");
                      if (isProcuracaoSelecionada) {
                        handleEnviarParaZapsign(
                          pdfSelecionado.id,
                          pdfSelecionado.nome_arquivo,
                        );
                      } else {
                        setSelectedLinkType("cadastro");
                        setProcuracaoSelecionada("");
                        setShowProcuracaoList(false);
                        setShowLinkOptions(true);
                      }
                    }}
                  >
                    {selectedPdfId &&
                      pdfs
                        .find((p) => p.id === selectedPdfId)
                        ?.nome_arquivo.normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLowerCase()
                        .includes("procuracao")
                      ? "Enviar para Zapsign"
                      : "Gerar Link"}
                  </button>
                </div>
                {/* =====================================================
                            MODAL
                        ====================================================== */}
                {showLinkOptions && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
                      <h4 className="mb-4 text-sm font-semibold text-slate-800">
                        Escolha uma das opções:
                      </h4>
                      {showProcuracaoList ? (
                        <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
                          {procuracaoList.length > 0 ? (
                            procuracaoList.map(
                              (procuracao: {
                                id: number;
                                nome_original: string;
                              }) => (
                                <label
                                  key={procuracao.id}
                                  className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <input
                                    type="radio"
                                    name={`${selectedLinkType}_type`}
                                    value={procuracao.nome_original}
                                    checked={
                                      procuracaoSelecionada ===
                                      procuracao.nome_original
                                    }
                                    onChange={(e) =>
                                      setProcuracaoSelecionada(e.target.value)
                                    }
                                    className="h-3.5 w-3.5 accent-blue-600"
                                  />
                                  {procuracao?.nome_original
                                    ?.replace(/\.(pdf|html)$/i, "")
                                    .replace(/^procuracao_/i, "")
                                    .replace(/^declaracao_de_/i, "Declaração de ")
                                    .replace(/_/g, " ")
                                    .replace(/hipossuficiencia/gi, "Hipossuficiência")
                                    .replace(/\bpf\b/gi, "PF")}
                                </label>
                              ),
                            )
                          ) : (
                            <p className="py-3 text-xs text-slate-500">
                              Nenhum documento de {selectedLinkType ===
                                "declaracao"
                                ? "declaração"
                                : "procuração"} encontrado.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <label
                            key="cadastro"
                            className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <input
                              type="radio"
                              value="cadastro"
                              checked={selectedLinkType === "cadastro"}
                              onChange={() => setSelectedLinkType("cadastro")}
                              className="h-3.5 w-3.5 accent-blue-600"
                            />
                            Link de Cadastro
                          </label>
                          <label
                            key="procuracao"
                            className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <input
                              type="radio"
                              value="procuracao"
                              checked={selectedLinkType === "procuracao"}
                              onChange={async () => {
                                setSelectedLinkType("procuracao");
                                setProcuracaoSelecionada("");
                                try {
                                  const token =
                                    localStorage.getItem("authToken");
                                  if (!token) {
                                    console.error(
                                      "Token não encontrado no localStorage",
                                    );
                                    return;
                                  }
                                  const cleanToken = token
                                    .replace(/['"]+/g, "")
                                    .trim();
                                  const response = await fetch(
                                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/documentos/procuracao`,
                                    {
                                      method: "GET",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${cleanToken}`,
                                      },
                                    },
                                  );
                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    console.error(
                                      "Erro retornado pelo backend:",
                                      errorData,
                                    );
                                    throw new Error(`Erro ${response.status}`);
                                  }
                                  const data = await response.json();
                                  setProcuracaoList(data);
                                  setShowProcuracaoList(true);
                                } catch (error) {
                                  console.error(
                                    "Erro ao carregar procurações:",
                                    error,
                                  );
                                  alert(
                                    "Erro ao carregar documentos de procuração.",
                                  );
                                }
                              }}
                              className="h-3.5 w-3.5 accent-blue-600"
                            />
                            Criar Procuração
                          </label>
                          <label
                            key="declaracao"
                            className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <input
                              type="radio"
                              value="declaracao"
                              checked={selectedLinkType === "declaracao"}
                              onChange={async () => {
                                setSelectedLinkType("declaracao");
                                setProcuracaoSelecionada("");
                                try {
                                  const token =
                                    localStorage.getItem("authToken");
                                  if (!token) {
                                    console.error(
                                      "Token não encontrado no localStorage",
                                    );
                                    return;
                                  }
                                  const cleanToken = token
                                    .replace(/['"]+/g, "")
                                    .trim();
                                  const response = await fetch(
                                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/documentos/declaracao`,
                                    {
                                      method: "GET",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${cleanToken}`,
                                      },
                                    },
                                  );
                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    console.error(
                                      "Erro retornado pelo backend:",
                                      errorData,
                                    );
                                    throw new Error(`Erro ${response.status}`);
                                  }
                                  const data = await response.json();
                                  setProcuracaoList(data);
                                  setShowProcuracaoList(true);
                                } catch (error) {
                                  console.error(
                                    "Erro ao carregar declarações:",
                                    error,
                                  );
                                  alert(
                                    "Erro ao carregar documentos de declaração.",
                                  );
                                }
                              }}
                              className="h-3.5 w-3.5 accent-blue-600"
                            />
                            Criar Declaração de Hipossuficiência
                          </label>
                        </div>
                      )}
                      <div className="mt-5 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              selectedLinkType === "cadastro" ||
                              ((selectedLinkType === "procuracao" ||
                                selectedLinkType === "declaracao") &&
                                procuracaoSelecionada)
                            ) {
                              handleGerarLink(
                                selectedLinkType,
                                procuracaoSelecionada,
                              );
                              setShowLinkOptions(false);
                            } else {
                              alert(
                                `Selecione uma ${selectedLinkType === "declaracao"
                                  ? "declaração"
                                  : "procuração"
                                } para continuar.`,
                              );
                            }
                          }}
                          className="h-8 rounded bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLinkOptions(false)}
                          className="h-8 rounded bg-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* =====================================================
                            LINK GERADO
                        ====================================================== */}
                {linkGerado && (
                  <div className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2">
                    <p className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                      <span className="font-semibold">
                        Link para o cliente:
                      </span>
                      <a
                        href={linkGerado}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-w-full break-all text-blue-600 hover:underline"
                      >
                        {linkGerado}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="h-7 rounded bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Copiar Link
                      </button>
                    </p>
                    <input
                      type="text"
                      ref={linkRef}
                      defaultValue={linkGerado}
                      className="absolute left-[-9999px]"
                    />
                  </div>
                )}
                {linkProcuracao && (
                  <div className="mt-3 rounded border border-purple-200 bg-purple-50 px-3 py-2">
                    <p className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                      <span className="font-semibold">Link da procuração:</span>
                      <a
                        href={linkProcuracao}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-w-full break-all text-purple-600 hover:underline"
                      >
                        {linkProcuracao}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyProcuracaoLink}
                        className="h-7 rounded bg-purple-600 px-3 text-xs font-semibold text-white hover:bg-purple-700"
                      >
                        Copiar Link
                      </button>
                    </p>
                  </div>
                )}
              </div>
              {/* =====================================================
                        PAINEL DIREITO
                    ====================================================== */}
              <div className="min-w-0">
                <div className="min-w-0">
                  {/* =================================================
                                CLIENTES
                            ================================================== */}
                  <div className="mb-4 min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-600">
                        Lista de Clientes
                      </h3>
                      <input
                        type="text"
                        id="client-search-input"
                        className="h-8 w-64 max-w-full rounded border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        placeholder="Pesquisar por nome ou CPF/CNPJ..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    <div className="h-[230px] min-w-0 overflow-auto rounded border border-slate-200 bg-white">
                      <table className="w-full min-w-[400px] border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-slate-100">
                          <tr>
                            <th className="h-8 border-b border-slate-200 px-2 text-left font-semibold text-slate-600">
                              ID
                            </th>
                            <th className="h-8 border-b border-slate-200 px-2 text-left font-semibold text-slate-600">
                              Nome
                            </th>
                            <th className="h-8 border-b border-slate-200 px-2 text-left font-semibold text-slate-600">
                              Celular
                            </th>
                          </tr>
                        </thead>
                        <tbody id="client-table-body">
                          {isLoading ? (
                            <tr key="loading">
                              <td
                                colSpan={3}
                                className="px-2 py-2 text-center text-xs text-slate-500"
                              >
                                Carregando clientes...
                              </td>
                            </tr>
                          ) : error ? (
                            <tr key="error">
                              <td
                                colSpan={3}
                                className="px-2 py-2 text-center text-xs text-red-600"
                              >
                                Erro ao carregar os clientes: {error}
                              </td>
                            </tr>
                          ) : (
                            clientes.map((cliente, index) => (
                              <tr
                                key={
                                  cliente.id ? cliente.id : `juridica-${index}`
                                }
                                onClick={() => handleClienteSelect(cliente)}
                                className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50 ${selectedClienteId === cliente.id
                                  ? "bg-blue-100"
                                  : "bg-white"
                                  }`}
                              >
                                <td className="h-8 px-2 text-slate-600">
                                  {cliente.id}
                                </td>
                                <td className="h-8 max-w-[250px] truncate px-2 text-slate-700">
                                  {cliente.nome}
                                </td>
                                <td className="h-8 px-2 text-slate-600">
                                  {cliente.celular}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* =================================================
                                PDFs
                            ================================================== */}
                  <div className="min-w-0">
                    <h3 className="mb-2 text-sm font-semibold text-slate-600">
                      Arquivos do Cliente
                    </h3>
                    <div className="h-[250px] min-w-0 overflow-auto rounded border border-slate-200 bg-white">
                      <table className="w-full min-w-[500px] border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-slate-100">
                          <tr>
                            <th className="h-8 border-b border-slate-200 px-2 text-left font-semibold text-slate-600">
                              Nome do Arquivo
                            </th>
                            <th className="h-8 border-b border-slate-200 px-2 text-left font-semibold text-slate-600">
                              Data / Hora
                            </th>
                            <th className="h-8 border-b border-slate-200 px-2"></th>
                          </tr>
                        </thead>
                        <tbody id="pdf-table-body">
                          {pdfs.length > 0 ? (
                            pdfs.map((pdf) => (
                              <tr
                                key={pdf.id}
                                onClick={() => handlePdfClick(pdf)}
                                onDoubleClick={() => handlePdfDoubleClick(pdf)}
                                className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50 ${selectedPdfId === pdf.id
                                  ? "bg-blue-100"
                                  : "bg-white"
                                  }`}
                              >
                                <td className="h-8 max-w-[300px] px-2 text-slate-700">
                                  {editingPdfId === pdf.id ? (
                                    <input
                                      type="text"
                                      value={tempNome}
                                      autoFocus
                                      onChange={(e) =>
                                        setTempNome(e.target.value)
                                      }
                                      onBlur={() => {
                                        if (editingPdfId === pdf.id) {
                                          handleSalvarNome(pdf.id);
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleSalvarNome(pdf.id);
                                        }
                                        if (e.key === "Escape") {
                                          e.preventDefault();
                                          setEditingPdfId(null);
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-7 w-full rounded border border-blue-500 px-2 text-xs outline-none focus:ring-1 focus:ring-blue-200"
                                    />
                                  ) : (
                                    <span className="block max-w-full truncate">
                                      {pdf.nome_arquivo}
                                    </span>
                                  )}
                                </td>
                                <td className="h-8 whitespace-nowrap px-2 text-slate-600">
                                  {formatarData(pdf.data)}
                                </td>
                                <td className="h-8 px-2">
                                  <a
                                    href={pdf.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  ></a>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr key="no-pdfs">
                              <td
                                colSpan={3}
                                className="px-2 py-3 text-center text-xs text-slate-500"
                              >
                                {selectedClienteId
                                  ? "Nenhum Arquivo encontrado!"
                                  : "Selecione um cliente para ver os Arquivos."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
