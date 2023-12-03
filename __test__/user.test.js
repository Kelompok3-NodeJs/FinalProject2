const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { generateToken } = require('../helpers/jwt');
const user = require('../models/user');
let server;

let createdUserId;
let userToken;
let userToken2;
let UserData2;
const updateData = {
    email: "usertestupdate@mail.com",
    full_name: "usertestupdate",
    username: "usertestupdate",
    password: "usertestupdate",
    profile_image_url: "www.photo.com/usertest.png",
    age: 20,
    phone_number: "08123456710"
}
const userdata = {
    email: "usertest@mail.com", 
    full_name: "usertest", 
    username: "usertest", 
    password: "usertest", 
    profile_image_url: "www.photo.com/usertest.png", 
    age: 20, 
    phone_number: "08123456789"
}
const userdata2 = {
    email: "usertest2@mail.com",
    full_name: "usertest2",
    username: "usertest2",
    password: "usertest2",
    profile_image_url: "www.photo.com/usertest2.png",
    age: 20,
    phone_number: "08123456789"
}

beforeAll(() => {
   server = app.listen()
})

afterAll((done) => {
    try {
        User.destroy({where: {}})
        server.close(done)
    } catch (error) {
        console.log(error)
    }
})

describe('user register', () => {
    describe('success register', () => {
        it('should return 201 status code and create a new user', async () => {
            const res = await request(app)
                .post('/users/register')
                .send(userdata)
                .expect(201)
            expect(res.body).toHaveProperty('username', userdata.username)
            expect(res.body).toHaveProperty('email', userdata.email)
            expect(res.body).toHaveProperty('full_name', userdata.full_name)
            expect(res.body).toHaveProperty('profile_image_url', userdata.profile_image_url)
            expect(res.body).toHaveProperty('age', userdata.age)
            expect(res.body).toHaveProperty('phone_number', userdata.phone_number)

            // variabel createdUserId digunakan untuk menyimpan id dari user yang baru dibuat, dikarenakan kita tidak boleh menampilkan id ke res.body
            const registeredUser = await User.findOne({ where: { email: userdata.email } });
            createdUserId = registeredUser.id;
        })
    })

    describe('error register', () => {
        it('should return 400 status code and error message', async () => {
            const res = await request(app)
                .post('/users/register')
                .send({
                    email: "", 
                    full_name: "", 
                    username: "", 
                    password: "", 
                    profile_image_url: "",
                    age: "", 
                    phone_number: ""
                })
                .expect(400)
                expect(res.body).toHaveProperty('message', ["Full name cannot be empty!","Invalid email format!", "Email cannot be empty!", "Username cannot be empty!","Password cannot be empty!","Profile image cannot be empty!","Invalid url format!","Age cannot be empty!","Age must be a number data type!","Phone number cannot be empty!","Phone number must be a number data type!"])
                expect(res.body).not.toHaveProperty('full_name')
                expect(res.body).not.toHaveProperty('username')
                expect(res.body).not.toHaveProperty('email')
                expect(res.body).not.toHaveProperty('profile_image_url')
                expect(res.body).not.toHaveProperty('age')
                expect(res.body).not.toHaveProperty('phone_number')  
        })
    })

    describe('error register caused unique email constrait', () => {
        it('should return 400 status code and error message', async () => {
            const res = await request(app)
                .post('/users/register')
                .send(userdata)
                .expect(400)
                expect(res.body).toHaveProperty('message', ["Email already exists!"])
                expect(res.body).not.toHaveProperty('full_name')
                expect(res.body).not.toHaveProperty('username')
                expect(res.body).not.toHaveProperty('email')
                expect(res.body).not.toHaveProperty('profile_image_url')
                expect(res.body).not.toHaveProperty('age')
                expect(res.body).not.toHaveProperty('phone_number')  
        })
    })

    describe('error register caused unique username constrait', () => {
        it('should return 400 status code and error message', async () => {
            const res = await request(app)
                .post('/users/register')
                .send({
                    email: "test1@mail.com",
                    username: userdata.username,
                    full_name: userdata.full_name,
                    password: userdata.password,
                    profile_image_url: userdata.profile_image_url,
                    age: userdata.age,
                    phone_number: userdata.phone_number
                })
                .expect(400)
                expect(res.body).toHaveProperty('message', ["Username already exists!"])
                expect(res.body).not.toHaveProperty('full_name')
                expect(res.body).not.toHaveProperty('username')
                expect(res.body).not.toHaveProperty('email')
                expect(res.body).not.toHaveProperty('profile_image_url')
                expect(res.body).not.toHaveProperty('age')
                expect(res.body).not.toHaveProperty('phone_number')  
        })
    })
})

