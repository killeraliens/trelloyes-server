const app = require('../src/app')

describe('App', () => {
  it('should exist', () => {
     expect(app).to.be.a('function')
  })

  it('GET / responds with 403 invalid auth header', () => {
    return supertest(app)
      .get('/')
      .expect(403)
  })



})
