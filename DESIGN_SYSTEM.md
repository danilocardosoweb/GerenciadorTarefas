# 🎨 TecnoPerfil Design System v1.0

Este documento define os padrões visuais e de interação para o ecossistema de gestão industrial da TecnoPerfil Alumínio.

## 1. Fundamentos Visuais

### Paleta de Cores (Industrial Palette)
| Categoria | Valor HEX | Tailwind Class | Aplicação |
| :--- | :--- | :--- | :--- |
| **Primária** | `#2563eb` | `blue-600` | Botões principais, ícones de destaque, progresso. |
| **Superfície** | `#ffffff` | `white` | Cards, backgrounds de modais e inputs. |
| **Aço (Dark)** | `#0f172a` | `slate-900` | Sidebar, headers de alta hierarquia, alertas de sistema. |
| **Aço (Light)** | `#f8fafc` | `slate-50` | Background geral do app. |
| **Sucesso** | `#10b981` | `emerald-500` | Conclusão de etapas, status "Em Produção". |
| **Crítico** | `#e11d48` | `rose-600` | Atrasos, material insuficiente, cancelamentos. |
| **Alerta** | `#f59e0b` | `amber-500` | Materiais em nível mínimo, aguardando aprovação. |

### Tipografia
Utilizamos a fonte **Inter** por sua neutralidade e excelente leitura em tabelas técnicas.
- **Headings (Industrial):** `font-black text-slate-900 uppercase tracking-tight`.
- **Labels Técnicos:** `font-black text-[10px] uppercase tracking-widest text-slate-400`.
- **Corpo de Texto:** `font-medium text-slate-600 leading-relaxed`.

## 2. Componentes de Interface

### Modais (Industrial Glass)
- **Border Radius:** `rounded-[40px]` (Suavidade e modernidade).
- **Backdrop:** `bg-slate-900/60 backdrop-blur-sm`.
- **Animação:** `animate-in zoom-in-95 duration-200`.

### Botões Industriais
- **Ação Principal:** `px-8 py-4 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100`.
- **Ghost (Secundário):** `px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-400 font-black`.

### Pills de Status
- **Design:** Cantos arredondados (`rounded-full` ou `rounded-lg`), bordas suaves e texto em uppercase de 9px.
- **Interação:** Devem possuir um indicador visual circular (`span w-2 h-2 rounded-full`) indicando "Pulso" se o status for crítico.

## 3. Experiência do Usuário (UX)
1. **Feedback Imediato:** Toda ação de salvar deve disparar uma transição visual.
2. **Confirmação Industrial:** Ações críticas (excluir material, reabrir OP) exigem o `ConfirmationModal`.
3. **Hierarquia de Dados:** Informações de PCP (Datas, OPs) sempre aparecem em destaque sobre descrições longas.
