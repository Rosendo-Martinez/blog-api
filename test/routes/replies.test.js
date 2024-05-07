const app = require('../appTest')
const request = require('supertest');
var assert = require('assert')


describe('Like comment', function () {
    it('should return req details back in body because its not imp. yet', function (done) {
        request(app)
            .post('/replies/2/likes')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(function (res) {
                assert.deepEqual(res.body.params.replyId, 2)
            })
            .end(done)
    })
})