describe("user login", () => {
    describe("success login", () => {
        it("should return 200 status code and access token", async () => {
            const res = await request(app)
                .post("/users/login")
                .send({
                    email: userdata.email,
                    password: userdata.password
                })
                .expect(200)
            expect(res.body).toHaveProperty("token", expect.any(String))
            expect(res.body).not.toHaveProperty("error_name",`user login error`)
            expect(res.body).not.toHaveProperty("devMesaage")
            expect(res.body.token).toBeTruthy();
            expect(res.body.token.length).toBeGreaterThan(0);
            expect(res.status).toBe(200)

            // variabel userToken digunakan untuk menyimpan token yang didapat dari proses login
            userToken = res.body.token
        })
    })

    // variabel wrongEmail digunakan untuk menyimpan email yang tidak terdaftar di database
    const wrongEmail = "test1@mail.com"
    describe("error login caused wrong email", () => {
        it("should return 400 status code and error message", async () => {
            
            const res = await request(app)
                .post("/users/login")
                .send({
                    email: wrongEmail,
                    password: userdata.password
                })
                .expect(400)
            expect(res.body).toHaveProperty("error_name", `user login error`)
            expect(res.body).toHaveProperty("devMesaage", `User With Email "${wrongEmail}" Not Found`)
            expect(res.body).not.toHaveProperty("error_name", `Wrong Password`)
            expect(res.body).not.toHaveProperty("token")
            expect(res.status).toBe(400)
        })
    })

    describe("error login caused wrong password", () => {
        it("should return 400 status code and error message", async () => {
            const res = await request(app)
                .post("/users/login")
                .send({
                    email: userdata.email,
                    password: "test"
                })
                .expect(400)
            expect(res.body).toHaveProperty("error_name", `user login error`)
            expect(res.body).toHaveProperty("devMesaage", `Wrong Password`)
            expect(res.body).not.toHaveProperty("error_name", `User With Email "${wrongEmail}" Not Found`)
            expect(res.body).not.toHaveProperty("token")
            expect(res.status).toBe(400)
        })
    })
})

