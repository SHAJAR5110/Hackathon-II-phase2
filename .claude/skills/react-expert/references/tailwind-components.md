# Tailwind CSS Component Patterns & Animations

## Modern Button Variants

### Primary Button with Hover Animation
```typescript
<button className="
  px-6 py-3 
  bg-gradient-to-r from-blue-600 to-indigo-600
  text-white font-semibold rounded-lg
  
  hover:from-blue-700 hover:to-indigo-700
  hover:shadow-lg hover:scale-105
  
  active:scale-95
  
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  
  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  
  transition-all duration-200 ease-in-out
">
  Click Me
</button>
```

### Ghost Button
```typescript
<button className="
  px-6 py-3
  bg-transparent border-2 border-blue-600
  text-blue-600 font-semibold rounded-lg
  
  hover:bg-blue-600 hover:text-white
  hover:shadow-md
  
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  
  transition-all duration-300
">
  Ghost Button
</button>
```

### Loading Button
```typescript
interface ButtonProps {
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

function LoadingButton({ loading, children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
        relative px-6 py-3
        bg-blue-600 text-white font-semibold rounded-lg
        
        hover:bg-blue-700
        disabled:bg-gray-400 disabled:cursor-not-allowed
        
        transition-colors duration-200
      "
    >
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
      
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </button>
  )
}
```

## Card Components

### Elevated Card with Hover Effect
```typescript
<article className="
  p-6 
  bg-white dark:bg-gray-800
  rounded-xl shadow-md
  
  hover:shadow-2xl hover:-translate-y-2
  
  transition-all duration-300 ease-out
  
  border border-gray-200 dark:border-gray-700
">
  <div className="flex items-center gap-4 mb-4">
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        {/* Icon */}
      </svg>
    </div>
    
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        Card Title
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Subtitle
      </p>
    </div>
  </div>
  
  <p className="text-gray-600 dark:text-gray-300">
    Card content goes here with proper contrast and spacing.
  </p>
</article>
```

### Gradient Border Card
```typescript
<div className="
  p-[2px]
  bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
  rounded-xl
  
  hover:scale-105
  transition-transform duration-300
">
  <div className="
    p-6
    bg-white dark:bg-gray-900
    rounded-xl
    h-full
  ">
    <h3 className="text-lg font-bold mb-2">
      Gradient Border Card
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      Content with animated gradient border
    </p>
  </div>
</div>
```

### Interactive Product Card
```typescript
interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    rating: number
  }
  onAddToCart: (id: string) => void
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="
      group
      relative overflow-hidden
      bg-white rounded-xl shadow-md
      
      hover:shadow-2xl
      transition-shadow duration-300
    ">
      {/* Image Container */}
      <div className="
        relative h-64 overflow-hidden
        bg-gray-100
      ">
        <img
          src={product.image}
          alt={product.name}
          className="
            w-full h-full object-cover
            
            group-hover:scale-110
            transition-transform duration-500
          "
        />
        
        {/* Overlay on Hover */}
        <div className="
          absolute inset-0
          bg-black bg-opacity-0
          group-hover:bg-opacity-20
          transition-all duration-300
        " />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < product.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        
        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            ${product.price}
          </span>
          
          <button
            onClick={() => onAddToCart(product.id)}
            className="
              px-4 py-2
              bg-blue-600 text-white font-semibold rounded-lg
              
              hover:bg-blue-700
              active:scale-95
              
              transform
              transition-all duration-200
            "
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}
```

## Modal/Dialog Components

### Animated Modal with Backdrop
```typescript
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="
          fixed inset-0 z-40
          bg-black bg-opacity-50
          
          animate-fade-in
        "
      />
      
      {/* Modal */}
      <div className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-4
      ">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-md
            bg-white dark:bg-gray-800
            rounded-2xl shadow-2xl
            
            animate-scale-in
          "
        >
          {/* Header */}
          <div className="
            flex items-center justify-between
            p-6 border-b border-gray-200 dark:border-gray-700
          ">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            
            <button
              onClick={onClose}
              className="
                p-2 rounded-lg
                text-gray-500 hover:text-gray-700
                hover:bg-gray-100
                transition-colors
              "
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
}
```

## Form Components

### Modern Input Field
```typescript
interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  required?: boolean
}

function Input({ label, value, onChange, error, type = 'text', required }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`
          w-full px-4 py-3
          bg-white dark:bg-gray-800
          border-2 rounded-lg
          
          ${error 
            ? 'border-red-500 focus:border-red-600' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
          }
          
          text-gray-900 dark:text-white
          placeholder-gray-400
          
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          
          transition-colors duration-200
          
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  )
}
```

## Navigation Components

### Responsive Navbar
```typescript
import { useState } from 'react'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">Logo</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <a href="#" className="
                px-3 py-2 rounded-md text-sm font-medium
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                hover:text-blue-600
                transition-colors duration-200
              ">
                Home
              </a>
              <a href="#" className="
                px-3 py-2 rounded-md text-sm font-medium
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                hover:text-blue-600
                transition-colors duration-200
              ">
                About
              </a>
              <a href="#" className="
                px-3 py-2 rounded-md text-sm font-medium
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                hover:text-blue-600
                transition-colors duration-200
              ">
                Contact
              </a>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="
                p-2 rounded-md
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
              "
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div
        className={`
          md:hidden
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'max-h-screen' : 'max-h-0'}
        `}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <a href="#" className="
            block px-3 py-2 rounded-md text-base font-medium
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:text-blue-600
          ">
            Home
          </a>
          <a href="#" className="
            block px-3 py-2 rounded-md text-base font-medium
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:text-blue-600
          ">
            About
          </a>
          <a href="#" className="
            block px-3 py-2 rounded-md text-base font-medium
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:text-blue-600
          ">
            Contact
          </a>
        </div>
      </div>
    </nav>
  )
}
```

## Loading States

### Skeleton Loader
```typescript
function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded" />
        <div className="h-3 bg-gray-300 rounded w-5/6" />
      </div>
    </div>
  )
}
```

### Spinner
```typescript
function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className="flex items-center justify-center">
      <svg
        className={`${sizeClasses[size]} animate-spin text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}
```

## Tailwind Configuration for Animations

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

## Responsive Design Patterns

**Mobile-First Approach:**
```typescript
<div className="
  w-full px-4 py-6              // Mobile (default)
  sm:px-6                       // Small screens (640px+)
  md:w-3/4 md:px-8             // Medium (768px+)
  lg:w-2/3 lg:px-12            // Large (1024px+)
  xl:w-1/2 xl:max-w-screen-xl  // Extra large (1280px+)
  2xl:px-16                     // 2X large (1536px+)
">
  Responsive Content
</div>
```

## Accessibility Best Practices

```typescript
// ✅ Proper focus states
<button className="
  focus:outline-none
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  focus:ring-offset-white dark:focus:ring-offset-gray-900
">
  Accessible Button
</button>

// ✅ Color contrast (WCAG AA)
<p className="
  text-gray-900 dark:text-gray-100  // High contrast
  bg-white dark:bg-gray-900
">
  Readable text
</p>

// ✅ Screen reader support
<button
  aria-label="Close modal"
  className="..."
>
  <svg aria-hidden="true">...</svg>
</button>
```