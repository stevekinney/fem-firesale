const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

let windows = [];

app.on('ready', () => {
  createWindow();
  require('devtron').install();
});

const createWindow = () => {
  const newWindow = new BrowserWindow();
  windows.push(newWindow);

  newWindow.loadURL(`file://${__dirname}/index.html`);

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  newWindow.on('closed', () => {
    windows = windows.filter(w => w !== newWindow);
    newWindow = null;
  });

  return newWindow;
};

const showOpenFileDialog = exports.showOpenFileDialog = (win) => {
  const files = dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });

  if (!files) return;

  openFile(files[0], win);
};

const openFile = (file, win) => {
  const content = fs.readFileSync(file).toString();
  win.webContents.send('file-opened', file, content);
};
