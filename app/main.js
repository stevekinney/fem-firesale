const { app, BrowserWindow, dialog, Menu } = require('electron');
const fs = require('fs');

const windows = new Set();
const openFiles = new Map();

app.on('will-finish-launching', () => {
  app.on('open-file', (event, file) => {
    event.preventDefault();
    createWindow(file);
  });
});

app.on('ready', () => {
  Menu.setApplicationMenu(require('./lib/application-menu'));
  createWindow();
});

const createWindow = exports.createWindow = (file) => {
  let newWindow = new BrowserWindow({ show: false });
  windows.add(newWindow);

  newWindow.loadURL(`file://${__dirname}/index.html`);

  newWindow.once('ready-to-show', () => {
    if (file) openFile(newWindow, file);
    newWindow.show();
  });

  newWindow.on('close', (event) => {
    if (newWindow.isDocumentEdited()) {
      event.preventDefault();

      const result = dialog.showMessageBox(newWindow, {
        type: 'warning',
        title: 'Quit with Unsaved Changes?',
        message: 'Your changes will be lost permanently if you do not save.',
        buttons: [
          'Quit Anyway',
          'Cancel',
        ],
        cancelId: 1,
        defaultId: 0
      });

      if (result === 0) newWindow.destroy();
    }
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    stopWatchingFile(newWindow);
    newWindow = null;
  });

  return newWindow;
};

const getFileFromUserSelection = exports.getFileFromUserSelection = (win) => {
  const files = dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });

  if (!files) return;

  return files[0];
};

const openFile = exports.openFile = (win, file = getFileFromUserSelection(win)) => {
  const content = fs.readFileSync(file).toString();
  startWatchingFile(win, file);

  app.addRecentDocument(file);

  win.webContents.send('file-opened', file, content);
  win.setRepresentedFilename(file);
};

const startWatchingFile = (win, file) => {
  stopWatchingFile(win);

  const watcher = fs.watch(file, (event) => {
    if (event === 'change') {
      const content = fs.readFileSync(file);
      win.webContents.send('file-changed', file, content);
    }
  });

  openFiles.set(win, watcher);
};

const stopWatchingFile = (win) => {
  if (openFiles.has(win)) {
    openFiles.get(win).close();
    openFiles.delete(win);
  }
};
