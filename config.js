import StyleDictionary from "style-dictionary";

// ============================================
// UTILITIES
// ============================================

const transformReference = (value) => {
  const stringValue = value.toString();
  if (!stringValue.includes("{")) return value;

  return stringValue.replace(/\{([^}]+)\}/g, (_, content) =>
    content.replace(/\./g, "-"),
  );
};

const sortKeys = (keys) => {
  return keys.sort((a, b) => {
    const aIsNum = /^\d+$/.test(a);
    const bIsNum = /^\d+$/.test(b);

    if (aIsNum && bIsNum) return parseInt(a) - parseInt(b);
    if (aIsNum) return 1;
    if (bIsNum) return -1;
    return a.localeCompare(b);
  });
};

const isObject = (value) => {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
};

// ============================================
// KEY FORMATTERS
// ============================================

const KeyFormatter = {
  getSafeKey(key) {
    if (/^\d/.test(key) || /[^a-zA-Z0-9_$]/.test(key)) {
      return `'${key}'`;
    }
    return key;
  },

  toCamelCase(key) {
    if (/^\d/.test(key)) {
      const match = key.match(/^(\d+)(.*)$/);
      return match ? match[2] + match[1] : `'${key}'`;
    }

    return key
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");
  },

  getRawKey(key) {
    if (/^\d/.test(key) || /[^a-zA-Z0-9_$]/.test(key)) {
      return `'${key}'`;
    }

    return key
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");
  },
};

// ============================================
// OBJECT BUILDER
// ============================================

const buildNestedObject = (tokens) => {
  const result = {};

  tokens.forEach((token) => {
    const path = token.path;
    let current = result;

    // Navigate to nested position
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    // Set final value with transformation
    const lastKey = path[path.length - 1];
    current[lastKey] = transformReference(token.original.value);
  });

  return result;
};

// ============================================
// INTERFACE GENERATORS
// ============================================

const InterfaceGenerator = {
  generateInline(obj, indent = 0) {
    const spaces = "  ".repeat(indent);
    const lines = ["{\n"];

    const sortedKeys = sortKeys(Object.keys(obj));

    for (const key of sortedKeys) {
      const value = obj[key];
      const safeKey = KeyFormatter.getSafeKey(key);
      const valueType = this._getValueType(value, indent);

      lines.push(`${spaces}  ${safeKey}: ${valueType};\n`);
    }

    lines.push(`${spaces}}`);
    return lines.join("");
  },

  generateNamed(obj, interfaceName) {
    const lines = [`export interface ${interfaceName} {\n`];
    const sortedKeys = sortKeys(Object.keys(obj));

    for (const key of sortedKeys) {
      const value = obj[key];
      const safeKey = KeyFormatter.getSafeKey(key);
      const valueType = this._getValueType(value, 1);

      lines.push(`  ${safeKey}: ${valueType};\n`);
    }

    lines.push(`}\n\n`);
    return lines.join("");
  },

  _getValueType(value, indent) {
    if (isObject(value)) {
      return this.generateInline(value, indent + 1);
    }
    return typeof value === "number" ? "number" : "string";
  },
};

// ============================================
// SHARED INTERFACE ANALYZER
// ============================================

const SharedInterfaceAnalyzer = {
  analyze(obj) {
    const structureGroups = new Map();

    // Group objects by structure
    for (const [key, value] of Object.entries(obj)) {
      if (!isObject(value)) continue;

      const signature = Object.keys(value).sort().join(",");
      if (!structureGroups.has(signature)) {
        structureGroups.set(signature, []);
      }
      structureGroups.get(signature).push({ key, value });
    }

    return this._generateInterfaces(structureGroups);
  },

  _generateInterfaces(structureGroups) {
    const interfaces = [];
    const interfaceMap = new Map();

    structureGroups.forEach((group) => {
      if (group.length <= 1) return;

      const baseName =
        group[0].key.charAt(0).toUpperCase() + group[0].key.slice(1);
      const interfaceName = `I${baseName}Palette`;

      interfaces.push(
        InterfaceGenerator.generateNamed(group[0].value, interfaceName),
      );

      group.forEach(({ key }) => {
        interfaceMap.set(key, interfaceName);
      });
    });

    return {
      interfaces: interfaces.join(""),
      interfaceMap,
    };
  },
};

// ============================================
// MAIN INTERFACE GENERATOR
// ============================================

const generateMainInterface = (obj, interfaceMap) => {
  const lines = ["export interface DesignTokens {\n"];

  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = KeyFormatter.toCamelCase(key);

    if (isObject(value)) {
      const interfaceType = interfaceMap.has(key)
        ? interfaceMap.get(key)
        : InterfaceGenerator.generateInline(value, 1);

      lines.push(`  ${normalizedKey}: ${interfaceType};\n`);
    } else {
      const type = typeof value === "number" ? "number" : "string";
      lines.push(`  ${normalizedKey}: ${type};\n`);
    }
  }

  lines.push(`}\n\n`);
  return lines.join("");
};

// ============================================
// OBJECT VALUE GENERATOR
// ============================================

const generateObjectValue = (obj, indent = 0) => {
  const spaces = "  ".repeat(indent);
  const lines = ["{\n"];

  for (const [key, value] of Object.entries(obj)) {
    const objKey = KeyFormatter.getRawKey(key);
    const formattedValue = formatValue(value, indent);

    lines.push(`${spaces}  ${objKey}: ${formattedValue},\n`);
  }

  lines.push(`${spaces}}`);
  return lines.join("");
};

const formatValue = (value, indent) => {
  if (isObject(value)) {
    return generateObjectValue(value, indent + 1);
  }

  if (typeof value === "number") {
    return value;
  }

  const escapedValue = String(value).replace(/`/g, "\\`").replace(/\$/g, "\\$");

  return `\`${escapedValue}\``;
};

// ============================================
// REGISTER FORMAT
// ============================================

StyleDictionary.registerFormat({
  name: "typescript/auto-interfaces",
  format: ({ dictionary }) => {
    const nestedTokens = buildNestedObject(dictionary.allTokens);
    const { interfaces, interfaceMap } =
      SharedInterfaceAnalyzer.analyze(nestedTokens);
    const mainInterface = generateMainInterface(nestedTokens, interfaceMap);
    const objectValue = generateObjectValue(nestedTokens);

    return `${interfaces}${mainInterface}export const tokens = () => {
          return ${objectValue} as const;
        };

        export type Tokens = ReturnType<typeof tokens>;`;
  },
});

// ============================================
// CONFIGURATION
// ============================================

export default {
  source: ["tokens/**/*.json"],

  platforms: {
    ts: {
      transformGroup: "js",
      buildPath: "src/app/design-system/",
      files: [
        {
          destination: "tokens.ts",
          format: "typescript/auto-interfaces",
          options: {
            showFileHeader: true,
            outputReferences: false,
          },
        },
      ],
    },

    tsWithRefs: {
      transformGroup: "js",
      buildPath: "src/app/design-system/",
      files: [
        {
          destination: "tokens.references.ts",
          format: "typescript/auto-interfaces",
          options: {
            showFileHeader: true,
            outputReferences: true,
          },
        },
      ],
    },

    scss: {
      transformGroup: "scss",
      buildPath: "src/styles/",
      files: [
        {
          destination: "_variables.scss",
          format: "scss/variables",
        },
      ],
    },

    css: {
      transformGroup: "css",
      buildPath: "src/styles/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
  },
};
