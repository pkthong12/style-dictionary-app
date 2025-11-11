export interface DesignTokens {
  border: {
    full: number;
    lg: number;
    md: number;
    medium: number;
    none: number;
    sm: number;
    thick: number;
    thin: number;
  };
  color: {
    background: {
      primary: string;
      secondary: string;
    };
    base: {
      black: string;
      gray: {
        '10': string;
        '20': string;
        '30': string;
        '40': string;
        '50': string;
        '60': string;
        '70': string;
        '80': string;
        '90': string;
      };
      white: string;
    };
    brand: {
      accent: string;
      primary: string;
      secondary: string;
    };
    semantic: {
      error: string;
      info: string;
      success: string;
      warning: string;
    };
    text: {
      disabled: string;
      primary: string;
      secondary: string;
    };
  };
  font: {
    family: {
      heading: string;
    };
    size: {
      '2xl': string;
      '3xl': string;
      '4xl': string;
      base: string;
      lg: string;
      sm: string;
      xl: string;
      xs: string;
    };
    weight: {
      bold: string;
      light: string;
      medium: string;
      normal: string;
      semibold: string;
    };
  };
  padding: {
    sm: string;
    xs: string;
  };
  spacing: {
    lg: string;
    md: string;
    sm: string;
    xl: string;
    xs: string;
    xxl: string;
  };
}

export const tokens = () => {
          return {
  border: {
    none: 0,
    sm: 4,
    md: 4,
    lg: 4,
    full: 4,
    thin: 4,
    medium: 4,
    thick: 4,
  },
  color: {
    base: {
      white: `#ffffff`,
      black: `#000000`,
      gray: {
        '10': `#f7fafc`,
        '20': `#edf2f7`,
        '30': `#e2e8f0`,
        '40': `#cbd5e0`,
        '50': `#a0aec0`,
        '60': `#718096`,
        '70': `#4a5568`,
        '80': `#2d3748`,
        '90': `#1a202c`,
      },
    },
    brand: {
      primary: `#3b82f6`,
      secondary: `#8b5cf6`,
      accent: `#ec4899`,
    },
    semantic: {
      success: `#10b981`,
      warning: `#f59e0b`,
      error: `#ef4444`,
      info: `#3b82f6`,
    },
    text: {
      primary: `color-base-gray-90`,
      secondary: `color-base-gray-60`,
      disabled: `color-base-gray-40`,
    },
    background: {
      primary: `color-base-white`,
      secondary: `color-base-gray-10`,
    },
  },
  font: {
    family: {
      heading: `'Poppins', sans-serif`,
    },
    size: {
      xs: `12px`,
      sm: `14px`,
      base: `16px`,
      lg: `18px`,
      xl: `20px`,
      '2xl': `24px`,
      '3xl': `30px`,
      '4xl': `36px`,
    },
    weight: {
      light: `300`,
      normal: `400`,
      medium: `500`,
      semibold: `600`,
      bold: `700`,
    },
  },
  padding: {
    sm: `spacing-sm`,
    xs: `spacing-xs`,
  },
  spacing: {
    xs: `4px`,
    sm: `8px`,
    md: `16px`,
    lg: `24px`,
    xl: `32px`,
    xxl: `48px`,
  },
} as const;
        };

        export type Tokens = ReturnType<typeof tokens>;