describe("user update", () => {
    describe("success update", () => {
        it("should return 200 status code and updated user", async () => {
            const res = await request(app)
                .put(`/users/${createdUserId}`)
                .set('token',userToken)
                .send(updateData)
                .expect(200)
            expect(res.body).toHaveProperty('username', updateData.username)
            expect(res.body).toHaveProperty('email', updateData.email)
            expect(res.body).toHaveProperty('full_name', updateData.full_name)
            expect(res.body).toHaveProperty('profile_image_url', updateData.profile_image_url)
            expect(res.body).toHaveProperty('age', updateData.age)
            expect(res.body).toHaveProperty('phone_number', updateData.phone_number)
            expect(res.body).not.toHaveProperty('message', 'User Not Found')
            expect(res.status).toBe(200)
        })
        afterAll(async () => {
            registeredUser = await User.findOne({where: {email: updateData.email}})
            createdUserId = registeredUser.id
            await User.update(userdata,{where:{id: createdUserId}})
        })
    })

    describe("error update caused not authenticated", () => {
        it("should return 401 status code and error message", async () => {
            const res = await request(app)
                .put(`/users/${createdUserId}`)
                .send(updateData)
                .expect(401)
            expect(res.body).toHaveProperty('message', 'Unauthorized')
            expect(res.body).not.toHaveProperty('username', updateData.username)
            expect(res.body).not.toHaveProperty('email', updateData.email)
            expect(res.body).not.toHaveProperty('full_name', updateData.full_name)
            expect(res.body).not.toHaveProperty('profile_image_url', updateData.profile_image_url)
            expect(res.body).not.toHaveProperty('age', updateData.age)
            expect(res.body).not.toHaveProperty('phone_number', updateData.phone_number)
            expect(res.status).toBe(401)
        })
    })

    describe("error update caused not authorized", () => {
        it("should return 401 status code and error message", async () => {
            await User.create(userdata2)
            UserData2 = await User.findOne({where: {email: userdata2.email}})
            const res = await request(app)
                .put(`/users/${UserData2.id}`)
                .set('token',userToken)
                .send(updateData)
                .expect(401)
            expect(res.body).toHaveProperty('message', 'Unauthorized: This is not your account')
            expect(res.body).not.toHaveProperty('username', updateData.username)
            expect(res.body).not.toHaveProperty('email', updateData.email)
            expect(res.body).not.toHaveProperty('full_name', updateData.full_name)
            expect(res.body).not.toHaveProperty('profile_image_url', updateData.profile_image_url)
            expect(res.body).not.toHaveProperty('age', updateData.age)
            expect(res.body).not.toHaveProperty('phone_number', updateData.phone_number)
            expect(res.status).toBe(401)
        })
    })

    describe("error update caused unique email constrait", () => {
        it("should return 400 status code and error message", async () => {
            const res = await request(app)
                .put(`/users/${createdUserId}`)
                .set('token',userToken)
                .send({
                    email: userdata2.email,
                    full_name: userdata2.full_name,
                    username: "newsername",
                    password: userdata2.password,
                    profile_image_url: userdata2.profile_image_url,
                    age: userdata2.age,
                    phone_number: userdata2.phone_number
                })
                .expect(400)
            expect(res.body).toHaveProperty('message', ["Email already exists!"])
            expect(res.body).not.toHaveProperty('username', updateData.username)
            expect(res.body).not.toHaveProperty('email', updateData.email)
            expect(res.body).not.toHaveProperty('full_name', updateData.full_name)
            expect(res.body).not.toHaveProperty('profile_image_url', updateData.profile_image_url)
            expect(res.body).not.toHaveProperty('age', updateData.age)
            expect(res.body).not.toHaveProperty('phone_number', updateData.phone_number)
            expect(res.status).toBe(400)
        })
    })

    describe("error update caused unique username constrait", () => {
        it("should return 400 status code and error message", async () => {
            const res = await request(app)
                .put(`/users/${createdUserId}`)
                .set('token',userToken)
                .send({
                    email: "new@mail.com",
                    full_name: userdata2.full_name,
                    username: userdata2.username,
                    password: userdata2.password,
                    profile_image_url: userdata2.profile_image_url,
                    age: userdata2.age,
                    phone_number: userdata2.phone_number
                })
                .expect(400)
            expect(res.body).toHaveProperty('message', ["Username already exists!"])
            expect(res.body).not.toHaveProperty('username', updateData.username)
            expect(res.body).not.toHaveProperty('email', updateData.email)
            expect(res.body).not.toHaveProperty('full_name', updateData.full_name)
            expect(res.body).not.toHaveProperty('profile_image_url', updateData.profile_image_url)
            expect(res.body).not.toHaveProperty('age', updateData.age)
            expect(res.body).not.toHaveProperty('phone_number', updateData.phone_number)
            expect(res.status).toBe(400)
        })
    })
    
})

describe("user delete", () => {
    describe("error delete caused user not found", () => {
        it("should return 404 status code and error message", async () => {
            const res = await request(app)
                .delete(`/users/999`)
                .set('token',userToken)
                .expect(404)
            expect(res.body).toHaveProperty('message', 'User Id not found')
            expect(res.status).toBe(404)
            expect(res.headers).toHaveProperty('content-type')
            expect(res.headers['content-type']).toContain('application/json')
            expect(res.body).toBeInstanceOf(Object)
            expect(Object.keys(res.body)).toContain('message')
        })
    })

    describe("success delete", () => {
        it("should return 200 status code and message", async () => {
            const res = await request(app)
                .delete(`/users/${createdUserId}`)
                .set('token',userToken)
                .expect(200)
            expect(res.body).toHaveProperty('message', 'Your account has been successfully deleted')
            expect(res.status).toBe(200)
            expect(res.headers).toHaveProperty('content-type')
            expect(res.headers['content-type']).toContain('application/json')
            expect(res.body).toBeInstanceOf(Object)
            expect(Object.keys(res.body)).toContain('message')
        })
    })

    describe("error delete caused not authenticated", () => {
        it("should return 401 status code and error message", async () => {
            const res = await request(app)
                .delete(`/users/${createdUserId}`)
                .expect(401)
            expect(res.body).toHaveProperty('message', 'Unauthorized')
            expect(res.status).toBe(401)
            expect(res.headers).toHaveProperty('content-type')
            expect(res.headers['content-type']).toContain('application/json')
            expect(res.body).toBeInstanceOf(Object)
            expect(Object.keys(res.body)).toContain('message')
        })
    })
})


