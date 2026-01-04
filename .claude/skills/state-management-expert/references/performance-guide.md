# State Management Performance & Optimization

## Redux Performance Optimization

### 1. Selector Memoization with Reselect

```typescript
// Without memoization (recalculates on every render)
export const selectCartTotal = (state: RootState) => {
  return state.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

// With memoization (only recalculates when inputs change)
import { createSelector } from '@reduxjs/toolkit';

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectTaxRate = (state: RootState) => state.cart.taxRate;

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export const selectCartTaxAmount = createSelector(
  [selectCartSubtotal, selectTaxRate],
  (subtotal, taxRate) => subtotal * taxRate
);

export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectCartTaxAmount],
  (subtotal, tax) => subtotal + tax
);

// Result: Only recalculates if items or taxRate change
```

### 2. Normalized State Shape

```typescript
// Bad: Denormalized (deeply nested, hard to update)
const state = {
  cart: {
    items: [
      {
        id: '1',
        product: {
          id: 'p1',
          name: 'Product 1',
          category: {
            id: 'c1',
            name: 'Electronics',
          },
        },
        quantity: 2,
      },
    ],
  },
};

// Good: Normalized (flat, efficient updates)
const state = {
  cart: {
    itemIds: ['1'],
  },
  items: {
    '1': { id: '1', productId: 'p1', quantity: 2 },
  },
  products: {
    p1: { id: 'p1', name: 'Product 1', categoryId: 'c1' },
  },
  categories: {
    c1: { id: 'c1', name: 'Electronics' },
  },
};
```

### 3. Entity Adapters

```typescript
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const productsAdapter = createEntityAdapter<Product>();

const productsSlice = createSlice({
  name: 'products',
  initialState: productsAdapter.getInitialState(),
  reducers: {
    addProduct: productsAdapter.addOne,
    addProducts: productsAdapter.addMany,
    updateProduct: productsAdapter.updateOne,
    removeProduct: productsAdapter.removeOne,
  },
});

// Auto-generated selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectEntities: selectProductEntities,
  selectIds: selectProductIds,
  selectTotal: selectProductsTotal,
} = productsAdapter.getSelectors((state: RootState) => state.products);

// Usage
const product = selectProductById(state, 'p1');
const allProducts = selectAllProducts(state);
const totalCount = selectProductsTotal(state);
```

### 4. Preventing Unnecessary Re-renders

```typescript
import { useAppSelector } from './hooks';
import { selectCartItems, selectCartTotal } from './selectors';

// Bad: Component re-renders when any state changes
const Component = () => {
  const state = useAppSelector((state) => state);
  return <div>{state.cart.total}</div>;
};

// Good: Only select necessary data
const Component = () => {
  const total = useAppSelector(selectCartTotal);
  return <div>{total}</div>;
};

// Better: Use field selector for single values
const Component = () => {
  const total = useAppSelector((state) => state.cart.total);
  return <div>{total}</div>;
};

// Best: Combine with memoization
const Component = React.memo(() => {
  const total = useAppSelector(selectCartTotal);
  return <div>{total}</div>;
});
```

### 5. Subscription Optimization

```typescript
// Use useShallow for shallow equality in selectors
import { shallowEqual } from 'react-redux';

const Component = () => {
  const cart = useAppSelector((state) => state.cart, shallowEqual);
  return <div>{cart.total}</div>;
};

// Or create shallow selector
const selectCartShallow = (state: RootState) => ({
  items: state.cart.items,
  total: state.cart.total,
  itemCount: state.cart.itemCount,
});

const Component = () => {
  const cart = useAppSelector(selectCartShallow, shallowEqual);
  return <div>{cart.total}</div>;
};
```

## Zustand Performance Optimization

### 1. Selector Optimization

```typescript
// Without optimization (subscribes to all state changes)
export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  
  return { items, addItem, removeItem };
};

// With optimization (subscribes only to needed data)
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartActions = () => {
  // Memoize to prevent new functions on every render
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  return { addItem, removeItem };
};

export const useCartTotal = () => {
  const items = useCartStore((state) => state.items);
  const taxRate = useCartStore((state) => state.taxRate);
  
  // Compute in hook, not in component
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0) * (1 + taxRate);
};
```

### 2. Shallow Equality

```typescript
import { useShallow } from 'zustand/react';

// Component subscribes only to changes in items
const CartSummary = () => {
  const { items, total } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      total: state.getTotal(),
    }))
  );

  return <div>{total}</div>;
};
```

### 3. Computed State Caching

