// Export global styles
import './styles/globals.css';

// Export utility functions
export { cn } from './utils/cn';

// Re-export common UI components if they exist
// export * from './components';

// Export types related to UI styling
export interface TBWATheme {
  colors: {
    turquoise: string;
    turquoiseLight: string;
    turquoiseDark: string;
    charcoal: string;
    charcoalLight: string;
    charcoalDark: string;
    neutral: Record<string, string>;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const tbwaTheme: TBWATheme = {
  colors: {
    turquoise: '#00B5AD',
    turquoiseLight: '#1AC7C0',
    turquoiseDark: '#008B85',
    charcoal: '#333333',
    charcoalLight: '#4A4A4A',
    charcoalDark: '#1A1A1A',
    neutral: {
      '50': '#F8F9FA',
      '100': '#F1F3F4',
      '200': '#E8EAED',
      '300': '#DADCE0',
      '400': '#BDC1C6',
      '500': '#9AA0A6',
      '600': '#80868B',
      '700': '#5F6368',
      '800': '#3C4043',
      '900': '#202124',
    },
    success: '#34A853',
    warning: '#FBBC04',
    error: '#EA4335',
    info: '#4285F4',
  },
};