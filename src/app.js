require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./logger')
const { NODE_ENV } = require('./config')
const cardRouter = require('./card/card-router')
const listRouter = require('./list/list-router')

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'dev'
const app = express()

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json()) //catchall for content type safety
app.use(validateBearerToken)

app.use(cardRouter)
app.use(listRouter)

app.use(errorHandler)

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


