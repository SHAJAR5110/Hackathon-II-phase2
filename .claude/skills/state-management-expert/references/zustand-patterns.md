# Zustand Patterns & Examples (TypeScript)

## 1. Shopping Cart Implementation

### Basic Cart Store

```typescript
// store/cartStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface DiscountCode {
  code: string;
  percentage: number;
}

interface CartState {
  // State
  items: CartItem[];
  discountCode: DiscountCode | null;
  taxRate: number;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscountCode: (code: DiscountCode) => void;
  removeDiscountCode: () => void;

  // Computed
  getSubtotal: () => number;
  getDiscount: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        items: [],
        discountCode: null,
        taxRate: 0.1,

        // Actions
        addItem: (item) => {
          set((state) => {
            const existing = state.items.find(
              (i) => i.productId === item.productId
            );
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              state.items.push(item);
            }
          });
        },

        removeItem: (productId) => {
          set((state) => {
            state.items = state.items.filter((i) => i.productId !== productId);
          });
        },

        updateQuantity: (productId, quantity) => {
          set((state) => {
            const item = state.items.find((i) => i.productId === productId);
            if (item) {
              item.quantity = Math.max(0, quantity);
            }
          });
        },

        clearCart: () => {
          set((state) => {
            state.items = [];
          });
        },

        applyDiscountCode: (code) => {
          set({ discountCode: code });
        },

        removeDiscountCode: () => {
          set({ discountCode: null });
        },

        // Computed getters
        getSubtotal: () => {
          return get().items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
        },

        getDiscount: () => {
          const subtotal = get().getSubtotal();
          const code = get().discountCode;
          if (!code) return 0;
          return subtotal * (code.percentage / 100);
        },

        getTax: () => {
          const subtotal = get().getSubtotal();
          const discount = get().getDiscount();
          return (subtotal - discount) * get().taxRate;
        },

        getTotal: () => {
          const subtotal = get().getSubtotal();
          const discount = get().getDiscount();
          const tax = get().getTax();
          return subtotal - discount + tax;
        },

        getItemCount: () => {
          return get().items.reduce((sum, item) => sum + item.quantity, 0);
        },
      })),
      {
        name: 'cart-storage', // localStorage key
        version: 1,
      }
    ),
    { name: 'CartStore' }
  )
);
```

### Selectors

```typescript
// store/selectors/cartSelectors.ts
import { CartState, useCartStore } from '../cartStore';

// Simple selectors
export const useCartItems = () => useCartStore((state) => state.items);
export const useDiscountCode = () => useCartStore((state) => state.discountCode);
export const useTaxRate = () => useCartStore((state) => state.taxRate);

// Computed selectors
export const useCartSummary = () =>
  useCartStore((state) => ({
    itemCount: state.getItemCount(),
    subtotal: state.getSubtotal(),
    discount: state.getDiscount(),
    tax: state.getTax(),
    total: state.getTotal(),
  }));

export const useCartActions = () =>
  useCartStore((state) => ({
    addItem: state.addItem,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    clearCart: state.clearCart,
    applyDiscountCode: state.applyDiscountCode,
    removeDiscountCode: state.removeDiscountCode,
  }));

// Combined hook
export const useCart = () => {
  const items = useCartItems();
  const summary = useCartSummary();
  const actions = useCartActions();

  return { items, summary, ...actions };
};
```

## 2. User Authentication

### Auth Store

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'moderator';
  permissions: string[];
  avatar?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  clearError: () => void;

  // Computed
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        token: null,
        loading: false,
        error: null,

        // Actions
        login: async (email, password) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const data = await response.json();
            set({
              user: data.user,
              token: data.token,
              loading: false,
            });

            localStorage.setItem('token', data.token);
          } catch (error) {
            set({
              error: (error as Error).message,
              loading: false,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              token: null,
              error: null,
            });
            localStorage.removeItem('token');
          }
        },

        fetchUser: async (userId) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`/api/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch user');
            }

            const user = await response.json();
            set({ user, loading: false });
          } catch (error) {
            set({
              error: (error as Error).message,
              loading: false,
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        // Computed
        isAuthenticated: () => {
          return get().user !== null && get().token !== null;
        },

        hasPermission: (permission) => {
          return get().user?.permissions.includes(permission) ?? false;
        },

        isAdmin: () => {
          return get().user?.role === 'admin';
        },
      })),
      {
        name: 'auth-storage',
        version: 1,
        partialize: (state) => ({
          token: state.token,
          user: state.user,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
```

## 3. Product Catalog

### Products Store with API

