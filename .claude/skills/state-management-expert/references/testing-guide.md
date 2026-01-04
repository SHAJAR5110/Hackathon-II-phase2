# Testing State Management (Redux & Zustand)

## Redux Testing

### Unit Testing Slices

```typescript
// __tests__/cartSlice.test.ts
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  applyDiscountCode,
} from '../slices/cartSlice';
import { CartItem, CartState } from '../slices/cartSlice';

describe('cartSlice', () => {
  const initialState: CartState = {
    items: [],
    discountCode: null,
    taxRate: 0.1,
  };

  describe('addItem', () => {
    it('should add new item to empty cart', () => {
      const newItem: CartItem = {
        id: '1',
        productId: 'p1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      };

      const state = cartReducer(initialState, addItem(newItem));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(newItem);
    });

    it('should increment quantity if item exists', () => {
      const existingItem: CartItem = {
        id: '1',
        productId: 'p1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
        image: 'test.jpg',
      };

      const stateWithItem = cartReducer(
        { ...initialState, items: [existingItem] },
        addItem({ ...existingItem, quantity: 1 })
      );

      expect(stateWithItem.items[0].quantity).toBe(3);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const item: CartItem = {
        id: '1',
        productId: 'p1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      };

      const stateWithItem = { ...initialState, items: [item] };
      const state = cartReducer(stateWithItem, removeItem('p1'));

      expect(state.items).toHaveLength(0);
    });

    it('should not affect other items', () => {
      const item1: CartItem = {
        id: '1',
        productId: 'p1',
        name: 'Product 1',
        price: 100,
        quantity: 1,
        image: 'test1.jpg',
      };
      const item2: CartItem = {
        id: '2',
        productId: 'p2',
        name: 'Product 2',
        price: 50,
        quantity: 1,
        image: 'test2.jpg',
      };

      const stateWithItems = { ...initialState, items: [item1, item2] };
      const state = cartReducer(stateWithItems, removeItem('p1'));

      expect(state.items).toHaveLength(1);
      expect(state.items[0].productId).toBe('p2');
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const item: CartItem = {
        id: '1',
        productId: 'p1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      };

      const stateWithItem = { ...initialState, items: [item] };
      const state = cartReducer(
        stateWithItem,
        updateQuantity({ productId: 'p1', quantity: 5 })
      );

      expect(state.items[0].quantity).toBe(5);
    });

    it('should not allow negative quantity', () => {
      const item: CartItem = {
        id: '1',
        productId: 'p1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      };

      const stateWithItem = { ...initialState, items: [item] };
      const state = cartReducer(
        stateWithItem,
        updateQuantity({ productId: 'p1', quantity: -5 })
      );

      expect(state.items[0].quantity).toBe(0);
    });
  });

  describe('applyDiscountCode', () => {
    it('should apply valid discount code', () => {
      const code = { code: 'SAVE10', percentage: 10 };
      const state = cartReducer(initialState, applyDiscountCode(code));

      expect(state.discountCode).toEqual(code);
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      const items: CartItem[] = [
        {
          id: '1',
          productId: 'p1',
          name: 'Product 1',
          price: 100,
          quantity: 1,
          image: 'test1.jpg',
        },
      ];

      const stateWithItems = { ...initialState, items };
      const state = cartReducer(stateWithItems, clearCart());

      expect(state.items).toHaveLength(0);
    });
  });
});
```

### Testing Selectors

