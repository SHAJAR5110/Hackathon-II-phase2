# Redux Toolkit Patterns & Examples (TypeScript)

## 1. Shopping Cart Implementation

### Store Setup

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import { cartApi } from './api/cartApi';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    [cartApi.reducerPath]: cartApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Cart Slice

```typescript
// store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  items: CartItem[];
  discountCode: DiscountCode | null;
  taxRate: number;
}

const initialState: CartState = {
  items: [],
  discountCode: null,
  taxRate: 0.1,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    applyDiscountCode: (state, action: PayloadAction<DiscountCode>) => {
      state.discountCode = action.payload;
    },
    removeDiscountCode: (state) => {
      state.discountCode = null;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  applyDiscountCode,
  removeDiscountCode,
} = cartSlice.actions;

export default cartSlice.reducer;
```

### Selectors

```typescript
// store/selectors/cartSelectors.ts
import { RootState } from '../index';
import { createSelector } from '@reduxjs/toolkit';

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectDiscountCode = (state: RootState) => state.cart.discountCode;
export const selectTaxRate = (state: RootState) => state.cart.taxRate;

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);

export const selectSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export const selectDiscount = createSelector(
  [selectSubtotal, selectDiscountCode],
  (subtotal, code) => {
    if (!code) return 0;
    return subtotal * (code.percentage / 100);
  }
);

export const selectTax = createSelector(
  [selectSubtotal, selectDiscount, selectTaxRate],
  (subtotal, discount, taxRate) => {
    return (subtotal - discount) * taxRate;
  }
);

export const selectTotal = createSelector(
  [selectSubtotal, selectDiscount, selectTax],
  (subtotal, discount, tax) => subtotal - discount + tax
);

export const selectCartSummary = createSelector(
  [selectSubtotal, selectDiscount, selectTax, selectTotal, selectCartItemCount],
  (subtotal, discount, tax, total, itemCount) => ({
    itemCount,
    subtotal,
    discount,
    tax,
    total,
  })
);
```

## 2. User Authentication

### User Slice with Async Thunk

```typescript
// store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'moderator';
  permissions: string[];
  avatar?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async Thunks
export const fetchUser = createAsyncThunk<
  User,
  string,
  {
    rejectValue: string;
  }
>('user/fetchUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  {
    rejectValue: string;
  }
>('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const logoutUser = createAsyncThunk<
  void,
  void,
  {
    rejectValue: string;
  }
>('user/logout', async (_, { rejectWithValue }) => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
```

### User Selectors

```typescript
// store/selectors/userSelectors.ts
import { RootState } from '../index';

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;

export const selectUserPermissions = (state: RootState) =>
  state.user.user?.permissions || [];

export const selectHasPermission = (permission: string) => (state: RootState) =>
  state.user.user?.permissions.includes(permission) ?? false;

export const selectUserRole = (state: RootState) => state.user.user?.role;

export const selectIsAdmin = (state: RootState) =>
  state.user.user?.role === 'admin';
```

## 3. RTK Query for Products API

```typescript
// store/api/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, { page?: number; category?: string }>({
      query: ({ page = 1, category }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        if (category) params.append('category', category);
        return `/products?${params}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, _error, id) => [{ type: 'Product', id }],
    }),

    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, _error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, _error, id) => [{ type: 'Product', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
```

## 4. Custom Hooks

```typescript
// hooks/useAppSelector.ts
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '../store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();

// hooks/useCart.ts
import { useAppDispatch, useAppSelector } from './';
import {
  selectCartSummary,
  selectCartItems,
  addItem,
  removeItem,
  updateQuantity,
} from '../store/slices/cartSlice';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const summary = useAppSelector(selectCartSummary);

  return {
    items,
    summary,
    addItem: (item) => dispatch(addItem(item)),
    removeItem: (productId) => dispatch(removeItem(productId)),
    updateQuantity: (productId, quantity) =>
      dispatch(updateQuantity({ productId, quantity })),
  };
};

// hooks/useUser.ts
import { useAppDispatch, useAppSelector } from './';
import {
  selectUser,
  selectIsAuthenticated,
  selectUserLoading,
} from '../store/selectors/userSelectors';
import { loginUser, logoutUser, fetchUser } from '../store/slices/userSlice';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectUserLoading);

  return {
    user,
    isAuthenticated,
    loading,
    login: (email: string, password: string) =>
      dispatch(loginUser({ email, password })),
    logout: () => dispatch(logoutUser()),
    fetchUser: (userId: string) => dispatch(fetchUser(userId)),
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
      <h1>Shopping Cart</h1>
      {items.map((item) => (
        <div key={item.productId}>
          <h3>{item.name}</h3>
          <p>${item.price.toFixed(2)}</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.productId, parseInt(e.target.value))
            }
          />
          <button onClick={() => removeItem(item.productId)}>Remove</button>
        </div>
      ))}
      <div>
        <p>Subtotal: ${summary.subtotal.toFixed(2)}</p>
        <p>Tax: ${summary.tax.toFixed(2)}</p>
        <p>Total: ${summary.total.toFixed(2)}</p>
      </div>
    </div>
  );
};

// components/LoginForm.tsx
import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';

export const LoginForm: React.FC = () => {
  const { login, loading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
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
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## 6. Testing Redux Code

```typescript
// __tests__/cartSlice.test.ts
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
} from '../store/slices/cartSlice';

describe('cartSlice', () => {
  it('should add item to cart', () => {
    const initialState = { items: [], discountCode: null, taxRate: 0.1 };
    const newItem = {
      id: '1',
      productId: 'p1',
      name: 'Test',
      price: 100,
      quantity: 1,
      image: 'test.jpg',
    };

    const state = cartReducer(initialState, addItem(newItem));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(newItem);
  });

  it('should update quantity of existing item', () => {
    const initialState = {
      items: [
        {
          id: '1',
          productId: 'p1',
          name: 'Test',
          price: 100,
          quantity: 1,
          image: 'test.jpg',
        },
      ],
      discountCode: null,
      taxRate: 0.1,
    };

    const state = cartReducer(
      initialState,
      updateQuantity({ productId: 'p1', quantity: 3 })
    );
    expect(state.items[0].quantity).toBe(3);
  });

  it('should remove item from cart', () => {
    const initialState = {
      items: [
        {
          id: '1',
          productId: 'p1',
          name: 'Test',
          price: 100,
          quantity: 1,
          image: 'test.jpg',
        },
      ],
      discountCode: null,
      taxRate: 0.1,
    };

    const state = cartReducer(initialState, removeItem('p1'));
    expect(state.items).toHaveLength(0);
  });
});
```

## Advanced Patterns

### Thunk Middleware

```typescript
// store/middleware/analytics.ts
import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const analyticsMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);

    // Track actions
    if (typeof action === 'object' && 'type' in action) {
      console.log('Action:', action.type);
      console.log('New State:', store.getState());
    }

    return result;
  };

// Add to store
const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(analyticsMiddleware),
});
```

### Dynamic Reducer Injection

```typescript
// Dynamic feature loading
const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
  },
});

export const injectReducer = (
  store: typeof store,
  name: string,
  reducer: any
) => {
  store.asyncReducers = store.asyncReducers || {};
  store.asyncReducers[name] = reducer;
  store.replaceReducer(
    combineReducers({
      ...store.getState(),
      ...store.asyncReducers,
    })
  );
};
```