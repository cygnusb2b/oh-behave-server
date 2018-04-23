const { Router } = require('express');
const helmet = require('helmet');
const slug = require('slug');
const Property = require('../models/property');
const ContentQuery = require('../models/content-query');
const ContentQueryResult = require('../models/content-query-result');
const ContentQueryResultRow = require('../models/content-query-result-row');
const Auth = require('../classes/auth');
const UserRepo = require('../repos/user');

const router = Router();
router.use(helmet.noCache());

const handleAsync = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/:resultId', handleAsync(async (req, res) => {
  const { bearer } = req.query;
  const { resultId } = req.params;
  if (!bearer) throw new Error('No bearer found.');

  const { user, session } = await UserRepo.retrieveSession(bearer);
  const auth = new Auth({ user, session });
  auth.check();

  // @todo Add download history for the current user.

  const result = await ContentQueryResult.findOne({ _id: resultId });
  if (!result) throw new Error(`No query result found for ID '${resultId}'`);

  const query = await ContentQuery.findOne({ _id: result.queryId });
  const property = await Property.findOne({ _id: query.propertyId });

  const fileParts = [
    slug(property.name, { lower: true }),
    slug(query.name, { lower: true }),
    slug(result.shortName, { lower: true }),
    result.shortId,
  ];

  const lines = [];

  lines.push(`"Property","${property.name}"`);
  lines.push(`"Query","${query.name}"`);
  lines.push(`"Date Range","${result.shortName}"`);
  lines.push(`"Result ID","${result.shortId}"`);

  lines.push('');

  lines.push('"Email Address"');
  const rows = await ContentQueryResultRow.find({ resultId }).sort({ email: 1 });
  rows.map(row => `"${row.email}"`).forEach(email => lines.push(email));

  const csv = lines.join('\n');
  res.attachment(`${fileParts.join('.')}.csv`);
  res.send(csv);
}));

module.exports = router;
