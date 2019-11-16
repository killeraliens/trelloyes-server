const logger = require('./logger')


function validateContentType(req, res, next) {
  let contentTypeExists = req.headers['content-type'];
  let contentTypeIsJson = req.headers['content-type'] === 'application/json';

  if (!contentTypeExists || !contentTypeIsJson) {
    logger.error('Post req content type is missing or not json')
    return res
      .status(400)
      .json({ error: 'Invalid Data' })
  }
  logger.info('Passes validate content type')
  next()
}


module.exports = {
  validateContentType
}
