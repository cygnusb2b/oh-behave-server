const { Router } = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { graphqlExpress } = require('apollo-server-express');
const passport = require('passport');
const Auth = require('../classes/auth');
const schema = require('../graph/schema');

const authenticate = (req, res, next) => {
  passport.authenticate('bearer', { session: false }, (err, { user, session } = {}) => {
    req.auth = new Auth({ user, session, err });
    next();
  })(req, res, next);
};

const router = Router();

router.use(
  helmet.noCache(),
  authenticate,
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    context: { auth: req.auth },
  })),
);

module.exports = router;
