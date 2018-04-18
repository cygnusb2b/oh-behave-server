const escapeRegex = require('escape-string-regexp');
const db = require('./db');

const baseVersions = ['3', '4'];

const supportsVersion = v => baseVersions.includes(v);

const validateKey = (key) => {
  if (!key) throw new Error('No property key was provided.');
  return true;
};

const validateVersion = (v) => {
  if (!supportsVersion(v)) {
    throw new Error(`The provided Base version of '${v}' is not supported.`);
  }
  return true;
};

const validate = (key, version) => {
  validateKey(key);
  validateVersion(version);
  return true;
};

const getBaseConn = (key, version) => {
  validate(key, version);
  if (version === '4') return db.platform;
  return db.legacy;
};

const getBaseDbName = (key, version) => {
  validate(key, version);
  if (version === '4') return `${key}_platform`;
  return `base_${key}`;
};

const getTaxonomyCollection = (key, version) => {
  const dbName = getBaseDbName(key, version);
  return getBaseConn(key, version).collection(dbName, 'Taxonomy');
};

const getContentCollection = (key, version) => {
  const dbName = getBaseDbName(key, version);
  return getBaseConn(key, version).collection(dbName, 'Content');
};

const getSectionCollection = (key, version) => {
  validate(key, version);
  const dbName = (version === '4') ? `${key}_website` : getBaseDbName(key, version);
  return getBaseConn(key, version).collection(dbName, 'Section');
};

const searchRegex = (phrase, type) => {
  let prefix = '';
  let suffix = '';
  if (type === 'starts' || type === 'exact') prefix = '^';
  if (type === 'exact') suffix = '$';
  return new RegExp(`${prefix}${escapeRegex(phrase)}${suffix}`, 'i');
};

module.exports = {
  getTaxonomyCollection,
  getContentCollection,
  getSectionCollection,
  searchRegex,
};
