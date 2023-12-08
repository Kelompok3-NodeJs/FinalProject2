const request = require('supertest')
const app = require('../app')
const { User, SocialMedia} = require('../models')

let userToken
let createdUserId
let server
let socialMediaId

beforeAll(async () => {
    server = app.listen
})

beforeAll(async () => {
    const userdata = await User.create({
        email: 'usertest@mail.com',
        full_name: "usertest",
        username: "usertest",
        password: "usertest",
        profile_image_url: "www.photo.com/usertest.png",
        age: 20,
        phone_number: "08123456789",
    })
    const registeredUser = await User.findOne({
        where: { email: userdata.email }
    })
    createdUserId = registeredUser.id

    const loginResponse = await request(app).post('/users/login').send({
        email: "usertest@mail.com",
        password: "usertest",
    })
    userToken = loginResponse.body.token
})

afterAll(async () => {
    await User.destroy({
        where: {},
    })
    await SocialMedia.destroy({
        where: {},
    })
})

describe('POST /socialmedia', () => {
    describe('success process', () => {
        it('should return res with status code 201', async () => {
            const res = await request(app)
                .post('/socialmedias')
                .set('token', userToken)
                .send({
                    name: "facebook",
                    social_media_url: "www.facebook.com/usertest",
                })
                .expect(201)
            expect(res.statusCode).toEqual(201)
            expect(res.body).toHaveProperty('id', expect.any(Number))
            expect(res.body).toHaveProperty('name', "facebook")
            expect(res.body).toHaveProperty('social_media_url', "www.facebook.com/usertest")
            expect(res.body).toHaveProperty('UserId', createdUserId)
            expect(res.body).toHaveProperty('updatedAt', expect.any(String))
            expect(res.body).toHaveProperty('createdAt', expect.any(String))
            
            socialMediaId = res.body.id
        })
    })

    describe('error process', () => {
        it('should return res with status code 400 because empty name', async () => {
            const res = await request(app)
                .post('/socialmedias')
                .set('token', userToken)
                .send({
                    social_media_url: "www.facebook.com/usertest",
                    name: " ",
                })
                .expect(400)
            expect(res.statusCode).toEqual(400)
            expect(res.body).toHaveProperty('message', ["Name cannot be empty!"])
            expect(res.body).not.toHaveProperty('id')
            expect(res.body).not.toHaveProperty('social_media_url')
            expect(res.body).not.toHaveProperty('UserId')
            expect(res.body).not.toHaveProperty('updatedAt')
            expect(res.body).not.toHaveProperty('createdAt')
            expect(res.body).not.toHaveProperty('name')
        
        })

        it('should return res with status code 400 because missing social_media_url', async () => {
            const res = await request(app)
                .post('/socialmedias')
                .set('token', userToken)
                .send({
                    name: "facebook",
                    social_media_url: " ",
                })
                .expect(400)
            expect(res.statusCode).toEqual(400)
            expect(res.body).toHaveProperty('message', ["Social media URL cannot be empty!"])
            expect(res.body).not.toHaveProperty('id')
            expect(res.body).not.toHaveProperty('name')
            expect(res.body).not.toHaveProperty('UserId')
            expect(res.body).not.toHaveProperty('updatedAt')
            expect(res.body).not.toHaveProperty('createdAt')
            expect(res.body).not.toHaveProperty('social_media_url')
        })

        it('should return res with status code 401 because missing token', async () => {
            const res = await request(app)
                .post('/socialmedias')
                .send({
                    name: "facebook",
                    social_media_url: "www.facebook.com/usertest",
                })
                .expect(401)
            expect(res.statusCode).toEqual(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
        })

        it('should return res with status code 400 because invalid token', async () => {
            const res = await request(app)
                .post('/socialmedias')
                .set('token', 'invalid token')
                .send({
                    name: "facebook",
                    social_media_url: "www.facebook.com/usertest",
                })
                .expect(401)
            expect(res.statusCode).toEqual(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
        })
    })
})

describe('GET /socialmedia', () => {
    describe('success process', () => {
        it('should return res with status code 200', async () => {
            const res = await request(app)
                .get('/socialmedias')
                .set('token', userToken)
                .expect(200)
            expect(res.statusCode).toEqual(200)
            res.body.forEach(socialmedia => {
                expect(socialmedia).toHaveProperty('id', expect.any(Number))
                expect(socialmedia).toHaveProperty('name', expect.any(String))
                expect(socialmedia).toHaveProperty('social_media_url', expect.any(String))
                expect(socialmedia).toHaveProperty('UserId', expect.any(Number))
                expect(socialmedia).toHaveProperty('createdAt', expect.any(String))
                expect(socialmedia).toHaveProperty('updatedAt', expect.any(String))
                expect(socialmedia).toHaveProperty('User', expect.any(Object))
                expect(socialmedia.User).toHaveProperty('id', expect.any(Number))
                expect(socialmedia.User).toHaveProperty('username', expect.any(String))
                expect(socialmedia.User).toHaveProperty('profile_image_url', expect.any(String))
            })
        })
    })
})