# Order Import

[![Version](https://img.shields.io/visual-studio-marketplace/v/josAugusto.order-import?style=flat-square&label=VS%20Code%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=josAugusto.order-import)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/josAugusto.order-import?style=flat-square&label=Downloads)](https://marketplace.visualstudio.com/items?itemName=josAugusto.order-import)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/josAugusto.order-import?style=flat-square&label=Rating)](https://marketplace.visualstudio.com/items?itemName=josAugusto.order-import)
[![License](https://img.shields.io/github/license/josemoura212/order-import?style=flat-square)](https://github.com/josemoura212/order-import/blob/main/LICENSE)

Extensão para organizar e formatar imports automaticamente em arquivos JavaScript/TypeScript/React.

## Funcionalidades

- Organiza imports automaticamente ao salvar
- Prioriza imports especiais (fix-ts-path) sempre no topo
- Separa imports por tipo seguindo ordem de precedência
- Dois estilos de formatação:
  - **Tipo 1 (Normal)**: Ordena pelo tamanho do nome (menor primeiro)
  - **Tipo 2 (Alinhado)**: Ordena alfabeticamente pelo caminho e alinha pelo 'from'

## Ordem de Precedência

Os imports são organizados na seguinte ordem de prioridade:

1. **Side-effect imports do fix-ts-path** (ex: `import '../utils/fix-ts-path';`)
2. **Imports com asterisco (*)** (ex: `import * as React from 'react';`)
3. **Named imports {}** (ex: `import { Component } from 'react';`)
4. **Default imports** (ex: `import React from 'react';`)

Dentro de cada categoria, os imports são ordenados:
- **Tipo 1 (Normal)**: Por tamanho do nome (menor primeiro)
- **Tipo 2 (Alinhado)**: Alfabeticamente pelo caminho

## Exemplos

### Tipo 1 (Normal) - Ordenado por tamanho

Antes:
```typescript
import { ThemeProvider } from '@mui/material/styles';
import { Header } from './components/header';
import Box from '@mui/material/Box';
import { Layout } from './components/layout';
import { appThema } from './config/theme';
import ListCategory from './features/categories/list-category';
```

Depois:
```typescript
import { Header } from './components/header';
import { Layout } from './components/layout';
import { appThema } from './config/theme';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ListCategory from './features/categories/list-category';
```

### Tipo 2 (Alinhado) - Ordenado alfabeticamente e alinhado pelo 'from'

Antes:
```typescript
import { Header } from './components/header';
import Box from '@mui/material/Box';
import * as React from 'react';
import { Layout } from './components/layout';
import { appThema } from './config/theme';
import '../utils/fix-ts-path';
import ListCategory from './features/categories/list-category';
```

Depois:
```typescript
import '../utils/fix-ts-path';
import * as React      from 'react';
import { Header }      from './components/header';
import { Layout }      from './components/layout';
import { appThema }    from './config/theme';
import Box             from '@mui/material/Box';
import ListCategory    from './features/categories/list-category';
```

## Comandos

- **Order Import: Ativar/Desativar Formatação ao Salvar**: Liga/desliga formatação automática
- **Order Import: Formatar** (`Ctrl+Alt+R` / `Cmd+Alt+R`): Formata os imports no arquivo atual
- **Order Import: Selecionar Tipo 1 (Normal)**: Ativa formatação normal (ordenado por tamanho)
- **Order Import: Selecionar Tipo 2 (Alinhado)**: Ativa formatação alinhada (alinhado pelo from)
- **Order Import: Ativar/Desativar Otimização MUI**: Liga/desliga otimização de imports do Material-UI

## Configurações

- `orderImport.organizeOnSave`: Ativar formatação ao salvar (padrão: `true`)
- `orderImport.formatStyle`: Estilo de formatação - `"normal"` ou `"aligned"` (padrão: `"aligned"`)
- `orderImport.muiOptimization`: Otimizar imports do Material-UI para tree-shaking (padrão: `false`)
- `orderImport.groupByType`: Agrupar imports por tipo com linha em branco entre grupos (padrão: `false`)
- `orderImport.pathAliases`: Lista de path aliases do projeto (padrão: `["@/", "~/", "@components/", ...]`)

## Recursos

### 🎯 Otimização Material-UI

Quando ativado, converte automaticamente imports do MUI para melhor tree-shaking:

```typescript
// Antes
import { Button, TextField, Typography } from '@mui/material';

// Depois
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
```

### 📦 Agrupamento por Tipo

Organiza imports em grupos separados por linhas em branco:

```typescript
// Externos (node_modules)
import React from 'react';
import Button from '@mui/material/Button';

// Path aliases
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';

// Relativos
import { Header } from './components/Header';
import styles from './styles.module.css';
```

## Uso

1. Selecione o tipo de formatação desejado (Tipo 1 ou Tipo 2)
2. Configure as opções desejadas (otimização MUI, agrupamento, etc.)
3. Use o atalho `Ctrl+Alt+R` ou salve o arquivo (se formatação automática estiver ativada)
4. Os imports serão organizados automaticamente seguindo suas preferências

## Tecnologias Suportadas

- ✅ JavaScript (ES6+)
- ✅ TypeScript
- ✅ React / JSX / TSX
- ✅ Material-UI (@mui/material, @mui/icons-material, @mui/lab)
- ✅ Path aliases personalizados

## Licença

MIT © [José Augusto](https://github.com/josemoura212)

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests no [repositório do GitHub](https://github.com/josemoura212/order-import).

---

**Aproveite a organização automática de imports!** 🚀
