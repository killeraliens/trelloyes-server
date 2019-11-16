const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger.js')
const { validateContentType } = require('../middleware.js')
const { CARDS, LISTS } = require('../STORE')


const listRouter = express.Router()

listRouter
  .route('/list')
  .get(getLists)
  .post(validateContentType, postList)

listRouter
  .route('/list/:id')
  .get(getList)
  .delete(deleteList)


module.exports  = listRouter


function getLists(req, res) {
  res.json(LISTS)
}

function getList(req, res) {
  const { id } = req.params
  const list = LISTS.find(list => list.id == id)
  if (!list) {
    logger.error(`List with id ${id} not found`);
    return res.status(404).send('List not found')
  }
  res.json(list)
}

function postList(req, res) {
  const { header, cardIds = [] } = req.body

  Object.keys(req.body).forEach(key => {
    if (!["id", "header", "cardIds"].includes(key)) {
      logger.error(`Bad keys in ${JSON.stringify(req.body)}`)
      return res.status(400).send('Invalid Data')
    }
  })

  if (!header) {
    logger.error('Header required')
    return res.status(400).send('Invalid Data')
  }

  let cardsAreValid = true

  if (cardIds.length > 0) {
    cardIds.forEach(cId => {
      let foundCard = CARDS.find(card => card.id === cId)
      if (!foundCard) {
        logger.error(`Card with id ${cId} not found`)
        cardsAreValid = false
      }
    })
  }

  if (!cardsAreValid) {
    return res
      .status(400)
      .send('Invalid Data')
  }

  const id = uuid()
  const list = { ...req.body, id }
  LISTS.push(list)

  logger.info(`List with id ${id} created`)

  res
    .status(201)
    .location(`/list/${id}`)
    .json(list)
}


function deleteList(req, res) {
  const { id } = req.params

  const listI = LISTS.findIndex(list => list.id == id)

  if (listI === -1) {
    logger.error(`Cannot delete list with id ${id}, not found`)
    return res.status(404).send('Not found')
  }

  LISTS.splice(listI, 1)

  logger.info(`List with ${id} deleted`)
  res
    .status(204)
    .end()
}
