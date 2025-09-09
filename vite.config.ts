
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';
  import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
    plugins: [
      react(),
      // Image optimization in production builds only
      process.env.NODE_ENV === 'production' && viteImagemin({
        pngquant: { quality: [0.65, 0.8] },
        mozjpeg: { quality: 75 },
        webp: { quality: 75 }
      })
    ].filter(Boolean),
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/d4d954b8cb8a5c7b807046d49f7e09b0f80ca5d3.png': path.resolve(__dirname, './src/assets/d4d954b8cb8a5c7b807046d49f7e09b0f80ca5d3.png'),
        'figma:asset/d1e4a43dfd35275968d7a4b44aa8a93a79982faa.png': path.resolve(__dirname, './src/assets/d1e4a43dfd35275968d7a4b44aa8a93a79982faa.png'),
        'figma:asset/9407eaaf09bc0cd0735147c984706db31a71bf86.png': path.resolve(__dirname, './src/assets/9407eaaf09bc0cd0735147c984706db31a71bf86.png'),
        'figma:asset/6ac5fd2f59330fdd9f8b4e0196fdeb1e357e80e3.png': path.resolve(__dirname, './src/assets/6ac5fd2f59330fdd9f8b4e0196fdeb1e357e80e3.png'),
        'figma:asset/438350a0f5172f1ab210cb733df6869e0b9f8ef5.png': path.resolve(__dirname, './src/assets/438350a0f5172f1ab210cb733df6869e0b9f8ef5.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/features': path.resolve(__dirname, './src/features'),
        '@/app': path.resolve(__dirname, './src/app'),
      },
    },
    preview: {
      // Allow Railway preview domain
      allowedHosts: true,
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      // Optimize build performance
      sourcemap: false, // Disable sourcemaps for faster builds
      minify: 'esbuild', // Use esbuild for faster minification
      // Remove console.log in production
      esbuild: {
        drop: ['console', 'debugger'],
      },
      // Chunk size limits
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          // Improved chunk splitting strategy
          manualChunks(id) {
            // React and core libraries
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            
            // Router
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // UI library chunks
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // Icons and UI utilities
            if (id.includes('lucide-react') || id.includes('class-variance-authority') || 
                id.includes('clsx') || id.includes('tailwind-merge') || id.includes('cmdk') ||
                id.includes('vaul') || id.includes('sonner')) {
              return 'ui-utils';
            }
            
            // React Query and forms
            if (id.includes('@tanstack/react-query') || id.includes('react-hook-form') ||
                id.includes('react-day-picker') || id.includes('input-otp')) {
              return 'forms-data';
            }
            
            // Virtualization
            if (id.includes('react-window')) {
              return 'virtualization';
            }
            
            // Charts
            if (id.includes('recharts')) {
              return 'charts';
            }
            
            // Other specialized libraries
            if (id.includes('embla-carousel')) return 'carousel';
            if (id.includes('react-resizable-panels')) return 'panels';
            if (id.includes('react-intersection-observer')) return 'intersection';
            if (id.includes('next-themes')) return 'themes';
            
            // All other node_modules into vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          
          // Optimize chunk size and naming
          chunkFileNames: (chunkInfo) => {
            const id = chunkInfo.name?.replace(/[\[\]]/g, '');
            return `assets/${id}-[hash].js`;
          }
        }
      }
    },
    server: {
      port: 3008,
      open: true,
      proxy: {
        '/api': {
          target: 'https://cvety.kz',
          changeOrigin: true,
          secure: true,
          followRedirects: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔧 Proxying API request to production:', req.method, req.url);
            });
          }
        }
      }
    },
  });
