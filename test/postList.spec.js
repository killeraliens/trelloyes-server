const app = require('../src/app')

describe('POST /list endpoint', () => {
  const authHeader = {
    "Authorization": `Bearer ${process.env.API_TOKEN}`,
    "Content-Type": "application/json"
  }

  const correctList = {
    "header": "some header",
    "cardIds": [1]
  }

  const missingHeaderList = {
    "cardIds": [1]
  }

  const incorrectCardsList = {
    "header": "some header",
    "cardIds": [666]
  }

  const incorrectKeysList = {
    "header": "some header",
    "notCorrect": [1]
  }


  it('returns 201 success if posted list item is accurate', () => {
    return supertest(app)
      .post('/list')
      .set(authHeader)
      .send(correctList)
      .expect(201)
  })

  it('returns correct list item upon creation', () => {
    return supertest(app)
      .post('/list')
      .set(authHeader)
      .send(correctList)
      .then(res => {
        expect(res.body).to.have.all.keys('id', 'cardIds', 'header')
      })
  })

  it('returns 400 response if posted list is missing field', () => {
    return supertest(app)
      .post('/list')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .send(missingHeaderList)
      .expect(400, 'Invalid Data')
  })

  it('returns 400 response if posted list cards are incorrect', () => {
    return supertest(app)
      .post('/list')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .send(incorrectCardsList)
      .expect(400, 'Invalid Data')
  })

  it('returns 400 response if receiving unexpected req.body keys', () => {
    return supertest(app)
      .post('/list')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .send(incorrectKeysList)
      .expect(400, 'Invalid Data')
  })
})
