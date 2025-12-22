# Order Import

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
- **Order Import: Formatar**: Formata os imports no arquivo atual
- **Order Import: Selecionar Tipo 1 (Normal)**: Ativa formatação normal (ordenado por tamanho)
- **Order Import: Selecionar Tipo 2 (Alinhado)**: Ativa formatação alinhada (alinhado pelo from)

## Configurações

- `orderImport.organizeOnSave`: Ativar formatação ao salvar (padrão: true)
- `orderImport.formatStyle`: Estilo de formatação - "normal" ou "aligned" (padrão: "aligned")

## Uso

1. Selecione o tipo de formatação desejado (Tipo 1 ou Tipo 2)
2. Use o comando "Formatar" ou salve o arquivo (se ativado)
3. Os imports serão organizados automaticamente
