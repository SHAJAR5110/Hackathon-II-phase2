# Complete Libraries Integration Guide

## E-Commerce Platform - All Libraries Working Together

This guide shows how all essential libraries integrate in a real-world e-commerce application.

### Project Structure with Library Integration

```
ecommerce-app/
├── app/
│   ├── layout.tsx                    # Next.js layout with Providers
│   ├── page.tsx                      # Next.js + React component
│   ├── products/
│   │   └── [id]/page.tsx             # Next.js dynamic route
│   ├── api/
│   │   ├── products/route.ts         # Next.js API route
│   │   └── checkout/route.ts         # Stripe payment handling
│   └── checkout/page.tsx             # Forms + Payment
├── components/
│   ├── ProductCard.tsx               # shadcn/ui + Tailwind
│   ├── CheckoutForm.tsx              # react-hook-form + Zod
│   └── Header.tsx                    # lucide-react icons
├── lib/
│   ├── firebase.ts                   # Firebase setup
│   ├── stripe.ts                     # Stripe setup
│   ├── validation.ts                 # Zod schemas
│   └── types.ts                      # TypeScript types
├── store/
│   └── cartStore.ts                  # Zustand state
└── styles/
    └── globals.css                   # Tailwind CSS
```

---

## 1. Next.js App Router Setup with TypeScript

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-Commerce Store',
  description: 'Amazing products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

```typescript
// app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/js';
import { Toaster } from 'react-hot-toast';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_KEY!
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      <Toaster position="top-right" />
      {children}
    </Elements>
  );
}
```

---

## 2. TypeScript Types & Zod Validation Working Together

```typescript
// lib/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'failed';
}

// lib/validation.ts
import { z } from 'zod';
import type { Product, CartItem, Order } from './types';

// Create Zod schema from TypeScript interface
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  price: z.number().positive(),
  image: z.string().url(),
  description: z.string().min(10).max(500),
}) satisfies z.ZodType<Product>;

export const checkoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  address: z.string().min(5),
  cardNumber: z.string().regex(/^\d{16}$/),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
```

---

## 3. Zustand State with Persistence & Type Safety

```typescript
// store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed values
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      // Computed getters
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getTax: () => get().getSubtotal() * 0.1,

      getTotal: () => get().getSubtotal() + get().getTax(),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);

// Custom hook for easy usage
export function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
    tax: store.getTax(),
    total: store.getTotal(),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  };
}
```

---

## 4. React Components with Hooks & TypeScript

```typescript
// components/ProductCard.tsx
'use client';

import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cartStore';
import type { Product } from '@/lib/types';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const addItem = useCart().addItem;

  const handleAddToCart = async () => {
    setIsSaving(true);
    try {
      addItem({ ...product, quantity: 1 });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>

          <div className="flex gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Save for later"
            >
              <Heart size={20} className="text-gray-600" />
            </button>

            <Button
              onClick={handleAddToCart}
              disabled={isSaving}
              size="sm"
              className="gap-2"
            >
              <ShoppingCart size={16} />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Forms with react-hook-form + Zod Integration

```typescript
// components/CheckoutForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/store/cartStore';
import { checkoutSchema, type CheckoutInput } from '@/lib/validation';
import toast from 'react-hot-toast';
import { useState } from 'react';
import axios from 'axios';

export function CheckoutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { total, clearCart } = useCart();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutInput) => {
    setIsSubmitting(true);
    try {
      // Send to API route
      const response = await axios.post('/api/checkout', {
        ...data,
        amount: total,
      });

      toast.success('Order placed successfully!');
      clearCart();
      // Redirect to success page
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <Input
          {...register('fullName')}
          placeholder="John Doe"
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <Input
          {...register('address')}
          placeholder="123 Main St"
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <Input {...register('cardNumber')} placeholder="1234 5678 9012 3456" />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry (MM/YY)
          </label>
          <Input {...register('cardExpiry')} placeholder="12/25" />
          {errors.cardExpiry && (
            <p className="text-red-500 text-sm mt-1">{errors.cardExpiry.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  );
}
```

---

## 6. API Routes with Next.js, Stripe, Firebase, & TypeScript

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { checkoutSchema } from '@/lib/validation';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, fullName, amount } = validation.data;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        email,
        fullName,
      },
    });

    // Save order to Firebase
    const ordersCollection = collection(db, 'orders');
    const orderRef = await addDoc(ordersCollection, {
      email,
      fullName,
      amount,
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderRef.id,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
```

---

## 7. Firebase Integration with TypeScript

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Helper functions with TypeScript
export async function getUserOrders(userId: string) {
  const ordersCollection = collection(db, 'orders');
  const q = query(ordersCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Monitor auth state
export function onAuthStateChangedListener(
  callback: (user: any | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
```

---

## 8. Tailwind CSS + shadcn/ui Component

```typescript
// components/OrderSummary.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/store/cartStore';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface OrderSummaryProps {
  showCheckout?: boolean;
}

export function OrderSummary({ showCheckout = true }: OrderSummaryProps) {
  const { items, subtotal, tax, total } = useCart();

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">Your cart is empty</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="text-gray-900 font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-gray-900 font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className={clsx(
          'flex justify-between text-lg font-semibold',
          total > 100 ? 'text-green-600' : 'text-gray-900'
        )}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {showCheckout && (
        <Button className="w-full" size="lg">
          <Check className="mr-2 h-4 w-4" />
          Proceed to Checkout
        </Button>
      )}
    </Card>
  );
}
```

---

## 9. Troubleshooting Common Integration Issues

### Issue: State not persisting in Zustand
```typescript
// Make sure persist middleware is applied
const store = create<State>()(
  persist((set) => ({ /* ... */ }), {
    name: 'storage-key', // Required
  })
);

// Check localStorage in browser DevTools
// Clear localStorage if needed
```

### Issue: Form not submitting with validation errors
```typescript
// Ensure handleSubmit is used correctly
const onSubmit = handleSubmit(async (data) => {
  // Only called if validation passes
  await submitForm(data);
});

// Don't use onClick on submit button
```

### Issue: Stripe payment failing silently
```typescript
// Always handle both success and error cases
try {
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: element },
  });
  
  if (result.error) {
    // Handle error
    console.error(result.error);
  } else if (result.paymentIntent?.status === 'succeeded') {
    // Handle success
  }
} catch (error) {
  // Handle network errors
}
```

### Issue: Firebase rules blocking reads
```typescript
// Verify security rules allow your operation
// Check:
// 1. Auth state (onAuthStateChanged fired)
// 2. Custom claims in token
// 3. Document ownership
// 4. Collection permissions
```

---

## 10. Environment Variables Setup

```bash
# .env.local
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Stripe
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db
```

This complete integration guide shows how all essential libraries work together in a production e-commerce application!