const { MongoClient } = require('mongodb');

class DBClient {
  constructor(dsn) {
    this.dsn = dsn;
    this.connected = false;
  }

  async db(name) {
    const client = await this.connect();
    return client.db(name);
  }

  async collection(dbName, name) {
    const db = await this.db(dbName);
    return db.collection(name);
  }

  async close(force) {
    if (this.promise) {
      await this.promise;
      await this.mongo.close(force);
    } else if (this.connected) {
      await this.mongo.close(force);
    }
  }

  async connect() {
    if (this.connected) return this.mongo;
    if (this.promise) {
      this.mongo = await this.promise;
      this.connected = true;
      this.promise = undefined;
      return this.mongo;
    }
    this.promise = MongoClient.connect(this.dsn);
    this.mongo = await this.promise;
    this.connected = true;
    this.promise = undefined;
    return this.mongo;
  }
}

module.exports = DBClient;
