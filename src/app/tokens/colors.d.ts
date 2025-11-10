/**
 * Do not edit directly, this file was auto-generated.
 */

export default tokens;

declare interface DesignToken {
  value?: any;
  type?: string;
  comment?: string;
  name?: string;
  themeable?: boolean;
  attributes?: Record<string, unknown>;
  [key: string]: any;
}

declare const tokens: {
  border: {
    none: DesignToken;
    sm: DesignToken;
    md: DesignToken;
    lg: DesignToken;
    full: DesignToken;
    thin: DesignToken;
    medium: DesignToken;
    thick: DesignToken;
  };
  color: {
    base: {
      white: DesignToken;
      black: DesignToken;
      gray: {
        "100": DesignToken;
        "200": DesignToken;
        "300": DesignToken;
        "400": DesignToken;
        "500": DesignToken;
        "600": DesignToken;
        "700": DesignToken;
        "800": DesignToken;
        "900": DesignToken;
      };
    };
    brand: {
      primary: DesignToken;
      secondary: DesignToken;
      accent: DesignToken;
    };
    semantic: {
      success: DesignToken;
      warning: DesignToken;
      error: DesignToken;
      info: DesignToken;
    };
    text: {
      primary: DesignToken;
      secondary: DesignToken;
      disabled: DesignToken;
    };
    background: {
      primary: DesignToken;
      secondary: DesignToken;
    };
  };
  font: {
    family: {
      heading: DesignToken;
    };
    size: {
      xs: DesignToken;
      sm: DesignToken;
      base: DesignToken;
      lg: DesignToken;
      xl: DesignToken;
      "2xl": DesignToken;
      "3xl": DesignToken;
      "4xl": DesignToken;
    };
    weight: {
      light: DesignToken;
      normal: DesignToken;
      medium: DesignToken;
      semibold: DesignToken;
      bold: DesignToken;
    };
  };
  padding: {
    sm: DesignToken;
    xs: DesignToken;
  };
  spacing: {
    xs: DesignToken;
    sm: DesignToken;
    md: DesignToken;
    lg: DesignToken;
    xl: DesignToken;
    xxl: DesignToken;
  };
};
