const { ipcRenderer, remote } = require('electron');
const { showOpenFileDialog } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const marked = require('marked');

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const openFileButton = document.querySelector('#open-file');

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', (event) => {
  renderMarkdownToHtml(event.target.value);
});

openFileButton.addEventListener('click', () => {
  showOpenFileDialog(currentWindow);
});

ipcRenderer.on('file-opened', (event, file, content) => {
  markdownView.textContent = content;
  renderMarkdownToHtml(content);
});
