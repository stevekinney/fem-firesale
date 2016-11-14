const { app, Menu } = require('electron');

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

module.exports = Menu.buildFromTemplate(template);