```typescript
interface CartState {
  items: CartItem[];
  _cache: {
    subtotal: number;
    lastItemsHash: string;
  };
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  const computeHash = (items: CartItem[]) => {
    return JSON.stringify(items.map((i) => i.id));
  };

  return {
    items: [],
    _cache: { subtotal: 0, lastItemsHash: '' },

    getSubtotal: () => {
      const { items, _cache } = get();
      const currentHash = computeHash(items);

      // Only recompute if items changed
      if (currentHash !== _cache.lastItemsHash) {
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        set({
          _cache: { subtotal, lastItemsHash: currentHash },
        });
        return subtotal;
      }

      return _cache.subtotal;
    },
  };
});
```

### 4. Store Subscription Patterns

```typescript
// Use subscribe only for side effects, not rendering
const useCartPersist = () => {
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    // This runs only when items changes
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
};

// Or use store subscription directly
useEffect(() => {
  const unsubscribe = useCartStore.subscribe(
    (state) => state.items,
    (items) => {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  );

  return unsubscribe;
}, []);
```

## Shared Performance Strategies

### 1. Code Splitting State

```typescript
// Large app: Split stores by feature
// store/user/index.ts
export const useUserStore = create<UserState>((set) => ({...}));

// store/cart/index.ts
export const useCartStore = create<CartState>((set) => ({...}));

// store/products/index.ts
export const useProductsStore = create<ProductsState>((set) => ({...}));

// Load only what you need
import { useUserStore } from './store/user';
```

### 2. Lazy Store Initialization

```typescript
// Redux: Lazy reducer injection
const injectReducer = (name: string, reducer: any) => {
  store.replaceReducer(
    combineReducers({
      ...store.asyncReducers,
      [name]: reducer,
    })
  );
};

// Zustand: Lazy store creation
const createLazyStore = () => {
  return create<State>((set) => ({
    // Initial state minimal
  }));
};
```

### 3. DevTools in Development Only

```typescript
// Redux
const store = configureStore({
  reducer: { /* ... */ },
  devTools: process.env.NODE_ENV === 'development',
});

// Zustand
const useStore = create<State>()(
  process.env.NODE_ENV === 'development'
    ? devtools((set) => ({ /* ... */ }))
    : (set) => ({ /* ... */ })
);
```

## Benchmarking & Profiling

### React DevTools Profiler

```typescript
// Wrap component for profiling
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
};

export const Cart = () => (
  <Profiler id="Cart" onRender={onRenderCallback}>
    {/* Component JSX */}
  </Profiler>
);
```

### Performance Metrics

```typescript
// Measure selector memoization effectiveness
const selectCartTotal = createSelector(
  [selectCartItems, selectTaxRate],
  (items, taxRate) => {
    const start = performance.now();
    const result = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) * (1 + taxRate);
    const duration = performance.now() - start;

    console.log(`selectCartTotal: ${duration.toFixed(2)}ms`);
    return result;
  }
);
```

## Performance Checklist

### Redux
- ✅ Use selectors for data access
- ✅ Memoize selectors with `createSelector`
- ✅ Normalize state shape
- ✅ Use entity adapters
- ✅ Prevent unnecessary re-renders
- ✅ Profile with Redux DevTools
- ✅ Use `shallowEqual` when appropriate
- ✅ Lazy load reducers for large apps

### Zustand
- ✅ Use fine-grained selectors
- ✅ Memoize computed values
- ✅ Use `useShallow` for shallow equality
- ✅ Implement cache strategies
- ✅ Subscribe only to needed state
- ✅ Lazy initialize stores
- ✅ Profile with React DevTools
- ✅ Minimize selector function complexity

### Both
- ✅ Code split by feature
- ✅ Lazy load heavy stores
- ✅ Profile in production
- ✅ Monitor bundle size
- ✅ Use development tools conditionally
- ✅ Implement request deduplication
- ✅ Cache API responses
- ✅ Debounce frequent updates

## Bundle Size Optimization

```json
{
  "Redux Toolkit": "~15KB",
  "Zustand": "~1KB",
  "React Redux": "~5KB",
  "RTK Query": "~6KB"
}
```

**Strategies:**
1. Tree-shake unused actions
2. Lazy load reducers
3. Split stores by route
4. Use Zustand for small features
5. Remove devtools in production
6. Minify and compress

## Real-World Benchmarks

| Operation | Redux | Zustand |
|-----------|-------|---------|
| Add Item | ~0.5ms | ~0.3ms |
| Update Quantity | ~0.4ms | ~0.2ms |
| Calculate Total | ~0.2ms (memoized) | ~0.2ms |
| Render 1000 items | ~15ms | ~12ms |

**Note:** Differences negligible in most applications. Choose based on needs, not microbenchmarks.

## Optimization Priority

1. **Profile first** - Use React DevTools Profiler
2. **Identify bottlenecks** - Find actual slow selectors/renders
3. **Implement fixes** - Apply memoization, normalization, etc.
4. **Measure impact** - Confirm improvements
5. **Don't over-optimize** - Most apps perform fine with basic patterns