import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      '@azure/communication-react': path.resolve(__dirname, '../../packages/communication-react/src'),
      '@internal/react-components': path.resolve(__dirname, '../../packages/react-components/src'),
      '@internal/react-composites': path.resolve(__dirname, '../../packages/react-composites/src'),
      '@internal/chat-stateful-client': path.resolve(__dirname, '../../packages/chat-stateful-client/src'),
      '@internal/chat-component-bindings': path.resolve(__dirname, '../../packages/chat-component-bindings/src'),
      '@internal/calling-stateful-client': path.resolve(__dirname, '../../packages/calling-stateful-client/src'),
      '@internal/calling-component-bindings': path.resolve(__dirname, '../../packages/calling-component-bindings/src'),
      '@internal/acs-ui-common': path.resolve(__dirname, '../../packages/acs-ui-common/src')
    }
  },
  server: {
    hmr: {
      host: 'localhost',
      clientPort: 443
    }
  }
});
