import './polyfills.js';
import terminal from './terminal.js';

terminal(process.argv.slice(2)).run().catch(err => {
  console.error(err);
  process.exit(1);
});