const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const windows = new Set();

app.on('ready', () => {
  createWindow();
});

const createWindow = exports.createWindow = () => {
  let newWindow = new BrowserWindow({ show: false });
  windows.add(newWindow);

  newWindow.loadURL(`file://${__dirname}/index.html`);

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
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

const openFile = exports.openFile = (win, file) => {
  const f = file || getFileFromUserSelection(win);
  const content = fs.readFileSync(f).toString();
  win.webContents.send('file-opened', file, content);
};
