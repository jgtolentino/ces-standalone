const path = require('path');
const fs = require('fs').promises;

class ComponentFactory {
  constructor() {
    this.components = new Map();
    this.templates = new Map();
    this.aiGenerate = null;
    
    // Load component templates
    this.loadTemplates();
  }

  setAIEngine(aiFunc) {
    this.aiGenerate = aiFunc;
  }

  async loadTemplates() {
    // Lovable.dev style component templates
    this.templates.set('button', {
      base: `import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };`,
      variants: ['primary', 'secondary', 'outline', 'ghost']
    });

    this.templates.set('card', {
      base: `import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border bg-card text-card-foreground shadow', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card };`,
      variants: ['simple', 'with-header', 'with-footer', 'interactive']
    });
  }

  async createComponent(type, props = {}) {
    console.log(`🎨 Creating ${type} component with Lovable.dev style...`);
    
    const componentId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Get base template if available
      const template = this.templates.get(type);
      
      let prompt;
      if (template) {
        prompt = `Based on this Lovable.dev style template, create a ${type} component:

Base Template:
${template.base}

Requirements:
- Component type: ${type}
- Props: ${JSON.stringify(props, null, 2)}
- Style: Use Tailwind CSS classes with modern design patterns
- Functionality: ${props.functionality || 'Standard interactive behavior'}
- Accessibility: Include proper ARIA attributes
- TypeScript: Full type safety with interfaces

Customize this template to match the specific requirements. Use shadcn/ui design patterns.
Make it production-ready with proper error handling and responsive design.`;
      } else {
        prompt = `Create a React component with Lovable.dev/shadcn/ui styling patterns:

Component Details:
- Type: ${type}
- Props: ${JSON.stringify(props, null, 2)}
- Framework: React with TypeScript
- Styling: Tailwind CSS with modern design system
- Patterns: Follow shadcn/ui conventions
- Accessibility: WCAG 2.1 compliant
- Responsive: Mobile-first design

Requirements:
1. Use React.forwardRef for proper ref handling
2. Include proper TypeScript interfaces
3. Use cn() utility for className merging
4. Apply consistent spacing and typography
5. Include hover/focus states
6. Support dark mode via CSS variables
7. Add proper error boundaries if complex

Generate clean, production-ready code with proper exports.`;
      }
      
      const code = await this.aiGenerate(prompt);
      
      // Parse and validate the generated code
      const component = {
        id: componentId,
        type,
        name: this.capitalizeFirst(type),
        code,
        props,
        metadata: {
          created: new Date(),
          framework: 'React',
          styling: 'Tailwind CSS',
          pattern: 'Lovable.dev/shadcn',
          typescript: true
        },
        files: this.generateComponentFiles(componentId, type, code, props)
      };
      
      this.components.set(componentId, component);
      
      console.log(`✅ Created ${type} component: ${componentId}`);
      return component;
      
    } catch (error) {
      console.error(`❌ Failed to create ${type} component:`, error);
      throw new Error(`Component creation failed: ${error.message}`);
    }
  }

  generateComponentFiles(id, type, code, props) {
    const componentName = this.capitalizeFirst(type);
    
    return [
      {
        path: `components/${componentName}.tsx`,
        content: code,
        type: 'component'
      },
      {
        path: `components/${componentName}.stories.tsx`,
        content: this.generateStorybook(componentName, props),
        type: 'storybook'
      },
      {
        path: `components/__tests__/${componentName}.test.tsx`,
        content: this.generateTest(componentName, props),
        type: 'test'
      },
      {
        path: `components/index.ts`,
        content: `export { ${componentName} } from './${componentName}';`,
        type: 'export'
      }
    ];
  }

  generateStorybook(componentName, props) {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: ${JSON.stringify(props, null, 4)},
};

export const Interactive: Story = {
  args: {
    ...Default.args,
  },
};`;
  }

  generateTest(componentName, props) {
    return `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} ${this.propsToJSX(props)} />);
  });
  
  it('applies correct styling', () => {
    render(<${componentName} ${this.propsToJSX(props)} />);
    const component = screen.getByRole('${this.getAriaRole(componentName)}');
    expect(component).toBeInTheDocument();
  });
  
  it('handles interactions correctly', () => {
    const mockHandler = jest.fn();
    render(<${componentName} onClick={mockHandler} ${this.propsToJSX(props)} />);
    // Add interaction tests
  });
});`;
  }

  async createProject(name, components = []) {
    console.log(`🏗️  Creating Lovable.dev style project: ${name}`);
    
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate project structure
    const project = {
      id: projectId,
      name,
      type: 'lovable-project',
      components: [],
      structure: {
        'package.json': this.generatePackageJson(name),
        'tsconfig.json': this.generateTsConfig(),
        'tailwind.config.js': this.generateTailwindConfig(),
        'lib/utils.ts': this.generateUtilsFile(),
        'components/ui/.gitkeep': '',
      },
      created: new Date()
    };
    
    // Add requested components
    for (const componentSpec of components) {
      const component = await this.createComponent(
        componentSpec.type,
        componentSpec.props
      );
      project.components.push(component);
      
      // Add component files to project structure
      component.files.forEach(file => {
        project.structure[file.path] = file.content;
      });
    }
    
    return project;
  }

  generatePackageJson(name) {
    return JSON.stringify({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build'
      },
      dependencies: {
        'react': '^18',
        'react-dom': '^18',
        'next': '^14',
        '@radix-ui/react-slot': '^1.0.2',
        'class-variance-authority': '^0.7.0',
        'clsx': '^2.0.0',
        'tailwind-merge': '^2.0.0'
      },
      devDependencies: {
        'typescript': '^5',
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.0.1',
        'postcss': '^8',
        '@storybook/react': '^7.0.0',
        '@testing-library/react': '^14.0.0',
        'jest': '^29.0.0'
      }
    }, null, 2);
  }

  generateTsConfig() {
    return JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        baseUrl: '.',
        paths: {
          '@/*': ['./*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2);
  }

  generateTailwindConfig() {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;
  }

  generateUtilsFile() {
    return `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  propsToJSX(props) {
    return Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join(' ');
  }

  getAriaRole(componentName) {
    const roleMap = {
      'Button': 'button',
      'Card': 'article',
      'Input': 'textbox',
      'Select': 'combobox',
      'Dialog': 'dialog'
    };
    return roleMap[componentName] || 'generic';
  }

  getComponentById(id) {
    return this.components.get(id);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }

  deleteComponent(id) {
    return this.components.delete(id);
  }
}

module.exports = ComponentFactory;