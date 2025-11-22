// Custom Vite plugin to handle importmaps
export default function importmapPlugin() {
  return {
    name: 'vite-plugin-importmap',
    resolveId(id) {
      // List of modules that should be loaded from CDN via importmap
      const cdnModules = [
        'react',
        'react-dom',
        'react-dom/client',
        'framer-motion',
        'lucide-react',
        'recharts',
        '@google/genai'
      ];

      if (cdnModules.some(mod => id === mod || id.startsWith(mod + '/'))) {
        // Mark as external - don't bundle, load from importmap
        return { id, external: true };
      }
    },
    transformIndexHtml(html) {
      // Ensure importmap is preserved in built HTML
      return html;
    }
  };
}
