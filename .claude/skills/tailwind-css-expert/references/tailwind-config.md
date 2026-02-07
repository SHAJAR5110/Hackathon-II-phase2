# Tailwind CSS Configuration & Optimization

## Theme Customization

### 1. Extended Color Palette

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Base
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
  },
};
```

### 2. Custom Typography Scale

```js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        // Responsive typography
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        brand: ['Poppins', 'sans-serif'],
      },
    },
  },
};
```

### 3. Spacing Scale Extension

```js
module.exports = {
  theme: {
    extend: {
      spacing: {
        // Fine-grained spacing
        '7': '1.75rem',
        '9': '2.25rem',
        // Custom units
        'screen': '100vw',
        'screen-h': '100vh',
      },
      gap: {
        '3.5': '0.875rem',
        '5.5': '1.375rem',
      },
    },
  },
};
```

### 4. Custom Shadows

```js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'elevation-2': '0 3px 6px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0 10px 20px rgba(0, 0, 0, 0.19)',
      },
    },
  },
};
```

## Plugin Creation & Integration

### 1. Custom Utility Plugin

```js
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities, matchVariant, theme }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-truncate': {
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
        },
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
      };

      addUtilities(newUtilities);

      // Responsive line clamping
      matchVariant(
        'line-clamp',
        (value) => {
          return {
            display: '-webkit-box',
            '-webkit-line-clamp': value,
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden',
          };
        },
        {
          values: {
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
          },
        }
      );
    }),
  ],
};

// Usage: <p className="line-clamp-3 md:line-clamp-2">Long text</p>
```

### 2. Dark Mode Plugin

```js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('dark', '&.dark');
      // Then use: darkMode: 'class' in config root
    }),
  ],
};
```

### 3. Container Queries Plugin

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      containers: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};
```

## Content Configuration & Tree-Shaking

### 1. Optimal Content Path Configuration

```js
// tailwind.config.js
module.exports = {
  content: [
    // Include all template files
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    
    // Include node_modules if using component libraries
    './node_modules/@company/ui-components/**/*.{js,jsx}',
    
    // Exclude if using conditional rendering
    '!./src/**/*.test.{js,jsx}',
    '!./src/**/*.stories.{js,jsx}',
  ],
};
```

### 2. SafeList for Dynamic Content

```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    // Colors generated dynamically
    {
      pattern: /^bg-(red|blue|green|yellow)-(100|500|900)$/,
    },
    // Grid columns
    {
      pattern: /^grid-cols-[1-6]$/,
    },
    // Custom pattern
    'flex',
    'bg-white',
    'text-gray-900',
  ],
};
```

## Dark Mode Strategy

### 1. Class-based Dark Mode (Recommended for Apps)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Add 'dark' class to <html>
  theme: {
    extend: {},
  },
};

// In React:
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 2. Media Query Dark Mode (Respects OS)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'media', // Respects prefers-color-scheme
};

// Automatic - no JS needed
<div className="bg-white dark:bg-gray-950">Content</div>
```

## Performance Optimization

### 1. CSS File Size Optimization

```js
// tailwind.config.js
module.exports = {
  content: [
    // Be specific with paths
    './src/**/*.{js,jsx,ts,tsx}',
    // Avoid wildcards if possible
    // DON'T: './src/**/*'
  ],
  // Use JIT mode (default in v3+)
  mode: 'jit',
};
```

### 2. Minimize CSS Output

```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: false, // Avoid !important unless needed
  plugins: [
    // Only include needed plugins
    require('@tailwindcss/forms'),
    // Skip unused plugins
  ],
};
```

### 3. Caching Strategy for Large Projects

```bash
# tailwind.config.js
module.exports = {
  cacheInvalidation: ['src', 'public'], // Monitor these paths
};
```

## PurgeCSS & Production Build

### 1. Ensure Tree-Shaking Works

```js
// ✅ Good - string literals
<div className="bg-blue-500 text-white">
<div className={`bg-blue-500 ${condition ? 'text-white' : 'text-gray-900'}`}>

// ❌ Bad - dynamic strings (won't be purged)
const color = 'bg-blue-500';
<div className={color}>
```

### 2. Build Configuration

For Next.js (Automatic):
```bash
# next.config.js - Tailwind automatically optimized
```

For React with Webpack:
```bash
# Make sure NODE_ENV=production during build
npm run build
```

## CSS-in-JS Integration

### 1. Styled Components with Tailwind

```jsx
import styled from 'styled-components';

export const StyledCard = styled.div`
  @apply bg-white rounded-lg shadow-md p-6 dark:bg-gray-950;
  
  &:hover {
    @apply shadow-lg;
  }
`;

// Usage
<StyledCard>Content</StyledCard>
```

### 2. Emotion with Tailwind

```jsx
import { css } from '@emotion/react';
import tw from 'twin.macro';

const cardStyles = css`
  ${tw`bg-white rounded-lg shadow-md p-6`}
  &:hover {
    ${tw`shadow-lg`}
  }
`;

<div css={cardStyles}>Content</div>
```

## Framework-Specific Configuration

### 1. Next.js Setup

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@ui/library'],
  },
};

module.exports = nextConfig;
```

```js
// tailwind.config.js (Next.js)
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
  ],
};
```

### 2. Vite Setup

```js
// vite.config.js
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
};
```

## PostCSS Configuration

### 1. Complete PostCSS Setup

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-nested': {}, // Optional: for nested selectors
  },
};
```

### 2. Customized PostCSS

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
```

## Performance Metrics

Monitor these metrics in production:

- **CSS Bundle Size**: Target <50KB gzipped for typical apps
- **Time to Interactive**: CSS shouldn't delay initial load
- **First Contentful Paint**: Optimize critical CSS delivery
- **Cumulative Layout Shift**: Use `transition` classes to prevent jank

Use Chrome DevTools and Lighthouse to measure actual performance.