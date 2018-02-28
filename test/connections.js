const mongoose = require('../src/mongoose');
const models = require('../src/models');

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
]);



const disconnect = () => Promise.all([
  new Promise((resolve, reject) => {
    mongoose.connection.on('disconnected', resolve);
    mongoose.disconnect((err) => {
      if (err) reject(err);
    });
  }),
]);

before(async function() {
  await connect();
});

after(async function() {
  await indexes;
  await disconnect();
});
