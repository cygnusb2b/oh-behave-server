const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const redis = require('../redis');

const { SESSION_GLOBAL_SECRET } = process.env;

module.exports = {
  prefixSession({ uid, method }) {
    return `session:${method}:${uid}`;
  },

  createSecret({ userSecret }) {
    return `${userSecret}.${SESSION_GLOBAL_SECRET}`;
  },

  async verify(token) {
    if (!token) throw new Error('Unable to verify session: no token was provided.');
    const parsed = await jwt.decode(token, { complete: true, force: true });
    if (!parsed) throw new Error('Unable to verify session: invalid token format.');

    const { uid, method } = parsed.payload;
    const session = await this.get({ uid, method });
    const secret = this.createSecret({ userSecret: session.s });

    const verified = jwt.verify(token, secret, { algorithms: ['HS256'] });

    // Return the public session.
    return {
      uid: verified.uid,
      method,
      cre: verified.iat,
      exp: verified.exp,
      token,
    };
  },

  async get({ uid, method }) {
    if (!uid) throw new Error('The user ID is required.');
    if (!method) throw new Error('The user session method is required.');

    const prefix = this.prefixSession({ uid, method });
    const result = await redis.getAsync(prefix);

    if (!result) throw new Error('Unable to get session: no session found in storage.');
    return Object(JSON.parse(result));
  },

  async set({ uid, method, expires }) {
    if (!uid) throw new Error('The user ID is required.');
    if (!method) throw new Error('The user session method is required.');

    let result;
    try {
      // Attempt to retrieve an existing session.
      result = await this.get({ uid, method });
    } catch (e) {
      if (e.message !== 'Unable to get session: no session found in storage.') {
        throw e;
      }
    }
    // No previous session found. Create new.
    if (!result) result = await this.create({ uid, method, expires });

    // Return the public session.
    return {
      uid: result.uid,
      method,
      cre: result.cre,
      exp: result.exp,
      token: result.token,
    };
  },

  delete({ uid, method }) {
    const prefix = this.prefixSession({ uid, method });
    return redis.delAsync(prefix);
  },

  async create({ uid, method, expires }) {
    if (!uid) throw new Error('The user ID is required.');
    if (!method) throw new Error('The user session method is required.');
    if (!expires) throw new Error('The user session expiration is required.');

    const prefix = this.prefixSession({ uid, method });

    const now = new Date();
    const iat = Math.floor(now.valueOf() / 1000);
    const exp = iat + Number(expires);

    const userSecret = await bcrypt.hash(uuidv4(), 5);
    const secret = this.createSecret({ userSecret });

    const token = jwt.sign({
      uid,
      method,
      exp,
      iat,
    }, secret);
    const session = {
      uid,
      cre: iat,
      exp,
      s: userSecret,
      token,
    };
    await redis.setexAsync(prefix, expires, JSON.stringify(session));
    return session;
  },
};