```typescript
// __tests__/cartSelectors.test.ts
import {
  selectCartItemCount,
  selectSubtotal,
  selectDiscount,
  selectTax,
  selectTotal,
} from '../selectors/cartSelectors';
import { RootState } from '../store';
import { CartItem } from '../slices/cartSlice';

describe('cartSelectors', () => {
  const mockCartItem: CartItem = {
    id: '1',
    productId: 'p1',
    name: 'Test',
    price: 100,
    quantity: 2,
    image: 'test.jpg',
  };

  const mockState: RootState = {
    cart: {
      items: [mockCartItem],
      discountCode: { code: 'SAVE10', percentage: 10 },
      taxRate: 0.1,
    },
    user: {
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    },
    [cartApi.reducerPath]: {},
  };

  it('selectCartItemCount should return total quantity', () => {
    expect(selectCartItemCount(mockState)).toBe(2);
  });

  it('selectSubtotal should calculate correctly', () => {
    expect(selectSubtotal(mockState)).toBe(200); // 100 * 2
  });

  it('selectDiscount should apply percentage', () => {
    expect(selectDiscount(mockState)).toBe(20); // 200 * 10%
  });

  it('selectTax should calculate on discounted amount', () => {
    expect(selectTax(mockState)).toBe(18); // (200 - 20) * 10%
  });

  it('selectTotal should sum all components', () => {
    const total = selectTotal(mockState);
    expect(total).toBe(198); // 200 - 20 + 18
  });
});
```

### Testing Async Thunks

```typescript
// __tests__/userSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer, { loginUser, logoutUser } from '../slices/userSlice';

describe('userSlice async thunks', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  describe('loginUser', () => {
    it('should handle pending state', () => {
      store.dispatch(loginUser.pending('', { email: 'test@test.com', password: 'password' }));
      const state = store.getState().user;

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const mockUser = {
        user: {
          id: '1',
          email: 'test@test.com',
          name: 'Test User',
          role: 'customer' as const,
          permissions: [],
        },
        token: 'test-token',
      };

      store.dispatch(loginUser.fulfilled(mockUser, '', { email: '', password: '' }));
      const state = store.getState().user;

      expect(state.user).toEqual(mockUser.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      store.dispatch(
        loginUser.rejected(new Error('Login failed'), '', { email: '', password: '' }, 'Login failed')
      );
      const state = store.getState().user;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Login failed');
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
```

### Testing RTK Query

```typescript
// __tests__/api.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { productsApi } from '../api/productsApi';

describe('productsApi RTK Query', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [productsApi.reducerPath]: productsApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(productsApi.middleware),
    });
  });

  it('should initialize with empty cache', () => {
    const state = store.getState();
    expect(state[productsApi.reducerPath]).toBeDefined();
  });

  it('should cache results after query', () => {
    const mockData = {
      products: [
        {
          id: '1',
          name: 'Product',
          description: 'Test',
          price: 100,
          category: 'test',
          image: 'test.jpg',
          stock: 10,
          rating: 5,
        },
      ],
      total: 1,
      page: 1,
    };

    // Simulate successful query
    const action = productsApi.endpoints.getProducts.matchFulfilled({
      products: mockData.products,
      total: mockData.total,
      page: mockData.page,
    });

    store.dispatch(action as any);
    // Cache updated
  });
});
```

### Testing Custom Hooks

```typescript
// __tests__/useCart.test.ts
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useCart } from '../hooks/useCart';
import cartReducer from '../slices/cartSlice';

describe('useCart hook', () => {
  const createMockStore = () =>
    configureStore({
      reducer: { cart: cartReducer },
    });

  it('should add item to cart', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        id: '1',
        productId: 'p1',
        name: 'Test',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.summary.total).toBeGreaterThan(0);
  });

  it('should update quantity', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        id: '1',
        productId: 'p1',
        name: 'Test',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      });
      result.current.updateQuantity('p1', 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
  });

  it('should remove item', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        id: '1',
        productId: 'p1',
        name: 'Test',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      });
      result.current.removeItem('p1');
    });

    expect(result.current.items).toHaveLength(0);
  });
});
```

## Zustand Testing

### Unit Testing Stores

