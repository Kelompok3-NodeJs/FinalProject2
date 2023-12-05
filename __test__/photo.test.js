const request = require("supertest");
const app = require("../app");
const { Photo, User } = require("../models");
const {
  authorization,
  photoAuthorization,
} = require("../middlewares/authorization");

let server;
let createdUserId;
let userToken;

const photoData = {
  poster_image_url: "https://linktoimage.com/photo.jpg",
  title: "New Photo Title",
  caption: "Testing Photo Creation",
};

const PhotoUpdate = {
  title: "New Photo Title Update",
  caption: "Testing Photo Creation Update",
  poster_image_url: "https://linktoimage.com/photoupdate.jpg",
};

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
  let registeredPhotoId;
  it("should return 201 status and create a new photo", async () => {
    const res = await request(app)
      .post("/photos")
      .set("token", userToken)
      .send(photoData)
      .expect(201);
    expect(res.body).toHaveProperty(
      "poster_image_url",
      photoData.poster_image_url
    );
    expect(res.body).toHaveProperty("title", photoData.title);
    expect(res.body).toHaveProperty("caption", photoData.caption);

    const registeredPhoto = await Photo.findOne({
      where: { caption: photoData.caption },
    });
    registeredPhotoId = registeredPhoto.id;
    console.log(registeredPhotoId);
  });

  it("should return 400 status and and error message", async () => {
    const photoData = {
      poster_image_url: "",
      title: "",
      caption: "",
    };
    const res = await request(app)
      .post("/photos")
      .set("token", userToken)
      .send(photoData)
      .expect(400);
    const expectedErrorMessages = [
      "Title cannot be empty!",
      "Caption cannot be empty!",
      "Poster image URL cannot be empty!",
      "Poster image URL format is invalid!",
    ];

    // Memeriksa apakah setiap pesan kesalahan ada dalam res.body
    expectedErrorMessages.forEach((errorMessage) => {
      expect(res.body.message).toContain(errorMessage);
    });
    expect(res.body).not.toHaveProperty("title");
    expect(res.body).not.toHaveProperty("poster_image_url");
    expect(res.body).not.toHaveProperty("caption");
  });

  it("should return 401 status for Unauthorized", async () => {
    const response = await request(app)
      .post("/photos")
      .send(photoData)
      .expect(401);
  });

  it("should return 401 status for invalid token", async () => {
    const invalidToken = "";
    const response = await request(app)
      .post("/photos")
      .set("token", invalidToken)
      .send(photoData)
      .expect(401);
  });

  it("should return 401 status for token not provided", async () => {
    const invalidToken = "";
    const response = await request(app)
      .post("/photos")
      .set("token", invalidToken)
      .send(photoData)
      .expect(401);
  });
});

describe("Get /photos", () => {
  it("should return 200 status and get all photos", async () => {
    await request(app).get("/photos").set("token", userToken).expect(200);
  });

  it("should return 401 status for invalid token", async () => {
    const invalidToken = "37124ri12uhf892383";
    const response = await request(app)
      .get("/photos")
      .set("token", invalidToken)
      .expect(401);
  });

  it("should return 401 status for Unauthenticated", async () => {
    await request(app).get("/photos").expect(401);
  });

  it("should return 401 status for token not provided", async () => {
    const Tokennotprovided = "";
    const response = await request(app)
      .get("/photos")
      .set("token", Tokennotprovided)
      .expect(401);
  });
});

describe("Put /photos", () => {
  let registeredPhotoId;

  beforeEach(async () => {
    // Menambahkan foto sebelum setiap pengujian
    const res = await request(app)
      .post("/photos")
      .set("token", userToken)
      .send(photoData)
      .expect(201);

    const registeredPhoto = await Photo.findOne({
      where: { caption: photoData.caption },
    });
    registeredPhotoId = registeredPhoto.id;
  });
  it("should return 200 status and Success Update a Photo", async () => {
    const res = await request(app)
      .put(`/photos/${registeredPhotoId}`)
      .set("token", userToken)
      .send(PhotoUpdate)
      .expect(200);

    expect(res.body).toHaveProperty("title", PhotoUpdate.title);
    expect(res.body).toHaveProperty("caption", PhotoUpdate.caption);
    expect(res.body).toHaveProperty(
      "poster_image_url",
      PhotoUpdate.poster_image_url
    );
  });

  afterEach(async () => {
    // Setelah setiap pengujian, kembalikan data foto ke kondisi sebelumnya
    await Photo.update(photoData, { where: { id: registeredPhotoId } });
  });
});

afterAll(async () => {
  try {
    await Promise.all([
      User.destroy({ where: {} }),
      Photo.destroy({ where: {} }), // Add any other model cleanup here
    ]);
  } catch (error) {
    console.log(error);
  }
});
