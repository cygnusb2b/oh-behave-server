const mongoose = require('../src/mongoose');
const redis = require('../src/redis');
const models = require('../src/models');
const db = require('../src/db');

const clients = Object.keys(db).map(key => db[key]);

const index = Model => new Promise((resolve, reject) => {
  Model.on('index', (err) => {
    if (err) {
      reject(err)
    } else {
      resolve();
    }
  });
});

const indexes = Promise.all(Object.keys(models).map(name => index(models[name])));

const connect = () => Promise.all([
  new Promise((resolve, reject) => {
    mongoose.connection.on('connected', resolve);
    mongoose.connection.on('error', reject);
  }),
  Promise.all(clients.map(client => client.connect())),
  new Promise((resolve, reject) => {
    redis.on('connect', () => {
      resolve();
    });
    redis.on('error', (err) => {
      reject(err);
    });
  }),
]);



const disconnect = () => Promise.all([
  new Promise((resolve, reject) => {
    mongoose.connection.on('disconnected', resolve);
    mongoose.disconnect((err) => {
      if (err) reject(err);
    });
  }),
  Promise.all(clients.map(client => client.close())),
  new Promise((resolve, reject) => {
    redis.on('end', () => {
      resolve();
    });
    redis.on('error', (err) => {
      reject(err);
    });
    redis.quit();
  }),
]);

before(async function() {
  await connect();
});

after(async function() {
  await indexes;
  await disconnect();
});
