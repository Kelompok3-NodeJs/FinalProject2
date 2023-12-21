const request = require('supertest')
const app = require('../app')
const { User, Comment, Photo } = require('../models')
const { generateToken } = require('../helpers/jwt')

let server
let createdUserId
let userToken
let createdPhotoId
let createdCommentId
let user_without_comment = {
    email: 'unknown@mail.com',
    full_name: "unknown",
    username: "unknown",
    password: "unknown",
    profile_image_url: "www.photo.com/unknown.png",
    age: 20,
    phone_number: "08123456789",
}

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

    const photoData = await Photo.create({
        title: "photo test",
        poster_image_url: "www.photo.com/phototest.png",
        user_id: createdUserId,
        caption: "caption test",
    })
    const registeredPhoto = await Photo.findOne({
        where: { title: photoData.title }
    })
    createdPhotoId = registeredPhoto.id
})
beforeAll(async () => {
    server = app.listen
})

afterAll(async () => {
    await User.destroy({
        where: { }
    })
    await Photo.destroy({
        where: { }
    })
    await Comment.destroy({
        where: { }
    })
})

describe('POST /comments', () => {
    describe('succes posting a comment', () => {
        it("should return status 201 and object of created comment", async () => {
        const res = await request(app)
            .post('/comments')
            .set('token', userToken)
            .send({
                comment: "test comment",
                PhotoId: createdPhotoId,
            })
            .expect(201)
            expect(res.body).toHaveProperty('id', expect.any(Number))
            expect(res.body).toHaveProperty('UserId', expect.any(Number))
            expect(res.body).toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).toHaveProperty('comment', "test comment")
            expect(res.body).toHaveProperty('createdAt', expect.any(String))
            expect(res.body).toHaveProperty('updatedAt', expect.any(String))
            createdCommentId = res.body.id
        })
    })
    describe('error posting a comment', () => {
        it("should return status 500 and object of error message", async () => {
        const res = await request(app)
            .post('/comments')
            .set('token', userToken)
            .send({
                comment: "test comment",
                PhotoId: 0,
            })
            .expect(500)
            expect(res.body).toHaveProperty('name', "photo not found")
            expect(res.body).toHaveProperty('devMessage', "Photo with id 0 not found")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return status 400 caused error by empty comment", async () => {
        const res = await request(app)
            .post('/comments')
            .set('token', userToken)
            .send({
                comment: "",
                PhotoId: createdPhotoId,
            })
            .expect(400)
            expect(res.body).toHaveProperty('message', ["Comment cannot be empty!"])
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return status 401 caused error by empty token", async () => {
        const res = await request(app)
            .post('/comments')
            .set('token', "")
            .send({
                comment: "test comment",
                PhotoId: createdPhotoId,
            })
            .expect(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return status 401 caused error by invalid token", async () => {
            const res = await request(app)
            .post('/comments')
            .set('token', "invalid token")
            .send({
                comment: "test comment",
                PhotoId: createdPhotoId,
            })
            .expect(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })
    })
})

describe('GET /comments', () => {
    describe('succes getting all comments', () => {
        it("should return status 200 and array of comments", async () => {
        const res = await request(app)
            .get('/comments')
            .set('token', userToken)
            .expect(200)
           expect(res.body).toBeDefined()
           expect(Array.isArray(res.body)).toBe(true)
           expect(res.body.length).toBeGreaterThan(0)

           res.body.forEach(comment => {
               expect(comment).toHaveProperty('id', expect.any(Number))
               expect(comment).toHaveProperty('UserId', expect.any(Number))
               expect(comment).toHaveProperty('PhotoId', expect.any(Number))
               expect(comment).toHaveProperty('comment', expect.any(String))
               expect(comment).toHaveProperty('createdAt', expect.any(String))
               expect(comment).toHaveProperty('updatedAt', expect.any(String))
               
               expect(comment).toHaveProperty('Photo')
               expect(comment.Photo).toHaveProperty('id', expect.any(Number))
               expect(comment.Photo).toHaveProperty('title', expect.any(String))
               expect(comment.Photo).toHaveProperty('caption', expect.any(String))
               expect(comment.Photo).toHaveProperty('poster_image_url', expect.any(String))

               expect(comment).toHaveProperty('User')
               expect(comment.User).toHaveProperty('id', expect.any(Number))
               expect(comment.User).toHaveProperty('username', expect.any(String))
               expect(comment.User).toHaveProperty('profile_image_url', expect.any(String))
               expect(comment.User).toHaveProperty('phone_number', expect.any(String))
            })

        })
    })

    describe('error getting all comments', () => {
        describe('error caused by empty token', () => {
            it("should return status 401 and object of error message", async () => {
            const res = await request(app)
                .get('/comments')
                .set('token', "")
                .expect(401)
                expect(res.body).toHaveProperty('message', "Unauthorized")
                expect(res.body).not.toHaveProperty('id',expect.any(Number))
                expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
                expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
                expect(res.body).not.toHaveProperty('comment', "test comment")
                expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
                expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
            })
        })

        describe('error caused the comment length is 0', () => {
            it("should return status 401 and object of error message", async () => {
                User.create(user_without_comment)
                const mocktoken= generateToken(user_without_comment)
                const res = await request(app)
                .get('/comments')
                .set('token', mocktoken)
                .expect(401)
                expect(res.body).toHaveProperty('message', "Unauthorized")
                expect(res.body).not.toHaveProperty('id',expect.any(Number))
                expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
                expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
                expect(res.body).not.toHaveProperty('comment', "test comment")
                expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
                expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
            })
        })
    })
})

describe('PUT /comments/:id', () => {
    describe('succes updating a comment', () => {
        it("should return status 200 and object of updated comment", async () => {
        const res = await request(app)
            .put(`/comments/${createdCommentId}`)
            .set('token', userToken)
            .send({
                comment: "test comment",
            })
            .expect(200)
            expect(res.body).toHaveProperty('id', expect.any(Number))
            expect(res.body).toHaveProperty('UserId', expect.any(Number))
            expect(res.body).toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).toHaveProperty('comment', "test comment")
            expect(res.body).toHaveProperty('createdAt', expect.any(String))
            expect(res.body).toHaveProperty('updatedAt', expect.any(String))
        })
    })

    describe('error updating a comment', () => {
        it("should return 400 status code and object of error message caused by empty comment", async () => {
        const res = await request(app)
            .put(`/comments/${createdCommentId}`)
            .set('token', userToken)
            .send({
                comment: " ",
            })
            .expect(400)
            expect(res.body).toHaveProperty('message', "Comment cannot be empty!")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return 401 status code when try to update comment that not belong to user", async () => {
            const mocktoken= generateToken(user_without_comment)
            const res = await request(app)
            .put(`/comments/${createdCommentId}`)
            .set('token', mocktoken)
            .send({
                comment: "test comment",
            })
            .expect(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return 401 status code and object of error message caused by empty token", async () => {
        const res = await request(app)
            .put(`/comments/${createdCommentId}`)
            .set('token', "")
            .send({
                comment: "test comment",
            })
            .expect(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return 401 status code and object of error message caused by invalid token", async () => {
        const res = await request(app)
                .put(`/comments/${createdCommentId}`)
                .set('token', "invalid token")
                .send({
                    comment: "test comment",
                })
                .expect(401)
                expect(res.body).toHaveProperty('message', "Unauthorized")
                expect(res.body).not.toHaveProperty('id',expect.any(Number))
                expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
                expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
                expect(res.body).not.toHaveProperty('comment', "test comment")
                expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
                expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })
    })
})

describe('DELETE /comments/:id', () => {
    let willdeletedCommentId;
    beforeEach(async () => {
        const commentData = await Comment.create({
            comment: "will be deleted comment",
            UserId: createdUserId,
            PhotoId: createdPhotoId,
        })
        const registeredComment = await Comment.findOne({
            where: { comment: commentData.comment }
        })
        willdeletedCommentId = registeredComment.id
    })

    describe('succes deleting a comment', () => {
        it("should return status 200 and object of deleted comment", async () => {
        const res = await request(app)
            .delete(`/comments/${willdeletedCommentId}`)
            .set('token', userToken)
            .expect(200)
            expect(res.body).toBeInstanceOf(Object)
            expect(Object.keys(res.body)).toContain('message')
            expect(res.body).toHaveProperty('message', 'Your Comment has been successfully deleted')
        })
    })

    describe('error deleting a comment', () => {
        it("should return 401 status code and object of error message caused by empty token", async () => {
        const res = await request(app)
            .delete(`/comments/${willdeletedCommentId}`)
            .set('token', "")
            .expect(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return 401 status code and object of error message caused by invalid token", async () => {
        const res = await request(app)
            .delete(`/comments/${willdeletedCommentId}`)
            .set('token', "invalid token")
            .expect(401)
            expect(res.body).toHaveProperty('message', "Unauthorized")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return 404 status code and object of error message caused by comment not found", async () => {
            const res = await request(app)
            .delete(`/comments/0`)
            .set('token', userToken)
            .expect(404)
            expect(res.body).toHaveProperty('message', "Comment Not Found")
            expect(res.body).not.toHaveProperty('id',expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "test comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })

        it("should return 401 status code and object of error message caused by comment not belong to user", async () => {
            const newUser = await User.create({
                email: 'newuser@mail.com',
                full_name: "New User",
                username: "newuser",
                password: "password",
                profile_image_url: "www.photo.com/newuser.png",
                age: 25,
                phone_number: "08123456789",
            })

            const newComment = await Comment.create({
                comment: "new comment",
                UserId: newUser.id,
                PhotoId: createdPhotoId,
            })

            const res = await request(app)
                .delete(`/comments/${newComment.id}`)
                .set('token', userToken)
                .expect(401)

            expect(res.body).toHaveProperty('message', "Unauthorized")
            expect(res.body).not.toHaveProperty('id', expect.any(Number))
            expect(res.body).not.toHaveProperty('UserId', expect.any(Number))
            expect(res.body).not.toHaveProperty('PhotoId', expect.any(Number))
            expect(res.body).not.toHaveProperty('comment', "new comment")
            expect(res.body).not.toHaveProperty('createdAt', expect.any(String))
            expect(res.body).not.toHaveProperty('updatedAt', expect.any(String))
        })
    })
})



