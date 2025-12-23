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
  - **Normal**: Ordenado por comprimento (menor primeiro) com 1 espaço antes do `from`
  - **Aligned**: Ordenado por comprimento (menor primeiro) com alinhamento dos `from`
- Otimização de imports Material-UI (opcional)
- Remoção automática de imports não utilizados (opcional)

## ⚠️ Como Funciona a Ordenação

### Ordem de Precedência (SEMPRE nesta ordem):

1. **fix-ts-path imports** (sempre primeiro, se existir)
2. **Asterisk imports** (`import * as Name from`)
3. **Named imports** (`import { ... } from`)
4. **Default imports** (`import Name from`)

### Critério de Ordenação Dentro de Cada Categoria:

**A ordenação é SEMPRE por comprimento do nome/identifiers (menor primeiro), NÃO alfabética!**

#### Exemplo de ordenação por comprimento:
```typescript
// Named imports ordenados por comprimento (menor primeiro)
import { memo, useState } from 'react';                              // 17 caracteres
import { useAgencyInvites } from '../models/agency-invite.model';   // 21 caracteres
import { useAllTranslationFolders } from 'app/apps/i18n/i18n-items.model'; // 29 caracteres
import { openCreateAgencyInvitationDialog } from './agency-manager.facade'; // 38 caracteres

// Default imports ordenados por comprimento (menor primeiro)
import Paper from '@mui/material/Paper';        // 5 caracteres
import Button from '@mui/material/Button';      // 6 caracteres
import Loading from 'app/components/loading-component'; // 7 caracteres
import TextField from '@mui/material/TextField';        // 9 caracteres
import Typography from '@mui/material/Typography';      // 10 caracteres
import InviteItem from './components/invite-item';      // 10 caracteres
```

### Diferença Entre os Modos:

#### Modo Normal
- 1 espaço antes do `from`
- Mantém a ordenação por comprimento

```typescript
import { memo, useState } from 'react';
import { useAgencyInvites } from '../models/agency-invite.model';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
```

#### Modo Aligned
- Adiciona espaços para alinhar todos os `from` verticalmente
- Mantém a mesma ordenação por comprimento

```typescript
import { memo, useState }                      from 'react';
import { useAgencyInvites }                    from '../models/agency-invite.model';
import Button                                  from '@mui/material/Button';
import TextField                               from '@mui/material/TextField';
```

## Exemplos

### Modo Normal - Ordenado por comprimento

Antes:
```typescript
import { useAgencyInvites } from '../models/agency-invite.model';
import { openCreateAgencyInvitationDialog } from './agency-manager.facade';
import { useAllTranslationFolders } from 'app/apps/i18n/i18n-items.model';
import { memo, useState } from 'react';
import InviteItem from './components/invite-item';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Loading from 'app/components/loading-component';
```

Depois:
```typescript
import { memo, useState } from 'react';
import { useAgencyInvites } from '../models/agency-invite.model';
import { useAllTranslationFolders } from 'app/apps/i18n/i18n-items.model';
import { openCreateAgencyInvitationDialog } from './agency-manager.facade';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Loading from 'app/components/loading-component';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InviteItem from './components/invite-item';
```

### Modo Aligned - Ordenado por comprimento com alinhamento

Antes:
```typescript
import { Header } from './components/header';
import Box from '@mui/material/Box';
import * as React from 'react';
import { Layout } from './components/layout';
```

Depois:
```typescript
import * as React  from 'react';
import { Header }  from './components/header';
import { Layout }  from './components/layout';
import Box         from '@mui/material/Box';
```

## Comandos

- **Order Import: Toggle Format on Save**: Liga/desliga formatação automática ao salvar
- **Order Import: Organize Imports** (`Ctrl+Alt+R` / `Cmd+Alt+R`): Formata os imports manualmente
- **Order Import: Select Normal Format**: Ativa formatação normal (1 espaço antes do from)
- **Order Import: Select Aligned Format**: Ativa formatação alinhada (alinha todos os from)
- **Order Import: Toggle MUI Optimization**: Liga/desliga otimização de imports do Material-UI

## Configurações

- `orderImport.organizeOnSave`: Ativar formatação ao salvar (padrão: `true`)
- `orderImport.formatStyle`: Estilo de formatação - `"normal"` ou `"aligned"` (padrão: `"aligned"`)
- `orderImport.muiOptimization`: Otimizar imports do Material-UI para tree-shaking (padrão: `false`)
- `orderImport.removeUnusedImports`: Remover automaticamente imports não utilizados (padrão: `false`)
- `orderImport.optimizeBarrelFiles`: Otimizar imports de barrel files locais (padrão: `false`)

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

### 🧹 Remoção de Imports Não Utilizados

Remove automaticamente imports que não são utilizados no código (quando ativado).

## Uso

1. Selecione o estilo de formatação desejado (Normal ou Aligned)
2. Configure as opções desejadas (otimização MUI, remoção de imports não utilizados, etc.)
3. Use o atalho `Ctrl+Alt+R` ou salve o arquivo (se formatação automática estiver ativada)
4. Os imports serão organizados automaticamente por **comprimento** seguindo a ordem de precedência

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

## ⚠️ Importante: Comportamento da Ordenação

**A ordenação é SEMPRE por comprimento (menor primeiro), NÃO alfabética!**

Isso significa que:
- `import { memo } from 'react';` vem ANTES de `import { useState } from 'zzz';`
- O caminho do import (`from '...'`) NÃO afeta a ordem
- Apenas o comprimento do identificador (nome/named) importa