const repository = require('./firma-repository');
const bl = require('../../utils/bl');

async function get(req, res, next) {
  try {
    const firmaId = bl.getFirmaId(req);
    const firma = await repository.get(firmaId);

    if (!firma) res.sendStatus(404);
    else res.send(firma);
    return next();
  } catch (error) {
    return next(error);
  }
}

async function save(req, res, next) {
  try {
    const firmaId = bl.getFirmaId(req);
    const recordCount = await repository.save(firmaId, req.body);
    res.send(recordCount === 1);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { get, save };
