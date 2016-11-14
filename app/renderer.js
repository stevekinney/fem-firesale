const { ipcRenderer, remote } = require('electron');
const { createWindow, openFile } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const marked = require('marked');

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', (event) => {
  renderMarkdownToHtml(event.target.value);
});

newFileButton.addEventListener('click', () => {
  createWindow();
});

openFileButton.addEventListener('click', () => {
  openFile(currentWindow);
});

ipcRenderer.on('file-opened', (event, file, content) => {
  markdownView.textContent = content;
  renderMarkdownToHtml(content);
});
