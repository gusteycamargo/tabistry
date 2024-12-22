# Tabistry

Biblioteca React para gerenciamento de abas baseadas em rotas.

## Instalação

```bash
npm install tabistry
```

ou

```bash
yarn add tabistry
```

## Uso Básico

### 1. Definindo uma Tab

Primeiro, crie uma classe que estenda `RouteTab`:

```typescript
import { RouteTab } from "tabistry";

interface UserParams {
  id: string;
}

class UserTab extends RouteTab<UserParams> {
  type = "user";

  renderTab({ onRemove, isSelected }) {
    return (
      <div className={isSelected ? "selected" : ""}>
        Usuário {this.params.id}
        <button onClick={onRemove}>x</button>
      </div>
    );
  }

  renderScreen() {
    return <UserDetails id={this.params.id} />;
  }
}
```

### 2. Configurando as Rotas

```typescript
import { RouteDescriptor } from "tabistry";

const routes: RouteDescriptor<UserTab>[] = [
  {
    path: "/users/:id",
    tab: UserTab,
  },
];
```

### 3. Implementando o Provider

```tsx
import { RouteTabs } from "tabistry";

function App() {
  const [tabs, setTabs] = useState<UserTab[]>([]);

  const handleAddTab = (tab: UserTab) => {
    setTabs((prev) => [...prev, tab]);
  };

  const handleRemoveTab = (tab: UserTab) => {
    setTabs((prev) => prev.filter((t) => t !== tab));
  };

  return (
    <RouteTabs
      tabs={tabs}
      routes={routes}
      onAddTab={handleAddTab}
      onRemoveTab={handleRemoveTab}
    />
  );
}
```

## Exemplos Detalhados

### Configuração de Rotas

```tsx
import { RouteDescriptor } from "tabistry";

// 1. Defina suas tabs
class UserTab extends RouteTab<{ id: string }> {
  type = "user";
  // ...implementação da tab...
}

class ProductTab extends RouteTab<{ productId: string }> {
  type = "product";
  // ...implementação da tab...
}

// 2. Configure as rotas com suas respectivas tabs
const routes: RouteDescriptor[] = [
  {
    path: "/users/:id",
    tab: UserTab,
    element: <UserLayout />, // Layout opcional
    children: [
      {
        path: "profile",
        element: <UserProfile />,
      },
      {
        path: "settings",
        element: <UserSettings />,
      },
    ],
  },
  {
    path: "/products/:productId",
    tab: ProductTab,
    element: <ProductDetails />,
  },
];
```

### Usando o Hook useRouteTabState

O hook `useRouteTabState` permite acessar e manipular o estado das tabs de qualquer lugar da aplicação:

```tsx
import { useRouteTabState } from "tabistry";

function TabList() {
  const { tabs, tab, change, remove, isTabActive } = useRouteTabState();

  return (
    <div className="tab-list">
      {tabs.map((t) => (
        <div
          key={t.type}
          className={isTabActive(t) ? "active" : ""}
          onClick={() => change(t)}
        >
          {t.renderTab({
            onRemove: () => remove(t),
            isSelected: isTabActive(t),
          })}
        </div>
      ))}
    </div>
  );
}
```

### Exemplo de Aplicação Completa

```tsx
import { RouteTabs, useRouteTabState } from "tabistry";

// Componente de Layout
function Layout({ children }) {
  const { tabs, tab, change, remove, isTabActive } = useRouteTabState();

  return (
    <div>
      <header>
        <nav>
          {tabs.map((t) => (
            <TabButton
              key={t.type}
              tab={t}
              isActive={isTabActive(t)}
              onChange={change}
              onRemove={remove}
            />
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

// Aplicação Principal
function App() {
  const [tabs, setTabs] = useState<(UserTab | ProductTab)[]>([]);

  const handleAddTab = (tab) => {
    setTabs((prev) => [...prev, tab]);
  };

  const handleRemoveTab = (tab) => {
    setTabs((prev) => prev.filter((t) => !t.equals(tab)));
  };

  return (
    <BrowserRouter>
      <RouteTabs
        tabs={tabs}
        routes={routes}
        onAddTab={handleAddTab}
        onRemoveTab={handleRemoveTab}
      >
        <Layout />
      </RouteTabs>
    </BrowserRouter>
  );
}
```

### Funcionalidades do Hook useRouteTabState

O hook retorna um objeto com as seguintes propriedades:

- `tab` - Tab atualmente ativa
- `tabs` - Array com todas as tabs abertas
- `change(tab)` - Função para mudar para uma tab específica
- `remove(tab)` - Função para remover uma tab
- `isTabActive(tab)` - Função que verifica se uma tab está ativa

## API

### RouteTab

Classe abstrata base para definição de tabs:

- `type: string` - Identificador único do tipo da tab
- `params` - Parâmetros da rota
- `query` - Parâmetros da query string
- `renderTab(props: RenderTab)` - Renderiza o conteúdo da aba
- `renderScreen()` - Renderiza o conteúdo principal da aba
- `onFocus?()` - Callback quando a aba recebe foco
- `onBlur?()` - Callback quando a aba perde foco
- `onAdd?()` - Callback quando a aba é adicionada
- `onRemove?()` - Callback quando a aba é removida

### RouteTabs Props

- `tabs` - Array de tabs ativas
- `routes` - Configuração das rotas
- `onAddTab` - Callback quando uma nova tab é adicionada
- `onFocusTab` - Callback quando uma tab recebe foco
- `onBlurTab` - Callback quando uma tab perde foco
- `onRemoveTab` - Callback quando uma tab é removida

## Funcionalidades

- Gerenciamento automático de estado das tabs
- Sincronização com rotas do React Router
- Suporte a parâmetros de rota e query string
- Callbacks para eventos do ciclo de vida das tabs
- Verificação de tabs ativas

## Dicas e Boas Práticas

1. Use o `type` da tab como identificador único
2. Implemente o método `equals` na sua tab para comparação personalizada
3. Mantenha a lógica de renderização dentro dos métodos `renderTab` e `renderScreen`
4. Use os callbacks de ciclo de vida (`onFocus`, `onBlur`, etc) para efeitos colaterais
