import { copyFile } from 'node:fs/promises';

// GitHub Pages serves 404.html for any path a static host can't match, so the
// SPA can boot on deep links such as /batting and let React Router render the
// right page. Copying index.html keeps the two in sync on every build.
const dist = new URL('../dist/', import.meta.url);

await copyFile(new URL('index.html', dist), new URL('404.html', dist));
console.log('Copied dist/index.html to dist/404.html');
