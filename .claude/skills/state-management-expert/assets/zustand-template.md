# Zustand Store Template

## Basic Store Setup

```typescript
// store/index.ts
export { useCartStore } from './cartStore';
export { useAuthStore } from './authStore';
export { useProductsStore } from './productsStore';
```

## Provider Setup (Optional)

```typescript
// No provider needed for Zustand!
// Just import and use the hooks directly in components
import { useCartStore } from './store';

export const App = () => {
  // Direct access, no Provider needed
  return <YourComponent />;
};
```

## Store Initialization

```typescript
// store/cartStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Store implementation
      })),
      { name: 'cart-storage' }
    ),
    { name: 'CartStore' }
  )
);
```

## Usage in Components

```typescript
// Component using Zustand
import { useCartStore } from '../store/cartStore';

export const CartComponent = () => {
  const total = useCartStore((state) => state.getTotal());
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div>
      <p>Total: ${total}</p>
      <button onClick={() => addItem({ /* ... */ })}>
        Add Item
      </button>
    </div>
  );
};
```

## Store Selection Best Practices

```typescript
// Bad: Subscribes to entire store
const Component = () => {
  const store = useCartStore();
};

// Good: Select only what you need
const Component = () => {
  const total = useCartStore((state) => state.getTotal());
  const addItem = useCartStore((state) => state.addItem);
};

// Better: Use selector hooks
const CartComponent = () => {
  const { total, addItem } = useCartActions();
};
```