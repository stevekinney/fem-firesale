const { ipcRenderer, remote } = require('electron');
const currentWindow = remote.getCurrentWindow();

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

openFileButton.addEventListener('click', () => {
  openFile(currentWindow);
});

saveMarkdownButton.addEventListener('click', () => {
  saveMarkdown(currentWindow, filePath, markdownView.value);
});

revertButton.addEventListener('click', () => {
  markdownView.value = originalContent;
  renderMarkdownToHtml(originalContent);
});

saveHtmlButton.addEventListener('click', () => {
  saveHTML(currentWindow, htmlView.innerHTML);
});

ipcRenderer.on('file-opened', (event, file, content) => {
  filePath = file;
  originalContent = content;

  currentWindow.setRepresentedFilename(filePath);
  setAsEdited(false, filePath);

  markdownView.value = content;
  renderMarkdownToHtml(content);
});
