import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  // @ts-expect-error patching fetch
  globalThis.fetch = updatedFetch;
}

// Use Vite's glob to load routes, bundled correctly in production and dynamically in dev
const routeModules = import.meta.glob('../src/app/api/**/route.{js,ts,jsx,tsx}', { eager: false });

// Import and register all routes
async function registerRoutes() {
  const routeEntries = Object.entries(routeModules);
  
  // Clear existing routes
  api.routes = [];
  
  // To match the previous logic of sorting by path length 
  const sortedRoutes = routeEntries.sort(([keyA], [keyB]) => {
     return keyB.length - keyA.length;
  });

  for (const [routeFile, importRoute] of sortedRoutes) {
    try {
      // In dev we lazy load, in prod we also lazy load? Yes import() dynamically.
      const route: any = await importRoute();

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        try {
          if (route[method]) {
            // e.g. "../src/app/api/foo/route.ts" -> "/foo/route.ts" -> "/foo"
            let relativePath = routeFile.replace('../src/app/api', '');
            if (relativePath === routeFile) {
               relativePath = routeFile.replace(/^\/src\/app\/api/, '');
            }
            const parts = relativePath.split('/').filter(Boolean);
            const routeParts = parts.slice(0, -1); // Remove 'route.js'
            
            let transformedParts = [];
            if (routeParts.length === 0) {
              transformedParts = [{ name: 'root', pattern: '' }];
            } else {
              transformedParts = routeParts.map((segment) => {
                const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
                if (match) {
                  const [_, dots, param] = match;
                  return dots === '...'
                    ? { name: param, pattern: `:${param}{.+}` }
                    : { name: param, pattern: `:${param}` };
                }
                return { name: segment, pattern: segment };
              });
            }

            const honoPath = `/${transformedParts.map(({ pattern }) => pattern).join('/')}`;
            const handler: Handler = async (c) => {
              const params = c.req.param();
              if (import.meta.env.DEV) {
                 // In DEV Vite should bust the cache if we add query params
                 // Note: requires vite-ignore for dynamic dynamic import
                 const updatedRoute = await import(/* @vite-ignore */ `${routeFile}?update=${Date.now()}`);
                 return await updatedRoute[method](c.req.raw, { params });
              }
              // Normal production handler
              return await route[method](c.req.raw, { params });
            };

            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get': api.get(honoPath, handler); break;
              case 'post': api.post(honoPath, handler); break;
              case 'put': api.put(honoPath, handler); break;
              case 'delete': api.delete(honoPath, handler); break;
              case 'patch': api.patch(honoPath, handler); break;
              default: console.warn(`Unsupported method: ${method}`); break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
       console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
}

// Initial route registration
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME };
