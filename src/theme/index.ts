'use client';

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#fbf7ee',
    100: '#f5ebd3',
    200: '#edd8a8',
    300: '#e3be75',
    400: '#d9a647',
    500: '#c58d2b', // Dourado elegante / premium
    600: '#a36d20',
    700: '#7d501b',
    800: '#5c3917',
    900: '#3a220d',
  },
  dark: {
    bg: '#0b0d13',
    surface: '#12151e',
    card: '#161922',
    border: '#232936',
    hover: '#1d222e',
  },
  accent: {
    barber: '#3182ce',
    clothing: '#d9a647',
    manicure: '#ed64a6',
  },
};

const styles = {
  global: {
    'html, body': {
      bg: '#0b0d13',
      color: '#f1f5f9',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      minHeight: '100vh',
      overflowX: 'hidden',
      WebkitTapHighlightColor: 'transparent',
    },
    '::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: '#0b0d13',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#232936',
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: '#d9a647',
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'xl',
      transition: 'all 0.2s ease',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: '2xl',
        bg: '#161922',
        borderColor: '#232936',
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: '#161922',
        borderColor: '#232936',
      },
    },
  },
  Drawer: {
    baseStyle: {
      dialog: {
        bg: '#12151e',
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        bg: '#161922',
        borderColor: '#232936',
      },
      item: {
        bg: '#161922',
        _hover: {
          bg: '#1d222e',
        },
      },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
});

export default theme;
