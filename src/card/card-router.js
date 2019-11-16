const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { validateContentType } = require('../middleware.js')
const { CARDS, LISTS } = require('../STORE')

const cardRouter = express.Router()

cardRouter
  .route('/card')
  .get(getCards)
  .post(validateContentType, postCard)

cardRouter
  .route('/card/:id')
  .get(getCard)
  .delete(deleteCard)


module.exports = cardRouter


function getCards(req, res) {
  res.json(CARDS)
}

function getCard(req, res) {
  const { id } = req.params
  const card = CARDS.find(card => card.id == id)
  if (!card) {
    logger.error(`Card with id ${id} not found`)
    return res
      .status(404)
      .send('Card not found')
  }
  res.json(card)
}

function postCard(req, res) {
    const { title, content } = req.body

    if (!title) {
      logger.error('Title is required')
      return res.status(400).send('Invalid Data')
    }

    if (!content) {
      logger.error('Content is required')
      return res.status(400).send('Invalid Data')
    }

    const id = uuid()
    const card = { ...req.body, id }
    CARDS.push(card)

    res
      .status(201)
      .location(`/card/${id}`) //on location headers.. proper handling (full path?)
      .json(CARDS)
}

function deleteCard(req, res) {
    const { id } = req.params

    const cardI = CARDS.findIndex(card => card.id == id)

    if (cardI === -1) {
      logger.error(`Card with id ${id} cannot be deleted, not found`)
      return res.status(404).send('Not found')
    }

    CARDS.splice(cardI, 1)
    LISTS.forEach(list => {
      const cI = list.cardIds.findIndex(el => el == id)
      if (cI !== -1) {
        list.cardIds.splice(cI, 1)
      }
    })

    res
      .status(204)
      .end()
}