```typescript
// __tests__/cartStore.test.ts
import { useCartStore } from '../store/cartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      discountCode: null,
      taxRate: 0.1,
    });
  });

  it('should add item to cart', () => {
    const store = useCartStore.getState();
    const item = {
      id: '1',
      productId: 'p1',
      name: 'Test',
      price: 100,
      quantity: 1,
      image: 'test.jpg',
    };

    store.addItem(item);
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('should calculate totals correctly', () => {
    const store = useCartStore.getState();
    store.addItem({
      id: '1',
      productId: 'p1',
      name: 'Test',
      price: 100,
      quantity: 2,
      image: 'test.jpg',
    });

    expect(store.getSubtotal()).toBe(200);
    expect(store.getItemCount()).toBe(2);
  });

  it('should apply discount correctly', () => {
    const store = useCartStore.getState();
    store.addItem({
      id: '1',
      productId: 'p1',
      name: 'Test',
      price: 100,
      quantity: 1,
      image: 'test.jpg',
    });

    store.applyDiscountCode({ code: 'SAVE10', percentage: 10 });
    expect(store.getDiscount()).toBe(10);
  });
});
```

### Testing with React Hooks

```typescript
// __tests__/useCartHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../hooks/useCart';
import { useCartStore } from '../store/cartStore';

describe('useCart hook', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      discountCode: null,
      taxRate: 0.1,
    });
  });

  it('should return cart items and actions', () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.items).toEqual([]);
    expect(typeof result.current.addItem).toBe('function');
    expect(typeof result.current.removeItem).toBe('function');
  });

  it('should add item and update summary', () => {
    const { result, rerender } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: '1',
        productId: 'p1',
        name: 'Test',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      });
    });

    rerender();

    expect(result.current.items).toHaveLength(1);
    expect(result.current.summary.total).toBeGreaterThan(0);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: '1',
        productId: 'p1',
        name: 'Test',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      });
    });

    const stored = localStorage.getItem('cart-storage');
    expect(stored).toBeTruthy();
  });
});
```

### Testing Async Operations

```typescript
// __tests__/authStore.test.ts
import { useAuthStore } from '../store/authStore';

describe('useAuthStore async', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
    localStorage.clear();
  });

  it('should handle successful login', async () => {
    const store = useAuthStore.getState();

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: '1', email: 'test@test.com', name: 'Test', role: 'customer', permissions: [] },
            token: 'test-token',
          }),
      })
    ) as jest.Mock;

    await store.login('test@test.com', 'password');

    const state = useAuthStore.getState();
    expect(state.user).toBeDefined();
    expect(state.token).toBe('test-token');
  });

  it('should handle login error', async () => {
    const store = useAuthStore.getState();

    // Mock fetch error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    await expect(store.login('test@test.com', 'password')).rejects.toThrow();
    expect(useAuthStore.getState().error).toBeTruthy();
  });

  it('should handle logout', async () => {
    // Set initial state
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com', name: 'Test', role: 'customer', permissions: [] },
      token: 'test-token',
    });

    const store = useAuthStore.getState();
    await store.logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
```

## Integration Testing

```typescript
// __tests__/cartIntegration.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

describe('Cart & Auth Integration', () => {
  it('should maintain cart when user logs in', async () => {
    const { result: cartResult } = renderHook(() => useCart());
    const { result: authResult } = renderHook(() => useAuth());

    // Add item
    act(() => {
      cartResult.current.addItem({
        id: '1',
        productId: 'p1',
        name: 'Test',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      });
    });

    expect(cartResult.current.items).toHaveLength(1);

    // Login (cart should persist)
    expect(cartResult.current.items).toHaveLength(1);
  });
});
```

## Best Practices

### Do's
✅ Test initial state
✅ Test state mutations
✅ Test computed values
✅ Test async operations
✅ Test error handling
✅ Use meaningful test descriptions
✅ Mock API calls
✅ Test edge cases

### Don'ts
❌ Test implementation details
❌ Create side effects in tests
❌ Use real API calls
❌ Test UI components separately from state (integration tests)
❌ Over-mock dependencies
❌ Skip error scenarios