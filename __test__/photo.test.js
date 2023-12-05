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

describe('POST /photos', () => {
  it('should create a photo and return 201 status', async () => {
    // Login to get the user token
    const loginRes = await request(app)
      .post('/users/login')
      .send({
        email: userdata.email,
        password: userdata.password,
      });

    // Extract the token from the login response
    const { token } = loginRes.body;

    // Make a POST request to create a photo using the obtained token for authentication
    const photoRes = await request(app)
      .post('/photos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Photo Title',
        caption: 'Testing Photo Creation',
        poster_image_url: 'https://linktoimage.com/photo.jpg',
      })
      .expect(201);

    // Assertions based on the response from creating a photo
    expect(photoRes.body).toHaveProperty('id');
    expect(photoRes.body).toHaveProperty('poster_image_url', 'https://linktoimage.com/photo.jpg');
    expect(photoRes.body).toHaveProperty('title', 'New Photo Title');
    expect(photoRes.body).toHaveProperty('caption', 'Testing Photo Creation');
  });

  it('should return 401 status if not authenticated', async () => {
    // Make a POST request without authentication token
    const photoRes = await request(app)
      .post('/photos')
      .send({
        title: 'New Photo Title',
        caption: 'Testing Photo Creation',
        poster_image_url: 'https://linktoimage.com/photo.jpg',
      })
      .expect(401);

    // Assertion for unauthorized request
    expect(photoRes.body).toHaveProperty('message', 'Unauthorized');
  });

  // If needed, add more test cases for different scenarios
});
