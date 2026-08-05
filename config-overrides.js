/**
 * Webpack Configuration Override for react-scripts
 * 
 * Purpose: Fix webpack-dev-server 5.2+ compatibility with react-scripts 5.0.1
 * 
 * Issue: webpack-dev-server 5.2+ changed several APIs:
 * - onAfterSetupMiddleware/onBeforeSetupMiddleware → setupMiddlewares
 * - https → server.type and server.options
 * - server.close() → server.stopCallback()
 * 
 * Solution: Map old API to new API for full compatibility
 */

module.exports = {
  webpack: function(config, env) {
    return config;
  },

  // react-app-rewired's `test` script does NOT read a standalone
  // jest.config.js at the project root -- react-scripts' own test runner
  // builds its Jest config programmatically and react-app-rewired only
  // lets you touch it through this `jest` hook. (A jest.config.js file
  // used to sit here uselessly: its transformIgnorePatterns override for
  // ESM-only d3 packages never took effect, which is why `npm test` broke
  // with "Unexpected token 'export'" on d3-transition's nested
  // d3-interpolate copy.)
  jest: function(config) {
    config.transformIgnorePatterns = [
      'node_modules/(?!(react-chrono|react-wordcloud|d3-.*)/)'
    ];
    // TimelineComponent's tests render the real (unmocked) react-chrono
    // library in jsdom, which doesn't implement layout APIs (e.g.
    // ResizeObserver, real getBoundingClientRect) react-chrono relies on --
    // it spins, consuming multiple GB of RAM, instead of failing cleanly.
    // SECURITY-VERIFICATION.md previously *claimed* this was already
    // excluded "due to memory constraints," but no exclusion actually
    // existed anywhere in the config. If react-chrono is mocked in this
    // test in the future, remove this line rather than leaving it stale.
    config.testPathIgnorePatterns = [
      ...(config.testPathIgnorePatterns || []),
      '/src/Components/TimelineComponent/TimelineComponent.test.tsx$'
    ];
    return config;
  },

  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      
      // Extract deprecated options
      const { 
        onBeforeSetupMiddleware, 
        onAfterSetupMiddleware, 
        https,
        ...rest 
      } = config;

      // Build new config
      const newConfig = {
        ...rest,
        
        // Map https option to new server option
        ...(https && {
          server: typeof https === 'boolean' 
            ? 'https' 
            : { type: 'https', options: https }
        }),
        
        // Map middleware setup to new API
        setupMiddlewares: (middlewares, devServer) => {
          if (onBeforeSetupMiddleware) {
            onBeforeSetupMiddleware(devServer);
          }

          if (onAfterSetupMiddleware) {
            onAfterSetupMiddleware(devServer);
          }

          return middlewares;
        },
        
        // Ensure onListening is called to set up the devServer reference properly
        onListening: function(devServer) {
          if (!devServer) {
            throw new Error('webpack-dev-server is not defined');
          }

          // Add close method compatibility for react-scripts
          if (!devServer.close && devServer.stopCallback) {
            devServer.close = devServer.stopCallback.bind(devServer);
          }

          // Call original onListening if it exists
          if (config.onListening) {
            config.onListening(devServer);
          }
        },
      };

      return newConfig;
    };
  },
};
