# Redux Toolkit Store Template

## Complete Redux Setup

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

## Provider Setup

```typescript
// main.tsx or app.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

## Usage in Components

```typescript
// Component using Redux
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectCartTotal, addItem } from '../store/selices/cartSlice';

export const CartComponent = () => {
  const dispatch = useAppDispatch();
  const total = useAppSelector(selectCartTotal);

  return (
    <div>
      <p>Total: ${total}</p>
      <button onClick={() => dispatch(addItem({ /* ... */ }))}>
        Add Item
      </button>
    </div>
  );
};
```