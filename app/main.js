const { app, BrowserWindow, dialog, Menu } = require('electron');
const fs = require('fs');

const windows = new Set();
const fileWatchers = new Map();

app.on('will-finish-launching', () => {
  app.on('open-file', (event, file) => {
    event.preventDefault();
    createWindow(file);
  });
});

app.on('ready', () => {
  createWindow();

  const applicationMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(applicationMenu);

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
    stopWatchingFile(newWindow);

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
  startWatchingFile(win, file);

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

const startWatchingFile = (win, file) => {
  stopWatchingFile(win);

  const watcher = fs.watch(file, (event) => {
    if (event === 'change') { openFile(win, file); }
  });

  fileWatchers.set(win, watcher);
};

const stopWatchingFile = (win) => {
  if (fileWatchers.has(win)) {
    fileWatchers.get(win).close();
    fileWatchers.delete(win);
  }
};

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CommandOrControl+N',
        click(item, focusedWindow) {
          createWindow();
        },
      },
      {
        label: 'Open File',
        accelerator: 'CommandOrControl+O',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('open-file');
        },
      },
      {
        label: 'Save Markdown',
        accelerator: 'CommandOrControl+S',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('save-markdown');
        },
      },
      {
        label: 'Export HTML',
        accelerator: 'Shift+CommandOrControl+S',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('export-html');
        },
      },
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CommandOrControl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CommandOrControl+Z',
        role: 'redo',
      },
      { type: 'separator' },
      {
        label: 'Cut',
        accelerator: 'CommandOrControl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CommandOrControl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CommandOrControl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CommandOrControl+A',
        role: 'selectall',
      },
    ],
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CommandOrControl+M',
        role: 'minimize',
      },
      {
        label: 'Close',
        accelerator: 'CommandOrControl+W',
        role: 'close',
      },
    ],
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      }
    ],
  },
];

if (process.platform === 'darwin') {
  const name = 'Fire Sale';
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: 'about',
      },
      { type: 'separator' },
      {
        label: 'Services',
        role: 'services',
        submenu: [],
      },
      { type: 'separator' },
      {
        label: `Hide ${name}`,
        accelerator: 'Command+H',
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers',
      },
      {
        label: 'Show All',
        role: 'unhide',
      },
      { type: 'separator' },
      {
        label: `Quit ${name}`,
        accelerator: 'Command+Q',
        click() { app.quit(); },
      }
    ],
  });

  const windowMenu = template.find(item => item.label === 'Window');
  windowMenu.submenu.push(
    { type: 'separator' },
    {
      label: 'Bring All to Front',
      role: 'front',
    }
  );
}
