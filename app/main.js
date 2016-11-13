const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const windows = new Set();

app.on('will-finish-launching', () => {
  app.on('open-file', (event, file) => {
    event.preventDefault();
    createWindow(file);
  });
});

app.on('ready', () => {
  createWindow();
  require('devtron').install();
});

const createWindow = exports.createWindow = (file) => {
  let newWindow = new BrowserWindow({ show: false });
  windows.add(newWindow, null);

  newWindow.loadURL(`file://${__dirname}/index.html`);

  newWindow.once('ready-to-show', () => {
    if (file) openFile(newWindow, file);
    newWindow.show();
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    newWindow = null;
  });

  return newWindow;
};

const getFileFromUserInput = (win) => {
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

const openFile = exports.openFile = (win, file) => {
  if (!file) file = getFileFromUserInput(win);

  const content = fs.readFileSync(file).toString();

  app.addRecentDocument(file);
  win.webContents.send('file-opened', file, content);
};

const saveMarkdown = exports.saveMarkdown = (win, file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(win, {
      title: 'Save Markdown',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] }
      ]
    });
  }

  if (!file) return;

  fs.writeFileSync(file, content);
  win.webContents.send('file-opened', file, content);
};

const saveHTML = exports.saveHTML = (win, content) => {
  let file = dialog.showSaveDialog(win, {
    title: 'Save Markdown',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'HTML Files', extensions: ['html'] }
    ]
  });

  if (!file) return;

  fs.writeFileSync(file, content);
};
