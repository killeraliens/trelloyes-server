require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const winston = require('winston')
const cors = require('cors')
const uuid = require('uuid/v4')
const { NODE_ENV } = require('./config')

const app = express()
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'dev'
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [ new winston.transports.File({filename: 'info.log'}) ]
})

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({format: winston.format.simple()}))
}

const CARDS = [{
  id: 1,
  title: 'Task One',
  content: 'This is card one'
}];
const LISTS = [{
  id: 1,
  header: 'List One',
  cardIds: [1]
}];


app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json()) //catchall for content type safety
app.use(validateBearerToken)
app.get('/list', getLists)
app.get('/card', getCards)
app.get('/card/:id', getCard)
app.get('/list/:id', getList)
app.post('/card', validateContentType, postCard)  //for correct error reporting
app.post('/list', validateContentType, postList)
app.use(errorHandler)

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

function postList(req, res) {
  const { header, cardIds = []} = req.body

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

  if(cardIds.length > 0) {
    cardIds.forEach(cId => {
      let foundCard = CARDS.find(card => card.id === cId)
      if (!foundCard) {
        logger.error(`Card with id ${cId} not found`)
        cardsAreValid = false
      }
    })
  }

  if(!cardsAreValid) {

    return res
      .status(400)
      .send('Invalid Data')
  }

  const id = uuid()
  const list = { ...req.body, id }
  LISTS.push(list)

  res
    .status(201)
    .location(`/list/${id}`)
    .json(list)
}

function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authHeader = req.get('Authorization')
  const bearerToken = authHeader ? authHeader.split(' ')[1] : null;

  if (!bearerToken || bearerToken !== apiToken) {
    logger.error(`Unauthorized request to ${req.path}`)
    return res
      .status(403)
      .json({ error: 'Unauthorized request' })
  }
  next()
}

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

function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === "production") {
    response = { error: { message: "Server Error" } }
  } else {
    console.log(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
}

module.exports = app