```typescript
// store/productsStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
}

interface ProductsState {
  // State
  products: Product[];
  selectedProduct: Product | null;
  filters: {
    category?: string;
    search?: string;
    priceRange?: [number, number];
  };
  loading: boolean;
  error: string | null;
  page: number;
  total: number;

  // Actions
  fetchProducts: (page?: number) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProductsState['filters']>) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;

  // Computed
  getFilteredProducts: () => Product[];
  getTotalPages: () => number;
}

export const useProductsStore = create<ProductsState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      products: [],
      selectedProduct: null,
      filters: {},
      loading: false,
      error: null,
      page: 1,
      total: 0,

      // Actions
      fetchProducts: async (page = 1) => {
        set({ loading: true, error: null });
        try {
          const { category, search } = get().filters;
          const params = new URLSearchParams();
          params.append('page', page.toString());
          if (category) params.append('category', category);
          if (search) params.append('search', search);

          const response = await fetch(`/api/products?${params}`);
          if (!response.ok) throw new Error('Failed to fetch products');

          const data = await response.json();
          set({
            products: data.products,
            total: data.total,
            page,
            loading: false,
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      fetchProductById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/products/${id}`);
          if (!response.ok) throw new Error('Failed to fetch product');

          const product = await response.json();
          set({ selectedProduct: product, loading: false });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
          state.page = 1;
        });
        get().fetchProducts();
      },

      setPage: (page) => {
        set({ page });
        get().fetchProducts(page);
      },

      clearFilters: () => {
        set({ filters: {}, page: 1 });
        get().fetchProducts();
      },

      // Computed
      getFilteredProducts: () => {
        return get().products;
      },

      getTotalPages: () => {
        return Math.ceil(get().total / 20);
      },
    })),
    { name: 'ProductsStore' }
  )
);
```

## 4. Custom Hooks

```typescript
// hooks/useCart.ts
import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const summary = useCartStore((state) => ({
    itemCount: state.getItemCount(),
    subtotal: state.getSubtotal(),
    discount: state.getDiscount(),
    tax: state.getTax(),
    total: state.getTotal(),
  }));

  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  return {
    items,
    summary,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};

// hooks/useAuth.ts
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    clearError,
    hasPermission,
  };
};

// hooks/useProducts.ts
import { useProductsStore } from '../store/productsStore';

export const useProducts = () => {
  const products = useProductsStore((state) => state.products);
  const selectedProduct = useProductsStore((state) => state.selectedProduct);
  const loading = useProductsStore((state) => state.loading);
  const error = useProductsStore((state) => state.error);
  const page = useProductsStore((state) => state.page);
  const totalPages = useProductsStore((state) => state.getTotalPages());

  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const fetchProductById = useProductsStore((state) => state.fetchProductById);
  const setFilters = useProductsStore((state) => state.setFilters);
  const setPage = useProductsStore((state) => state.setPage);
  const clearFilters = useProductsStore((state) => state.clearFilters);

  return {
    products,
    selectedProduct,
    loading,
    error,
    page,
    totalPages,
    fetchProducts,
    fetchProductById,
    setFilters,
    setPage,
    clearFilters,
  };
};
```

## 5. Component Usage

```typescript
// components/Cart.tsx
import React from 'react';
import { useCart } from '../hooks/useCart';

export const Cart: React.FC = () => {
  const { items, summary, removeItem, updateQuantity } = useCart();

  return (
    <div>
      <h1>Shopping Cart ({summary.itemCount} items)</h1>
      {items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.productId} className="cart-item">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.productId, parseInt(e.target.value))
                }
                min="1"
              />
              <button onClick={() => removeItem(item.productId)}>Remove</button>
            </div>
          ))}
          <div className="summary">
            <p>Subtotal: ${summary.subtotal.toFixed(2)}</p>
            {summary.discount > 0 && (
              <p>Discount: -${summary.discount.toFixed(2)}</p>
            )}
            <p>Tax: ${summary.tax.toFixed(2)}</p>
            <h3>Total: ${summary.total.toFixed(2)}</h3>
          </div>
        </>
      )}
    </div>
  );
};

// components/ProductList.tsx
import React, { useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';

export const ProductList: React.FC = () => {
  const {
    products,
    loading,
    error,
    page,
    totalPages,
    fetchProducts,
    setPage,
  } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>Rating: {product.rating}/5</p>
          </div>
        ))}
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={p === page ? 'active' : ''}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

// components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // Error already in store
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## 6. Testing Zustand Stores

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

  it('should calculate total correctly', () => {
    const store = useCartStore.getState();
    store.addItem({
      id: '1',
      productId: 'p1',
      name: 'Test',
      price: 100,
      quantity: 2,
      image: 'test.jpg',
    });

    const total = store.getTotal();
    const expectedTax = 200 * 0.1;
    expect(total).toBe(200 + expectedTax);
  });

  it('should apply discount code', () => {
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
    const discount = store.getDiscount();
    expect(discount).toBe(10); // 10% of 100
  });
});
```

## Advanced Patterns

### Middleware Stack

```typescript
// Custom middleware
const createStore = (set: any, get: any) => ({
  count: 0,
  increment: () => set((state: any) => ({ count: state.count + 1 })),
});

export const useCountStore = create<any>()(
  devtools(
    persist(
      immer(createStore),
      { name: 'count-store' }
    ),
    { name: 'CountStore' }
  )
);
```

### Store Composition

```typescript
// Combine multiple stores
export const useCombinedStore = () => {
  const cart = useCartStore();
  const auth = useAuthStore();
  const products = useProductsStore();

  return {
    cart,
    auth,
    products,
    // Computed across stores
    canCheckout: auth.isAuthenticated && cart.items.length > 0,
  };
};
```

### Async State with Error Handling

```typescript
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const createAsyncStore = <T,>(
  name: string,
  fetchFn: () => Promise<T>
) =>
  create<AsyncState<T> & { fetch: () => Promise<void> }>()(
    immer((set) => ({
      data: null,
      loading: false,
      error: null,
      fetch: async () => {
        set({ loading: true, error: null });
        try {
          const data = await fetchFn();
          set({ data, loading: false });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },
    }))
  );
```