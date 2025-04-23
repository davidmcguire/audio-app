const theme = {
  colors: {
    primary: {
      main: '#4A90E2',
      dark: '#357ABD',
      light: '#6BA7E8'
    },
    secondary: {
      main: '#50E3C2',
      dark: '#3AC9A8',
      light: '#6CE8D1'
    },
    accent: {
      main: '#FF6B6B',
      dark: '#E05555',
      light: '#FF8787'
    },
    background: '#F5F7FA',
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
    error: '#FF4D4F',
    success: '#52C41A',
    warning: '#FAAD14',
    info: '#1890FF',
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    }
  },
  typography: {
    fontFamily: {
      primary: "'Poppins', sans-serif",
      secondary: "'Roboto', sans-serif",
      mono: "'Roboto Mono', monospace"
    },
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700
    },
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    }
  },
  spacing: {
    0: '0',
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem'        // 96px
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    xl: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px'
  },
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.25s ease-in-out',
    slow: '0.35s ease-in-out'
  }
};

export default theme; 