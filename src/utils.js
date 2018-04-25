const escapeRegex = require('escape-string-regexp');
const { ObjectID } = require('mongodb');
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

const getLatestAnalyticsCollection = (key, version) => {
  validate(key, version);
  const dbName = version === '4' ? `oly_${key}_website_events` : `oly_${key}_events`;
  return db.analytics.collection(dbName, 'content');
};

const getArchiveAnalyticsCollection = (key) => {
  validateKey(key);
  return db.analytics.collection('content_traffic_archive', key);
};

const getRadixCollection = (key) => {
  validateKey(key);
  const dbName = `radix-${key.replace('_', '-')}`;
  return db.platform.collection(dbName, 'identity');
};

const getRadixEmailCollection = (key) => {
  validateKey(key);
  const dbName = `radix-${key.replace('_', '-')}`;
  return db.platform.collection(dbName, 'identity-account-email');
};

const getMerrickUserCollection = () => db.legacy.collection('merrick', 'users_v2');

const getComponentsIdentityCollection = (key) => {
  validateKey(key);
  const dbName = `${key}_platform`;
  return db.platform.collection(dbName, 'Identity');
};

const searchRegex = (phrase, type) => {
  let prefix = '';
  let suffix = '';
  if (type === 'starts' || type === 'exact') prefix = '^';
  if (type === 'exact') suffix = '$';
  return new RegExp(`${prefix}${escapeRegex(phrase)}${suffix}`, 'i');
};

const isIdentifier = value => /^[0-9]{1,}$|^[0-9a-f]{24}$/.test(value);
const castId = (value) => {
  if (/^[0-9]{1,}$/.test(value)) return parseInt(value, 10);
  if (/^[0-9a-f]{24}$/.test(value)) return ObjectID(value);
  return value;
};


module.exports = {
  getTaxonomyCollection,
  getContentCollection,
  getSectionCollection,
  getLatestAnalyticsCollection,
  getRadixCollection,
  getRadixEmailCollection,
  getMerrickUserCollection,
  getComponentsIdentityCollection,
  getArchiveAnalyticsCollection,
  searchRegex,
  isIdentifier,
  castId,
};
