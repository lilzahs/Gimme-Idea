// Simple wrapper to start the server with forced output
console.log('Starting server wrapper...');
import('./src/server.ts')
  .then(() => {
    console.log('Server module loaded successfully');
  })
  .catch((error) => {
    console.error('Error loading server:', error);
    process.exit(1);
  });
