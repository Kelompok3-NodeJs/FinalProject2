const request = require("supertest");
const app = require("../app");
const { User } = require("../models");

let server;
let createdUserId;
let userToken;
beforeAll(async () => {
  const userdata = await User.create({
    email: "usertest@mail.com",
    full_name: "usertest",
    username: "usertest",
    password: "usertest",
    profile_image_url: "www.photo.com/usertest.png",
    age: 20,
    phone_number: "08123456789",
  });

  const registeredUser = await User.findOne({
    where: { email: userdata.email },
  });
  createdUserId = registeredUser.id;

  // Log in and get a token
  const loginResponse = await request(app).post("/users/login").send({
    email: "usertest@mail.com",
    password: "usertest",
  });

  userToken = loginResponse.body.token;
});
beforeAll(() => {
  server = app.listen;
});

describe("Post /photos", () => {
  it("should return 201 status and create a new photo", async () => {
    const photoData = {
      poster_image_url: "https://linktoimage.com/photo.jpg",
      title: "New Photo Title",
      caption: "Testing Photo Creation",
    };
    const response = await request(app)
      .post("/photos")
      .set("token", userToken)
      .send(photoData)
      .expect(201);
  });
});

afterAll(async () => {
  try {
    await Promise.all([
      User.destroy({ where: {} }),
      Photo.destroy({ where: {} }), // Add any other model cleanup here
      new Promise((resolve) => server.close(resolve)),
    ]);
  } catch (error) {
    console.log(error);
  }
});
