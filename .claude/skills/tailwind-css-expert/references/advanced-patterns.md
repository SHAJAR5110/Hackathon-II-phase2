# Advanced Tailwind CSS Patterns

## Component Composition Strategies

### 1. Compound Components Pattern

Build complex components from smaller, interdependent pieces:

```jsx
// Card compound component
export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>{children}</div>;
}

Card.Header = function({ children, className = '' }) {
  return <div className={`border-b pb-4 mb-4 ${className}`}>{children}</div>;
};

Card.Body = function({ children, className = '' }) {
  return <div className={`text-gray-700 ${className}`}>{children}</div>;
};

Card.Footer = function({ children, className = '' }) {
  return <div className={`border-t pt-4 mt-4 flex justify-end gap-2 ${className}`}>{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content here</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### 2. Variants Pattern

Use object-based variant management for scalability:

```jsx
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ variant = 'primary', size = 'md', ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-lg
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
      `}
      {...props}
    />
  );
}
```

### 3. Slot Pattern for Flexibility

Allow component consumers to customize parts:

```jsx
export function Dialog({ isOpen, onClose, title, children, footer }) {
  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
            <div className="mt-4">{children}</div>
          </div>
          {footer && <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
```

## Grid & Layout Patterns

### 1. Responsive Grid Layout

```jsx
// Auto-grid that respects minimum column width
<div className="
  grid gap-4
  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
  auto-rows-max
">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

### 2. Masonry-like Layout with CSS Grid

```jsx
<div className="
  grid gap-6
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  auto-rows-max
">
  {/* Items automatically flow into available space */}
</div>
```

### 3. Sidebar Layout

```jsx
<div className="
  grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6
  min-h-screen
">
  <aside className="bg-gray-100 p-4 rounded-lg">
    {/* Sidebar content */}
  </aside>
  <main className="p-4">
    {/* Main content */}
  </main>
</div>
```

## Animation & Transition Patterns

### 1. Smooth State Transitions

```jsx
<div className="
  transition-all duration-300 ease-in-out
  opacity-100 hover:opacity-75
  transform hover:scale-105
  hover:shadow-lg
">
  Content
</div>
```

### 2. Staggered List Animation

Use `style` with CSS variables for stagger timing:

```jsx
{items.map((item, index) => (
  <div
    key={item.id}
    style={{ '--animation-delay': `${index * 50}ms` }}
    className="
      animate-fade-in
      opacity-0
      [animation-delay:var(--animation-delay)]
    "
  >
    {item.content}
  </div>
))}
```

### 3. Entrance Animations with Tailwind

```jsx
<div className="
  animate-fade-in-up
  md:animate-fade-in
  transition-all duration-500
">
  {/* Content with animation */}
</div>
```

## Form Patterns

### 1. Input Field with Validation

```jsx
export function TextInput({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${error
            ? 'border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-gray-300 focus:ring-blue-500'
          }
        `}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

### 2. Form Layout

```jsx
<form className="space-y-6 max-w-md mx-auto">
  <TextInput label="Email" type="email" required />
  <TextInput label="Password" type="password" required />
  
  <div className="flex items-center gap-2">
    <input type="checkbox" id="remember" className="w-4 h-4" />
    <label htmlFor="remember" className="text-sm text-gray-700">
      Remember me
    </label>
  </div>
  
  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
    Sign in
  </button>
</form>
```

## Typography & Color Hierarchy

### 1. Text Hierarchy System

```jsx
// Page Title
<h1 className="text-4xl font-bold text-gray-900 mb-2">Page Title</h1>

// Section Title
<h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Section Title</h2>

// Subsection
<h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Subsection</h3>

// Body text
<p className="text-base text-gray-600 leading-relaxed">Body paragraph text</p>

// Metadata/Secondary
<p className="text-sm text-gray-500">Metadata or secondary information</p>

// Small hint
<p className="text-xs text-gray-400">Small hint or caption</p>
```

### 2. Color Semantics

```jsx
// Success
<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
  ✓ Success message
</div>

// Error
<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg">
  ✗ Error message
</div>

// Warning
<div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg">
  ⚠ Warning message
</div>

// Info
<div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg">
  ℹ Info message
</div>
```

## Custom Utilities & Variants

### 1. Using Arbitrary Values

```jsx
// Custom sizes
<div className="w-[340px] h-[500px]">Custom dimensions</div>

// Custom colors
<div className="bg-[#1e3a8a] text-[#f8fafc]">Custom color</div>

// Custom spacing
<div className="gap-[13px] p-[42px]">Custom spacing</div>
```

### 2. Custom Variants for Complex Selectors

Define in `tailwind.config.js`:

```js
module.exports = {
  theme: {},
  plugins: [
    function({ addVariant }) {
      addVariant('group-even', ':nth-child(even) &');
      addVariant('peer-invalid', ':invalid ~ &');
    }
  ]
}
```

Then use: `<div className="group-even:bg-gray-50">`

## Dark Mode Implementation

### 1. Class-based Dark Mode

In `tailwind.config.js`: `darkMode: 'class'`

```jsx
export function Card({ children }) {
  return (
    <div className="
      bg-white dark:bg-gray-950
      text-gray-900 dark:text-gray-50
      border border-gray-200 dark:border-gray-800
      rounded-lg shadow dark:shadow-lg
      transition-colors duration-200
    ">
      {children}
    </div>
  );
}

// Toggle theme
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <button
      onClick={() => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
```

### 2. Media Query Dark Mode

In `tailwind.config.js`: `darkMode: 'media'` (respects OS preference)

```jsx
<div className="bg-white dark:bg-gray-950">
  {/* Automatically switches based on OS/browser dark mode */}
</div>
```

## Performance Optimization

### 1. CSS Class Optimization

Avoid dynamic class strings:
```jsx
// ❌ Bad - prevents tree-shaking
const bgClass = condition ? 'bg-blue-500' : 'bg-red-500';
<div className={bgClass}>

// ✅ Good - tree-shakeable
<div className={condition ? 'bg-blue-500' : 'bg-red-500'}>
```

### 2. Utility Extraction for Reuse

```jsx
const formInputClasses = `
  w-full px-4 py-2 rounded-lg border border-gray-300
  focus:outline-none focus:ring-2 focus:ring-blue-500
  transition-colors duration-200
`;

<input className={formInputClasses} />
<textarea className={formInputClasses} />
```

### 3. CSS-in-JS with Tailwind (if using library)

```jsx
// For heavily used components, consider extracting to Tailwind @apply
// in a CSS file, but inline Tailwind is generally preferred
```