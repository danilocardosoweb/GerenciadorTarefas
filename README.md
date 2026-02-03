# 🏭 TecnoPerfil - Gestão Industrial 4.0

Sistema avançado para gerenciamento de extrusão de alumínio, integrando PCP, Produção, Qualidade e Logística em uma plataforma unificada.

## 🚀 Tecnologias
- **Frontend:** React 19 + Tailwind CSS (Mobile First).
- **IA Generativa:** Google Gemini (Análise de gargalos e automação de e-mails).
- **Backend/DB:** Supabase (Sincronização em tempo real).
- **Ícones:** Lucide React.
- **Gráficos:** Recharts.

## 🛠 Funcionalidades Principais
1. **Dashboard OEE:** Monitoramento em tempo real da eficiência das extrusoras.
2. **Gestão de Workflow:** Criação de fases industriais detalhadas com atribuição de responsável, prazo e instruções técnicas.
3. **Análise Preditiva:** O botão de IA analisa a carga de trabalho e prevê atrasos baseando-se nas OPs em aberto.
4. **Controle de Insumos:** Gerenciamento de estoque de tarugos e embalagens com alertas visuais de nível crítico.
5. **Auditoria Total:** Histórico imutável de quem abriu, moveu ou finalizou cada etapa do processo.

## 📐 Arquitetura de Workflow
O sistema utiliza um padrão de "Fases Planejadas":
- **Título:** Ação industrial clara.
- **Responsável:** Grupo de permissão (ex: Qualidade).
- **Deadline:** Data limite para cumprimento do SLA.
- **Instruções:** Detalhes técnicos sobre a operação (ex: parâmetros da prensa).

## 🔒 Segurança
- Autenticação por e-mail corporativo.
- Matriz de permissões configurável por setor.
- Visibilidade de tarefas controlada (Global, Setor, Grupo ou Privado).
