const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');

const sharedDir = path.join(__dirname, '../../shared');
const serverSharedDir = path.join(__dirname, '../../server', 'shared');
const clientSharedDir = path.join(__dirname, '../../client/src/lib', 'shared');

// Copy function
function copyToDestinations(filePath) {
    const relativePath = path.relative(sharedDir, filePath);

    // Define the destination paths
    const serverDest = path.join(serverSharedDir, relativePath);
    const clientDest = path.join(clientSharedDir, relativePath);

    fs.copy(filePath, serverDest)
        .then(() => console.log(`Copied ${filePath} to ${serverDest}`))
        .catch(err => console.error(`Error copying to server: ${err.message}`));

    fs.copy(filePath, clientDest)
        .then(() => console.log(`Copied ${filePath} to ${clientDest}`))
        .catch(err => console.error(`Error copying to client: ${err.message}`));
}

// Watcher
chokidar.watch(sharedDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
}).on('add', copyToDestinations)
  .on('change', copyToDestinations)
  .on('unlink', (filePath) => {
    const relativePath = path.relative(sharedDir, filePath);
    const serverDest = path.join(serverSharedDir, relativePath);
    const clientDest = path.join(clientSharedDir, relativePath);

    fs.remove(serverDest).catch(err => console.error(`Error deleting from server: ${err.message}`));
    fs.remove(clientDest).catch(err => console.error(`Error deleting from client: ${err.message}`));
  });

console.log(`Watching for changes in ${sharedDir}...`);
