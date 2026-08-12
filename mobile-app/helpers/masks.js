// Arquivo: mobile-app/helpers/masks.js

// Função para formatar CPF e CNPJ
export const maskarCNPJCPF = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, ''); // Remove tudo que não for dígito
  
  // CNPJ
  if (value.length > 11) {
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
  } 
  
  // CPF
  return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
};

// Se precisar, pode adicionar outras máscaras úteis aqui
export const maskarCelular = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value;
};

export const maskarCEP = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{5})(\d{3}).*/, '$1-$2');
  return value;
};