#  AMENDOBENTO DETECTOR

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-purple.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![Roboflow](https://img.shields.io/badge/Roboflow-AI_Inference-6700FF.svg)](https://roboflow.com/)

O **AMENDOBENTO Detector** é uma plataforma **SCADA Industrial Preditiva com Visão Computacional por Inteligência Artificial**, projetada para otimizar, monitorar e automatizar o controle de qualidade do processo de torração de amendoim em tempo real.

Utilizando modelos de detecção de objetos hospedados no **Roboflow** e persistência em tempo real via **Supabase (PostgreSQL + Storage)**, a aplicação auxilia operadores de chão de fábrica e administradores a evitar desperdícios e garantir o ponto ideal de torra.

---

##  Principais Funcionalidades

###  1. Detecção & Análise por IA (Roboflow)
- **Classificação Automática de Estágios de Torra**:
  - ⚪ `cru` — Amendoim Cru / Início da Torra
  - 🟡 `clara` — Torra Clara
  - 🟠 `quase` — Quase no Ponto Ideal
  - 🟢 `ideal` — Ponto Ideal de Torração
  - 🔴 `passou` — Passou do Ponto / Queimado
- Desenho dinâmico em Canvas com **Bounding Boxes** (caixas delimitadoras) e porcentagem de confiança da inferência.
- Suporte a captura direta por câmera (mobile/desktop) ou upload de arquivos de imagem.
- Modos de simulação e fallback caso a API ao vivo esteja temporariamente inacessível.

###  2. Dashboard SCADA Industrial
- Visão geral do status de operação de todos os fornos cadastrados.
- Gráficos dinâmicos de eficiência, tempo médio de torra e histórico recente utilizando **Recharts**.
- Indicadores KPI industriais (Taxa de Acerto da IA, Eficiência Global, Alertas Ativos).

###  3. Modo Kiosk / TV Industrial
- Modo de exibição otimizado para monitores de alta visibilidade e Smart TVs instaladas no chão de fábrica.
- Alternância automática entre fornos com cronômetros visuais e transmissão em tempo real das análises de IA.

###  4. Histórico & Galeria de Análises
- Registro detalhado de sessões de torra com linha do tempo de eventos (início, análises de IA, alterações de estágio e alertas).
- Galeria de imagens com busca por operador, filtros por estágio de torra e opção de exclusão integrada com o **Supabase DB & Storage**.

###  5. RLHF & Evolução do Modelo (Feedback Humano)
- Botões de concordância/discordância operacional diretamente na análise (`Concordar` / `Corrigir Estágio`).
- Painel de métricas de acurácia percebida para acompanhamento de retreinamento do modelo de visão computacional.

###  6. Alertas Preditivos & Manutenção
- Notificações automáticas de atingimento do ponto ideal, lembretes de fotografia periódica e sugestões de manutenção preventiva.

###  7. Gestão de Operadores e Autenticação
- Autenticação e controle de acesso por papéis (**Operador** vs **Administrador**).
- Persistência e validação de usuários via tabela `public.users` no Supabase.

---

##  Tecnologias Utilizadas

- **Frontend**: React 18 (TypeScript), Vite
- **Estilização**: TailwindCSS, Lucide React (Ícones industriais)
- **Visualização de Dados**: Recharts
- **Banco de Dados & Storage**: Supabase (PostgreSQL / Storage Buckets)
- **Modelos de Visão Computacional**: Roboflow Inference API

---

##  Estrutura de Pastas do Projeto

```text
amendobento_detector/
├── .env.example              # Modelo de variáveis de ambiente
├── .gitignore                # Regras do Git (protege .env e credenciais)
├── BD.md                     # Documentação de schemas e scripts SQL do Supabase
├── index.html                # HTML principal da aplicação
├── package.json              # Dependências e scripts do Node.js
├── tailwind.config.js        # Configuração do TailwindCSS
├── tsconfig.json             # Configurações do TypeScript
├── vite.config.ts            # Configuração de build do Vite
└── src/
    ├── main.tsx              # Ponto de entrada do React
    ├── index.css             # Estilos globais e Tailwind
    ├── components/           # Componentes reutilizáveis
    │   ├── aiFeedback/       # Interface de feedback humano para IA
    │   ├── auth/             # Modal e telas de autenticação
    │   ├── common/           # Navbar, modais e alertas
    │   ├── oven/             # Modais de novo forno e seleção
    │   └── roast/            # Timeline e barra de progresso da torra
    ├── contexts/             # Contextos de Estado (AuthContext, RoastContext)
    ├── pages/                # Páginas da aplicação (Dashboard, ActiveRoast, KioskTv, etc.)
    ├── services/             # Serviços de API (roboflowService, supabaseService, storageService)
    └── types/                # Definições de tipos TypeScript (roast.ts)
```

---

##  Configuração & Instalação

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm` ou `yarn`

### 2. Clonar o Repositório
```bash
git clone https://github.com/giovannymartins25/amendobento_detector.git
cd amendobento_detector
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (baseando-se no arquivo `.env.example`):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_jwt
VITE_ROBOFLOW_API_KEY=sua_chave_api_roboflow
VITE_ROBOFLOW_MODEL_ENDPOINT=amendobento/1
```

### 5. Configurar o Banco de Dados (Supabase)
Consulte o arquivo [`BD.md`](file:///c:/Users/micro/Desktop/amendobento_detector/BD.md) para executar os scripts DDL SQL necessários no **SQL Editor** do Supabase para a criação das tabelas:
- `public.users`
- `public.ovens`
- `public.roast_sessions`
- `public.analyses`
- `public.predictive_alerts`

---

##  Executando a Aplicação

### Modo de Desenvolvimento
Para iniciar o servidor local com Hot Reloading:
```bash
npm run dev
```
Acesse no navegador: `http://localhost:5173`

### Compilar para Produção
Para gerar a build otimizada de produção:
```bash
npm run build
```

### Visualizar Build Localmente
```bash
npm run preview
```
