const { ipcRenderer, remote, shell } = require('electron');
const { dialog } = remote;
const { createWindow, openFile } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const marked = require('marked');

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInEditorButton = document.querySelector('#open-in-editor');

openInEditorButton.addEventListener('click', () => {
  shell.openItem(filePath);
});

showFileButton.addEventListener('click', () => {
  shell.showItemInFolder(filePath);
});

let filePath = null;
let originalContent = '';

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateEditedState = (isEdited) => {
  currentWindow.setDocumentEdited(isEdited);
  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;

  let title = 'Fire Sale';
  if (filePath) title = `${filePath} - ${title}`;
  if (isEdited) title = `${title} (Edited)`;
  currentWindow.setTitle(title);
};

markdownView.addEventListener('keyup', (event) => {
  const content = event.target.value;
  renderMarkdownToHtml(content);
  updateEditedState(content !== originalContent);
});

newFileButton.addEventListener('click', () => {
  createWindow();
});

openFileButton.addEventListener('click', () => {
  openFile(currentWindow);
});

revertButton.addEventListener('click', () => {
  markdownView.value = originalContent;
  renderMarkdownToHtml(originalContent);
  updateEditedState(false);
});

ipcRenderer.on('file-opened', (event, file, content) => {
  filePath = file;
  originalContent = content;

  updateEditedState(false);

  markdownView.value = content;
  renderMarkdownToHtml(content);

  openInEditorButton.disabled = false;
  showFileButton.disabled = false;
});

ipcRenderer.on('file-changed', (event, file, content) => {
  const result = dialog.showMessageBox(currentWindow, {
    type: 'warning',
    title: 'Overwrite Current Unsaved Changes?',
    message: 'The contents of this file have changed on the file system. Would you like to load the new contents?',
    buttons: [
      'Yes',
      'Cancel',
    ],
    cancelId: 1,
    defaultId: 0
  });

  if (result === 0) { openFile(currentWindow, file); }
});

document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());
