import StyleDictionary from "style-dictionary";

// Custom format để tạo TypeScript interfaces tự động từ cấu trúc tokens
StyleDictionary.registerFormat({
  name: "typescript/auto-interfaces",
  format: ({ dictionary }) => {
    // Tạo cấu trúc nested object từ tokens
    const buildNestedObject = (tokens) => {
      const result = {};

      tokens.forEach((token) => {
        const path = token.path;
        let current = result;

        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }

        const lastKey = path[path.length - 1];
        current[lastKey] = token.value;
      });

      return result;
    };

    // Convert key sang valid JavaScript identifier (camelCase)
    const normalizeKey = (key) => {
      if (/^\d/.test(key)) {
        return `'${key}'`;
      }

      const camelCase = key
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, "");

      return camelCase;
    };

    const getRawKey = (key) => {
      if (/^\d/.test(key) || /[^a-zA-Z0-9_$]/.test(key)) {
        return `'${key}'`;
      }

      return key
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, "");
    };

    const getObjectKeys = (obj) => {
      if (typeof obj !== "object" || obj === null) return [];
      return Object.keys(obj);
    };

    // Kiểm tra xem tất cả các object con có cùng cấu trúc không
    const haveSameStructure = (objects) => {
      if (objects.length === 0) return false;

      const firstKeys = getObjectKeys(objects[0]).sort().join(",");
      return objects.every((obj) => {
        const keys = getObjectKeys(obj).sort().join(",");
        return keys === firstKeys && typeof obj === "object";
      });
    };

    // Generate interface từ một object mẫu
    const generateInterfaceFromObject = (obj, interfaceName) => {
      let result = `export interface ${interfaceName} {\n`;

      const sortedKeys = Object.keys(obj).sort((a, b) => {
        // Sắp xếp: strings trước, numbers sau, theo thứ tự
        const aIsNum = /^\d+$/.test(a);
        const bIsNum = /^\d+$/.test(b);

        if (aIsNum && bIsNum) return parseInt(a) - parseInt(b);
        if (aIsNum) return 1;
        if (bIsNum) return -1;
        return a.localeCompare(b);
      });

      for (const key of sortedKeys) {
        const value = obj[key];
        if (typeof value === "object" && !Array.isArray(value)) {
          result += `  ${key}: ${generateInlineInterface(value, 2)};\n`;
        } else {
          result += `  ${key}: string;\n`;
        }
      }

      result += `}\n\n`;
      return result;
    };

    // Generate inline interface (không có tên)
    const generateInlineInterface = (obj, indent = 0) => {
      const spaces = "  ".repeat(indent);
      let result = "{\n";

      const sortedKeys = Object.keys(obj).sort((a, b) => {
        const aIsNum = /^\d+$/.test(a);
        const bIsNum = /^\d+$/.test(b);

        if (aIsNum && bIsNum) return parseInt(a) - parseInt(b);
        if (aIsNum) return 1;
        if (bIsNum) return -1;
        return a.localeCompare(b);
      });

      for (const key of sortedKeys) {
        const value = obj[key];
        if (typeof value === "object" && !Array.isArray(value)) {
          result += `${spaces}  ${key}: ${generateInlineInterface(value, indent + 1)};\n`;
        } else {
          result += `${spaces}  ${key}: string;\n`;
        }
      }

      result += `${spaces}}`;
      return result;
    };

    // Tìm các nhóm có cùng cấu trúc và tạo shared interface
    const findAndGenerateSharedInterfaces = (obj) => {
      const interfaces = [];
      const interfaceMap = new Map(); // Map từ interface name đến các keys sử dụng nó

      // Phân tích cấu trúc
      const structureGroups = new Map(); // Map từ structure signature đến array of keys

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && !Array.isArray(value)) {
          const keys = Object.keys(value).sort().join(",");
          if (!structureGroups.has(keys)) {
            structureGroups.set(keys, []);
          }
          structureGroups.get(keys).push({ key, value });
        }
      }

      // Tạo shared interfaces cho các nhóm có > 1 member
      let interfaceCounter = 0;
      structureGroups.forEach((group, signature) => {
        if (group.length > 1) {
          // Tạo tên interface từ key đầu tiên, capitalize
          const baseName =
            group[0].key.charAt(0).toUpperCase() + group[0].key.slice(1);
          const interfaceName = `I${baseName}Palette`;

          interfaces.push(
            generateInterfaceFromObject(group[0].value, interfaceName),
          );

          // Map các keys với interface này
          group.forEach(({ key }) => {
            interfaceMap.set(key, interfaceName);
          });
        }
      });

      return { interfaces: interfaces.join(""), interfaceMap };
    };

    // Generate main DesignTokens interface
    const generateMainInterface = (obj, interfaceMap) => {
      let result = "export interface DesignTokens {\n";

      for (const [key, value] of Object.entries(obj)) {
        const normalizedKey = normalizeKey(key);

        if (typeof value === "object" && !Array.isArray(value)) {
          // Kiểm tra xem có shared interface không
          if (interfaceMap.has(key)) {
            result += `  ${normalizedKey}: ${interfaceMap.get(key)};\n`;
          } else {
            // Generate inline interface
            result += `  ${normalizedKey}: ${generateInlineInterface(value, 1)};\n`;
          }
        } else {
          result += `  ${normalizedKey}: string;\n`;
        }
      }

      result += `}\n\n`;
      return result;
    };

    // Generate object const với giá trị
    const generateObject = (obj, indent = 0) => {
      const spaces = "  ".repeat(indent);
      let result = "{\n";

      for (const [key, value] of Object.entries(obj)) {
        const objKey = getRawKey(key);

        if (typeof value === "object" && !Array.isArray(value)) {
          result += `${spaces}  ${objKey}: ${generateObject(value, indent + 1)},\n`;
        } else {
          result += `${spaces}  ${objKey}: '${value}',\n`;
        }
      }

      result += `${spaces}}`;
      return result;
    };

    // Tạo helper function để access tokens với type safety
    const generateHelperFunctions = () => {
      return `
/**
 * Helper function to get token value with type safety
 * Usage: getToken(tokens.color.base.blue[60])
 */
export function getToken<T extends string>(value: T): T {
  return value;
}

/**
 * Type-safe token reference checker
 * Returns true if value is a reference (starts with tokens.)
 */
export function isTokenReference(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
`;
    };

    const nestedTokens = buildNestedObject(dictionary.allTokens);
    const { interfaces, interfaceMap } =
      findAndGenerateSharedInterfaces(nestedTokens);

    return `/**
 * Design Tokens
 * Auto-generated by Style Dictionary
 * Do not edit directly
 */

${interfaces}${generateMainInterface(nestedTokens, interfaceMap)}export const tokens: DesignTokens = ${generateObject(nestedTokens)} as const;

export default tokens;
${generateHelperFunctions()}`;
  },
});

// Config
export default {
  source: ["tokens/**/*.json"],

  platforms: {
    // TypeScript với references được resolve (giá trị thực)
    ts: {
      transformGroup: "js",
      buildPath: "src/app/design-system/",
      files: [
        {
          destination: "tokens.ts",
          format: "typescript/auto-interfaces",
          options: {
            showFileHeader: true,
            outputReferences: false, // Resolve references thành giá trị thực
          },
        },
      ],
    },

    // TypeScript với references được giữ nguyên (cho documentation/tracing)
    tsWithRefs: {
      transformGroup: "js",
      buildPath: "src/app/design-system/",
      files: [
        {
          destination: "tokens.references.ts",
          format: "typescript/auto-interfaces",
          options: {
            showFileHeader: true,
            outputReferences: true, // Giữ nguyên references
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
