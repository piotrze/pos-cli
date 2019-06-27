const archiver = require('archiver-promise'),
  fs = require('fs'),
  glob = require('glob'),
  shell = require('shelljs'),
  templates = require('../templates'),
  settings = require('../settings');
const APP_DIR = 'app';
const LEGACY_APP_DIR = 'marketplace_builder';
const MODULES_DIR = 'modules';
const app_directory = fs.existsSync(APP_DIR) ? APP_DIR : LEGACY_APP_DIR;

const addModulesToArchive = archive => {
  if (!fs.existsSync(MODULES_DIR)) return true;

  const modules = glob.sync('*/', { cwd: MODULES_DIR });
  for (const module of modules) {
    addModuleToArchive(module, archive);
  }
};

const publicAssetsSameAsPrivate = (file, files) => {
  return file.startsWith('public/assets') && files.includes(file.replace(/public/, 'private'));
};

const addModuleToArchive = (module, archive, pattern = '?(public|private)/assets/**') => {
  const files = glob.sync(pattern, { cwd: `${MODULES_DIR}/${module}`, nodir: true });
  for (const f of files) {
    if (publicAssetsSameAsPrivate(f, files)) continue;

    const path = `${MODULES_DIR}/${module}/${f}`;
    const pathInArchive = path.replace(/(public|private)\/assets\//, '');
    archive.append(templates.fillInTemplateValues(path, settings.loadSettingsFileForModule(module)), { name: pathInArchive });
  }
};

const prepareDestination = (path) => {
  shell.mkdir('-p', 'tmp');
  shell.rm('-rf', path);
};

const packAssets = async path => {
  prepareDestination(path);
  const assetsArchive = archiver(path, { zlib: { level: 6 }, store: true });
  assetsArchive.glob('**/**', { cwd: `${app_directory}/assets` });
  addModulesToArchive(assetsArchive);
  return assetsArchive.finalize();
};

module.exports = packAssets;