const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");
const user = require("../models/user");
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
  phone_number: "08123456710",
};
const userdata = {
  email: "usertest@mail.com",
  full_name: "usertest",
  username: "usertest",
  password: "usertest",
  profile_image_url: "www.photo.com/usertest.png",
  age: 20,
  phone_number: "08123456789",
};
const userdata2 = {
  email: "usertest2@mail.com",
  full_name: "usertest2",
  username: "usertest2",
  password: "usertest2",
  profile_image_url: "www.photo.com/usertest2.png",
  age: 20,
  phone_number: "08123456789",
};

beforeAll(() => {
  server = app.listen();
});

describe("user register", () => {
  describe("success register", () => {
    it("should return 201 status code and create a new user", async () => {
      const res = await request(app)
        .post("/users/register")
        .send(userdata)
        .expect(201);
      expect(res.body).toHaveProperty("username", userdata.username);
      expect(res.body).toHaveProperty("email", userdata.email);
      expect(res.body).toHaveProperty("full_name", userdata.full_name);
      expect(res.body).toHaveProperty(
        "profile_image_url",
        userdata.profile_image_url
      );
      expect(res.body).toHaveProperty("age", userdata.age);
      expect(res.body).toHaveProperty("phone_number", userdata.phone_number);

      // variabel createdUserId digunakan untuk menyimpan id dari user yang baru dibuat, dikarenakan kita tidak boleh menampilkan id ke res.body
      const registeredUser = await User.findOne({
        where: { email: userdata.email },
      });
      createdUserId = registeredUser.id;
    });
  });
});

describe("Post /photos", () => {
  describe("success login", () => {
    it("should return 200 status code and access token", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({
          email: userdata.email,
          password: userdata.password,
        })
        .expect(200);
      expect(res.body).toHaveProperty("token", expect.any(String));
      expect(res.body).not.toHaveProperty("error_name", `Post /photos error`);
      expect(res.body).not.toHaveProperty("devMesaage");
      expect(res.body.token).toBeTruthy();
      expect(res.body.token.length).toBeGreaterThan(0);
      expect(res.status).toBe(200);

      // variabel userToken digunakan untuk menyimpan token yang didapat dari proses login
      userToken = res.body.token;
    });

    it("should create a new photo", async () => {
      const photoData = {
        poster_image_url: "https://linktoimage.com/photo.jpg",
        title: "New Photo Title",
        caption: "Testing Photo Creation",
      };

      console.log("Photo Data:", photoData); // Log the photoData being sent

      const response = await request(app)
        .post("/photos")
        .set("Authorization", `Bearer ${userToken}`)
        .send(photoData)
        .expect(201); // Update the expectation for status code to 201
      // Log the response received
      console.log("Response Body:", response);
    });
  });
});

afterAll((done) => {
  try {
    User.destroy({ where: {} });
    server.close(done);
  } catch (error) {
    console.log(error);
  }
});
