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
