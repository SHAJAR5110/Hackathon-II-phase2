# Tailwind CSS Component Examples

## Button Variants

```jsx
export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  children, 
  ...props 
}) {
  const baseStyles = 'font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Card Component

```jsx
export function Card({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white dark:bg-gray-900 shadow-md hover:shadow-lg',
    outlined: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl',
  };
  
  return (
    <div className={`rounded-lg overflow-hidden transition-shadow duration-300 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

Card.Header = function({ children, className = '' }) {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function({ children, className = '' }) {
  return <div className={`px-6 py-4 text-gray-700 dark:text-gray-300 ${className}`}>{children}</div>;
};

Card.Footer = function({ children, className = '' }) {
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800 ${className}`}>
      {children}
    </div>
  );
};
```

## Form Input

```jsx
export function Input({ 
  label, 
  error, 
  helperText, 
  disabled = false, 
  ...props 
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg border
          text-gray-900 dark:text-white
          bg-white dark:bg-gray-800
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
          }
        `}
        disabled={disabled}
        {...props}
      />
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{helperText}</p>}
    </div>
  );
}
```

## Alert Component

```jsx
export function Alert({ type = 'info', title, children, onClose }) {
  const styles = {
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
      title: 'text-blue-900 dark:text-blue-100',
      text: 'text-blue-800 dark:text-blue-200',
      icon: '🔵',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
      title: 'text-green-900 dark:text-green-100',
      text: 'text-green-800 dark:text-green-200',
      icon: '✓',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
      title: 'text-yellow-900 dark:text-yellow-100',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: '⚠',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
      title: 'text-red-900 dark:text-red-100',
      text: 'text-red-800 dark:text-red-200',
      icon: '✕',
    },
  };
  
  const style = styles[type];
  
  return (
    <div className={`${style.container} rounded-lg p-4`}>
      <div className="flex gap-3">
        <span className="flex-shrink-0 text-lg">{style.icon}</span>
        <div className="flex-1">
          {title && <h4 className={`font-semibold mb-1 ${style.title}`}>{title}</h4>}
          <p className={style.text}>{children}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="flex-shrink-0 text-xl opacity-50 hover:opacity-100">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
```

## Badge Component

```jsx
export function Badge({ variant = 'default', size = 'md', children }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  return (
    <span className={`inline-block rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
```

## Avatar Component

```jsx
export function Avatar({ src, alt = 'Avatar', name, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  
  const initials = name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-blue-500 text-white font-semibold`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
```

## Badge Group

```jsx
export function TagGroup({ tags, onRemove }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1.5 rounded-full text-sm"
        >
          {tag}
          {onRemove && (
            <button onClick={() => onRemove(tag)} className="hover:text-gray-600 dark:hover:text-gray-300">
              ✕
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
```

## Loading Spinner

```jsx
export function Spinner({ size = 'md', label }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };
  
  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`${sizes[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
      {label && <span className="text-gray-600 dark:text-gray-400">{label}</span>}
    </div>
  );
}
```

## Responsive Grid

```jsx
export function ResponsiveGrid({ children, columns = 3 }) {
  const gridColsMap = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid gap-6 ${gridColsMap[columns]}`}>
      {children}
    </div>
  );
}
```

## Modal Dialog

```jsx
export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-4 text-gray-700 dark:text-gray-300">{children}</div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```