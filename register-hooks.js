import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  // 1. Intercept Sequelize's ConnectionManager prototype
  const ConnectionManager = require('sequelize/lib/dialects/mysql/connection-manager');
  
  if (ConnectionManager && ConnectionManager.prototype) {
    const originalDisconnect = ConnectionManager.prototype.disconnect;
    
    ConnectionManager.prototype.disconnect = function (connection) {
      // 2. Prevent the '_ended' crash by mocking the missing internal protocol object
      if (connection && !connection._protocol) {
        connection._protocol = { _ended: false };
      }
      return originalDisconnect.call(this, connection);
    };
    console.log('🤖 AI Patch: Sequelize _ended crash protection injected successfully.');
  }
} catch (e) {
  console.warn('⚠️ AI Patch: Could not automatically patch Sequelize connection manager.', e.message);
}
