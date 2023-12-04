const request = require('supertest');
const app = require('../app');
const { Photo, User } = require('../models');

let authToken;

beforeAll(async () => {
  const user = await User.create({
    email: "usertest@mail.com", 
    full_name: "usertest", 
    username: "usertest", 
    password: "usertest", 
    profile_image_url: "www.photo.com/usertest.png", 
    age: 20, 
    phone_number: "08123456789"
  });

  // Log in and get a token
  const loginResponse = await request(app)
    .post('/users/login')
    .send({
      email: 'usertest@mail.com', 
      password: 'usertest', 
    });

  authToken = loginResponse.body.token;
});



describe('POST /photos', () => {
  it('should create a photo and return 200 status', (done) => {
    request(app)
      .post('/photos')
      .set(`Bearer ${authToken}`)
      .send({
        title: 'Create Photo',
        caption: 'Testing Create Photo',
        image_url: 'https://linkimage.com/foto.jpg',
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err); // Return here to stop further execution

        done(); // Call done() only once
      });
  });

  it('should return 401 status if not authenticated', (done) => {
    request(app)
      .post('/photos')
      .send({
        title: 'Create Photo',
        caption: 'Testing Create Photo',
        image_url: 'https://linkimage.com/foto.jpg',
      })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);

        done(); // Call done() only once
      });
  });

  afterAll(async () => {
    await Photo.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

});
