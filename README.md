# Assessoria Interagir

Sistema web desenvolvido para a **Assessoria Interagir**, voltado à gestão de clientes, documentos e processos internos, além de disponibilizar o site institucional da empresa.

O projeto reúne uma aplicação web moderna, API própria e integração com serviços em nuvem.

## 🚀 Sobre o projeto

A plataforma foi desenvolvida para centralizar ferramentas utilizadas pela Assessoria Interagir em um único ambiente.

O projeto contempla:

- Site institucional
- Área restrita para usuários
- Gestão de clientes
- Gestão de documentos
- Controle de acesso por usuário
- Documentos públicos e privados
- Upload e armazenamento de arquivos
- Geração de procurações
- Assinatura digital de documentos
- Blog institucional
- Notificações
- Auditoria de alterações e exclusões
- Aplicativo mobile integrado ao sistema

## 🛠️ Tecnologias

### Frontend

- Next.js
- React
- TypeScript
- CSS Modules
- App Router

### Backend

- Node.js
- Express
- MySQL
- JWT
- Bcrypt

### Mobile

- React Native
- Expo
- Expo Router

### Infraestrutura

- AWS
- Amazon EC2
- Amazon S3
- Nginx
- PM2
- Vercel
- MySQL

## ☁️ Arquitetura

A aplicação utiliza uma arquitetura separada entre frontend, backend e aplicativo mobile.

```text
                  ┌─────────────────────┐
                  │       Usuário       │
                  └──────────┬──────────┘
                             │
               ┌─────────────┴─────────────┐
               │                           │
        ┌──────▼──────┐             ┌──────▼──────┐
        │   Next.js   │             │ React Native│
        │     Web     │             │    Mobile   │
        └──────┬──────┘             └──────┬──────┘
               │                           │
               └─────────────┬─────────────┘
                             │
                      ┌──────▼──────┐
                      │ Node.js API │
                      │   Express   │
                      └──────┬──────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼──────┐           ┌──────▼──────┐
         │    MySQL    │           │  Amazon S3  │
         │    Dados    │           │  Arquivos   │
         └─────────────┘           └─────────────┘
```

## 📁 Estrutura do projeto

```text
AssociadosWeb/
│
├── frontend-nextjs/
│   └── Aplicação web em Next.js
│
├── backend-nodejs/
│   └── API e regras de negócio
│
├── mobile-app/
│   └── Aplicativo mobile
│
└── README.md
```

## 🔐 Segurança

O sistema possui mecanismos de segurança e controle de acesso, incluindo:

- Autenticação via JWT
- Senhas protegidas com hash
- Controle de permissões
- Separação entre usuários administradores e usuários padrão
- Documentos públicos e privados
- Validação de acesso no backend
- CORS configurado
- Auditoria de operações
- Variáveis sensíveis armazenadas fora do código-fonte

## 📄 Gestão de documentos

Os documentos podem ser associados aos clientes e armazenados em nuvem.

O sistema permite:

- Upload de documentos
- Visualização
- Download
- Controle de acesso
- Geração de procurações
- Integração com assinatura digital
- Registro de exclusões para auditoria

## 🌐 Site institucional

Além do sistema administrativo, o projeto possui um site público da Assessoria Interagir com:

- Apresentação institucional
- Serviços
- Conteúdo sobre terceiro setor
- Blog
- Formulário de contato
- SEO
- Sitemap
- Open Graph
- Layout responsivo

## 📱 Aplicativo mobile

O aplicativo utiliza a mesma API do sistema web, permitindo acesso aos principais recursos através de dispositivos móveis.

Entre os recursos estão autenticação, consulta de clientes, documentos e notificações.

## ⚙️ Ambiente de desenvolvimento

### Requisitos

- Node.js
- npm
- MySQL

Clone o projeto:

```bash
git clone <URL-DO-REPOSITORIO>
```

Instale as dependências de cada aplicação antes de executá-la.

### Frontend

```bash
cd frontend-nextjs
npm install
npm run dev
```

### Backend

```bash
cd backend-nodejs
npm install
npm run dev
```

## 🔑 Variáveis de ambiente

O projeto utiliza variáveis de ambiente para configurações sensíveis.

Crie os respectivos arquivos `.env` seguindo a configuração do ambiente.

> ⚠️ Credenciais, tokens, chaves privadas e arquivos `.env` não devem ser adicionados ao repositório.

## 🚀 Deploy

A arquitetura de produção utiliza serviços independentes para aplicação, API, armazenamento e banco de dados.

Isso permite atualizar cada componente sem necessidade de realizar o deploy completo da plataforma.

## 👨‍💻 Desenvolvimento

Projeto desenvolvido e mantido por **Moises Pimentel**.

---

### Assessoria Interagir

**Gestão, Captação e Assessoria Jurídica para o Terceiro Setor**