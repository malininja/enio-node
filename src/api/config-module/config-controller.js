const repository = require("./config-repository");
const bl = require("../../utils/bl");

async function get(req, res, next) {
  try {
    const firmaId = bl.getFirmaId(req);
    const config = await repository.get(firmaId);

    if (!config) res.sendStatus(404);
    else res.send(config);
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
