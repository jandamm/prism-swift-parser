const fs = require('fs');
const Prism = require('node-prismjs');
const path = require('path');
const iDir = process.argv[2];
const oDir = process.argv[3];

function highlight(lang, sourceCode) {
  const language = Prism.languages[lang] || Prism.languages.autoit;
  return Prism.highlight(sourceCode, language);
};

// Replaces all occurences of a string in a string
function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, 'g'), replacement);
}

// Replaces all html escapes to be compatible with highligh.js 
function replaceHtmlEscapingChars(string) {
  let output = string;
  output = replaceAll(string, '&lt;', '<');
  output = replaceAll(output, '&gt;', '>');
  output = replaceAll(output, '&amp;', '&');
  output = replaceAll(output, '&quot;', '"');
  output = replaceAll(output, '&euro;', '€');
  output = replaceAll(output, '&OElig;', 'Œ');
  output = replaceAll(output, '&oelig;', 'œ');
  return output;
}

// Returns true if the file is .htm or .html
function isHtml(filename) {
  return filename.slice(-5) === '.html' || filename.slice(-4) === '.htm';
}

// Creates a Directory if none exists
function createDir(dir) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

// Constants
const preCode = '<pre><code class="language-';
const postCode = '</code></pre>';


// Interprets a fileContent using hljs. 
function interpretFile(fileContent) {
  let fileParts = fileContent.split(preCode);

  let result = fileParts.shift();

  fileParts.forEach((filePart) => {
    const idx = filePart.indexOf('"');
    const parts = filePart.slice(idx + 2).split(postCode);

    const lang = filePart.slice(0, idx);
    const code = replaceHtmlEscapingChars(parts[0]);
    const text = parts[1];

    const block = highlight(lang, code);

    result += `${preCode + lang}">${block + postCode + text}`;
  });

  return result;
}

// Interprets every .html file using hljs. 
function interpretDir(dir, into) {
  const files = fs.readdirSync(dir).filter(isHtml);

  if (files.length > 0) {
    createDir(into)

    files.forEach((fileName) => {
      const filePath = path.join(dir, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const result = interpretFile(fileContent);

      const idx = fileName.lastIndexOf(".");
      const name = `${fileName.slice(0, idx)}__test__${fileName.slice(idx)}`;

      const outPath = path.join(into, name);
      fs.writeFileSync(outPath, result);
    });
  }
}

interpretDir(iDir, oDir);
