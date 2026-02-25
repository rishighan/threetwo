import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function iconifyPlugin() {
  const iconCache = new Map();
  const collections = new Map();

  function loadCollection(prefix) {
    if (collections.has(prefix)) {
      return collections.get(prefix);
    }

    try {
      const collectionPath = join(__dirname, 'node_modules', '@iconify-json', prefix, 'icons.json');
      const data = JSON.parse(readFileSync(collectionPath, 'utf8'));
      collections.set(prefix, data);
      return data;
    } catch (e) {
      return null;
    }
  }

  function getIconCSS(iconData, selector) {
    const { body, width, height } = iconData;
    const viewBox = `0 0 ${width || 24} ${height || 24}`;
    
    // Create SVG data URI
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
    return `${selector} {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-image: url("${dataUri}");
  mask-image: url("${dataUri}");
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}`;
  }

  return {
    name: 'vite-plugin-iconify',
    
    transform(code, id) {
      // Only process files that might contain icon classes
      if (!id.endsWith('.tsx') && !id.endsWith('.jsx') && !id.endsWith('.ts') && !id.endsWith('.js')) {
        return null;
      }

      // Find all icon-[...] patterns
      const iconPattern = /icon-\[([^\]]+)\]/g;
      const matches = [...code.matchAll(iconPattern)];
      
      if (matches.length === 0) {
        return null;
      }

      // Extract unique icons
      const icons = new Set(matches.map(m => m[1]));
      
      // Generate CSS for each icon
      for (const iconName of icons) {
        if (iconCache.has(iconName)) {
          continue;
        }

        try {
          // Parse icon name (e.g., "solar--add-square-bold-duotone")
          const parts = iconName.split('--');
          if (parts.length !== 2) continue;
          
          const [prefix, name] = parts;
          
          // Load collection
          const collection = loadCollection(prefix);
          if (!collection || !collection.icons || !collection.icons[name]) {
            continue;
          }
          
          // Get icon data
          const iconData = collection.icons[name];
          
          // Generate CSS
          const selector = `.icon-\\[${iconName}\\]`;
          const iconCSS = getIconCSS(iconData, selector);
          
          iconCache.set(iconName, iconCSS);
        } catch (e) {
          // Silently skip failed icons
        }
      }

      return null;
    },

    resolveId(id) {
      if (id === '/@iconify-css') {
        return id;
      }
    },

    load(id) {
      if (id === '/@iconify-css') {
        const allCSS = Array.from(iconCache.values()).join('\n');
        return allCSS;
      }
    },
    
    transformIndexHtml() {
      // Inject icon CSS into HTML
      const allCSS = Array.from(iconCache.values()).join('\n');
      if (allCSS) {
        return [
          {
            tag: 'style',
            attrs: { type: 'text/css' },
            children: allCSS,
            injectTo: 'head'
          }
        ];
      }
    }
  };
}
