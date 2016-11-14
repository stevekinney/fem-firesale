const { ipcRenderer, remote } = require('electron');
const currentWindow = remote.getCurrentWindow();
const { Menu } = remote;

const {
  openFile,
  createWindow,
  saveMarkdown,
  saveHTML
} = remote.require('./main');

const marked = require('marked');

let filePath = null;
let originalContent = '';

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', (event) => {
  renderMarkdownToHtml(event.target.value);
  setAsEdited(event.target.value !== originalContent, filePath);
});

const setAsEdited = (isEdited, filePath) => {
  const title = filePath || 'Untitled';

  if (isEdited) {
    currentWindow.setDocumentEdited(true);
    currentWindow.setTitle(`${title} - Fire Sale (Edited)`);
    saveMarkdownButton.disabled = false;
    revertButton.disabled = false;
  } else {
    currentWindow.setDocumentEdited(false);
    currentWindow.setTitle(`${title} - Fire Sale`);
    saveMarkdownButton.disabled = true;
    revertButton.disabled = true;
  }
};

newFileButton.addEventListener('click', () => {
  createWindow();
});

const onOpenFile = () => {
  openFile(currentWindow);
};

openFileButton.addEventListener('click', onOpenFile);
ipcRenderer.on('open-file', onOpenFile);

const onSaveMarkdown = () => {
  saveMarkdown(currentWindow, filePath, markdownView.value);
};

saveMarkdownButton.addEventListener('click', onSaveMarkdown);
ipcRenderer.on('save-markdown', onSaveMarkdown);

revertButton.addEventListener('click', () => {
  markdownView.value = originalContent;
  renderMarkdownToHtml(originalContent);
});

const onSaveHtml = () => {
  saveHTML(currentWindow, htmlView.innerHTML);
};

saveHtmlButton.addEventListener('click', onSaveHtml);
ipcRenderer.on('save-html', onSaveHtml);

ipcRenderer.on('file-opened', (event, file, content) => {
  filePath = file;
  originalContent = content;

  currentWindow.setRepresentedFilename(filePath);
  setAsEdited(false, filePath);

  markdownView.value = content;
  renderMarkdownToHtml(content);
});

document.addEventListener('dragover', () => false);
document.addEventListener('dragleave', () => false);
document.addEventListener('drop', () => false);

const getDraggedFile = (event) => event.dataTransfer.files[0];

const fileTypeIsSupported = (file) => {
  return ['text/plain', 'text/markdown'].includes(file.type);
};

markdownView.addEventListener('dragover', (event) => {
  const file = getDraggedFile(event);

  if (fileTypeIsSupported(file)) {
    markdownView.classList.add('drag-over');
  } else {
    markdownView.classList.add('drag-error');
  }
});

markdownView.addEventListener('dragleave', () => {
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('drop', (event) => {
  event.preventDefault();

  const file = getDraggedFile(event);

  if (fileTypeIsSupported(file)) {
    openFile(currentWindow, file.path);
  } else {
    alert('That file type is not supported');
  }

  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');

  return false;
});

const markdownContextMenu = Menu.buildFromTemplate([
  { label: 'Open File', click() { openFile(); } },
  { label: 'Save Markdown', click() { onSaveMarkdown(); } },
  { type: 'separator' },
  { label: 'Cut', role: 'cut' },
  { label: 'Copy', role: 'copy' },
  { label: 'Paste', role: 'paste' },
  { label: 'Select All', role: 'selectall' },
]);

markdownView.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  markdownContextMenu.popup();
});

const htmlContextMenu = Menu.buildFromTemplate([
  { label: 'Export HTML', click() { onSaveHtml(); } },
  {
    label: 'Copy HTML to Clipboard',
    click() { require('electron').clipboard.writeText(htmlView.innerHTML); }
  }
]);

htmlView.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  htmlContextMenu.popup();
});
