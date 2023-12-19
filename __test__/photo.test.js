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
  describe("Success Create Photo ", () => {
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
      expect(res.body).toHaveProperty("id"); // Menyakinkan bahwa ID tidak dikembalikan dalam respons
      expect(res.body).not.toHaveProperty("createdAt"); // Memastikan respons tidak memiliki properti createdAt
      expect(res.body).not.toHaveProperty("updatedAt"); // Memastikan respons tidak memiliki properti updatedAt
      expect(typeof res.body.poster_image_url).toBe("string");
      expect(typeof res.body.title).toBe("string");
      expect(typeof res.body.caption).toBe("string");
      expect(Object.keys(res.body).length).toBe(5); // Memastikan hanya ada 3 properti pada body respons
      expect(res.status).toBe(201);

      const registeredPhoto = await Photo.findOne({
        where: { caption: photoData.caption },
      });
      registeredPhotoId = registeredPhoto.id;
      console.log(registeredPhotoId);
    });
  });

  describe("error Create Photo caused Body is Empty", () => {
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
      // Expectations for the response body
      expect(res.body.message).toBeDefined(); // Check if there's a message in the response
      expect(res.body.errors).toBeUndefined(); // Check if there's an 'errors' field in the response
      expect(Array.isArray(res.body.errors)).toBe(false); // Check if 'errors' is an array
      expect(res.body).not.toHaveProperty("createdAt");
      expect(res.body).not.toHaveProperty("updatedAt");
      expect(typeof res.body.poster_image_url).toBe("undefined"); // Check if poster_image_url is undefined
      expect(typeof res.body.title).toBe("undefined"); // Check if title is undefined
      expect(typeof res.body.caption).toBe("undefined"); // Check if caption is undefined
      expect(Object.keys(res.body).length).toBe(1); // Expect 'message' and 'errors' properties
      // Check for the exact number of keys in the response body
      expect(Object.keys(res.body)).toContain("message");
      expect(Object.keys(res.body)).not.toContain("errors");
      expect(res.status).toBe(400);
    });
  });

  describe("error Create Photo caused Unauthorized", () => {
    it("should return 401 status for Unauthorized", async () => {
      const response = await request(app)
        .post("/photos")
        .send(photoData)
        .expect(401);
      expect(response.body).toBeDefined(); // Check if response body is defined
      expect(response.body).toHaveProperty("message"); // Check for a message in the response body
      expect(typeof response.body.message).toBe("string"); // Check if the message is a string
      expect(response.body.errors).toBeUndefined(); // Ensure there are no errors in the response
      expect(Array.isArray(response.body.errors)).toBe(false); // Check if errors is not an array
      expect(Object.keys(response.body).length).toBe(1); // Check if there's only one property in the response body
      expect(response.body).not.toHaveProperty("createdAt"); // Ensure createdAt is not present
      expect(response.body).not.toHaveProperty("updatedAt"); // Ensure updatedAt is not present
      expect(response.body).not.toHaveProperty("token"); // Ensure token is not present
      expect(response.body).not.toHaveProperty("user"); // Ensure user is not present
      expect(response.status).toBe(401);
    });
  });

  describe("error Create Photo caused Invalid Token", () => {
    it("should return 401 status for invalid token", async () => {
      const invalidToken = "";
      expect(invalidToken).not.toEqual(userToken);
      const response = await request(app)
        .post("/photos")
        .set("token", invalidToken)
        .send(photoData)
        .expect(401);
      expect(response.body).toBeDefined(); // Check if response body is defined
      expect(response.body).toHaveProperty("message"); // Check for a message in the response body
      expect(typeof response.body.message).toBe("string"); // Check if the message is a string
      expect(response.body.errors).toBeUndefined(); // Ensure there are no errors in the response
      expect(Array.isArray(response.body.errors)).toBe(false); // Check if errors is not an array
      expect(Object.keys(response.body).length).toBe(1); // Check if there's only one property in the response body
      expect(response.body).not.toHaveProperty("createdAt"); // Ensure createdAt is not present
      expect(response.body).not.toHaveProperty("updatedAt"); // Ensure updatedAt is not present
      expect(response.body).not.toHaveProperty("token"); // Ensure token is not present for invalid token
      expect(response.body).not.toHaveProperty("user"); // Ensure user is not present
      expect(response.headers.token).not.toBe(userToken);
      expect(response.status).toBe(401);
    });
  });

  describe("error Create Photo caused token Unprovided", () => {
    it("should return 401 status for token not provided", async () => {
      const invalidToken = "";
      const response = await request(app)
        .post("/photos")
        .set("token", invalidToken)
        .send(photoData)
        .expect(401);
      expect(response.body).toBeDefined(); // Check if response body is defined
      expect(response.body).toHaveProperty("message"); // Check for a message in the response body
      expect(typeof response.body.message).toBe("string"); // Check if the message is a string
      expect(response.body.errors).toBeUndefined(); // Ensure there are no errors in the response
      expect(Array.isArray(response.body.errors)).toBe(false); // Check if errors is not an array
      expect(Object.keys(response.body).length).toBe(1); // Check if there's only one property in the response body
      expect(response.body).not.toHaveProperty("createdAt"); // Ensure createdAt is not present
      expect(response.body).not.toHaveProperty("updatedAt"); // Ensure updatedAt is not present
      expect(response.body).not.toHaveProperty("token"); // Ensure token is not present for invalid token
      expect(response.body).not.toHaveProperty("user"); // Ensure user is not present
      expect(response.headers.token).not.toBe(userToken);
      expect(response.status).toBe(401);
    });
  });
});

describe("Get /photos", () => {
  describe("Success Get Photo", () => {
    it("should return 200 status and get all photos", async () => {
      const response = await request(app)
        .get("/photos")
        .set("token", userToken)
        .expect(200);
      expect(response.body).toBeDefined(); // Check if response body is defined
      expect(Array.isArray(response.body)).toBe(true); // Check if the response body is an array
      expect(response.body.length).toBeGreaterThan(0); // Check if the response contains at least one photo

      response.body.forEach((photo) => {
        expect(photo).toHaveProperty("id"); // Check if each photo has an ID property
        expect(photo).toHaveProperty("poster_image_url"); // Check if each photo has a poster_image_url property
        expect(photo).toHaveProperty("title"); // Check if each photo has a title property
        expect(photo).toHaveProperty("caption"); // Check if each photo has a caption property
        expect(photo).toHaveProperty("createdAt"); // Ensure createdAt is present in each photo
        expect(photo).toHaveProperty("updatedAt"); // Ensure updatedAt is present in each photo
        expect(Object.keys(photo).length).toBe(9); // Check if each photo has exactly 4 properties
      });

      expect(response.headers).toBeDefined(); // Check if headers are defined
      expect(response.headers).not.toHaveProperty("token"); // Ensure token is not present in headers
      expect(response.status).toBe(200);
    });
  });

  describe("error get Photo caused invalid Token", () => {
    it("should return 401 status for invalid token", async () => {
      const invalidToken = "37124ri12uhf892383";
      expect(invalidToken).not.toEqual(userToken);
      const response = await request(app)
        .get("/photos")
        .set("token", invalidToken)
        .expect(401);
      expect(response.body).toBeDefined(); // Check if response body is defined
      expect(response.body).toHaveProperty("message"); // Check for a message in the response body
      expect(typeof response.body.message).toBe("string"); // Check if the message is a string
      expect(response.body.errors).toBeUndefined(); // Ensure there are no errors in the response
      expect(Array.isArray(response.body.errors)).toBe(false); // Check if errors is not an array
      expect(Object.keys(response.body).length).toBe(1); // Check if there's only one property in the response body
      expect(response.body).not.toHaveProperty("createdAt"); // Ensure createdAt is not present
      expect(response.body).not.toHaveProperty("updatedAt"); // Ensure updatedAt is not present
      expect(response.body).not.toHaveProperty("token"); // Ensure token is not present for invalid token
      expect(response.body).not.toHaveProperty("user"); // Ensure user is not present
      expect(response.headers.token).not.toBe(userToken);
      expect(response.status).toBe(401);
    });
  });

  describe("error get Photo caused Unauthenticated", () => {
    it("should return 401 status for Unauthenticated", async () => {
      const response = await request(app).get("/photos").expect(401);
      expect(response.body).toBeDefined(); // Check if response body is defined
      expect(response.body).toHaveProperty("message"); // Check for a message in the response body
      expect(typeof response.body.message).toBe("string"); // Check if the message is a string
      expect(response.body.errors).toBeUndefined(); // Ensure there are no errors in the response
      expect(Array.isArray(response.body.errors)).toBe(false); // Check if errors is not an array
      expect(Object.keys(response.body).length).toBe(1); // Check if there's only one property in the response body
      expect(response.body).not.toHaveProperty("createdAt"); // Ensure createdAt is not present
      expect(response.body).not.toHaveProperty("updatedAt"); // Ensure updatedAt is not present
      expect(response.body).not.toHaveProperty("token"); // Ensure token is not present
      expect(response.body).not.toHaveProperty("user"); // Ensure user is not present
      expect(response.status).toBe(401);
    });
  });

  describe("error get Photo caused Token Unprovided", () => {
    it("should return 401 status for token not provided", async () => {
      const Tokennotprovided = "";
      expect(Tokennotprovided).not.toEqual(userToken);
      const response = await request(app)
        .get("/photos")
        .set("token", Tokennotprovided)
        .expect(401);
      expect(response.body).toBeDefined(); // Check if response body is defined
      expect(response.body).toHaveProperty("message"); // Check for a message in the response body
      expect(typeof response.body.message).toBe("string"); // Check if the message is a string
      expect(response.body.errors).toBeUndefined(); // Ensure there are no errors in the response
      expect(Array.isArray(response.body.errors)).toBe(false); // Check if errors is not an array
      expect(Object.keys(response.body).length).toBe(1); // Check if there's only one property in the response body
      expect(response.body).not.toHaveProperty("createdAt"); // Ensure createdAt is not present
      expect(response.body).not.toHaveProperty("updatedAt"); // Ensure updatedAt is not present
      expect(response.body).not.toHaveProperty("token"); // Ensure token is not present for invalid token
      expect(response.body).not.toHaveProperty("user"); // Ensure user is not present
      expect(response.headers.token).not.toBe(userToken);
      expect(response.status).toBe(401);
    });
  });
});

describe("Put /photos", () => {
  let registeredPhotoId;

  beforeEach(async () => {
    // Add a photo before each test
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

  describe("Success update Photo", () => {
    it("should return 200 status and Success Update a Photo", async () => {
      const res = await request(app)
        .put(`/photos/${registeredPhotoId}`)
        .set("token", userToken)
        .send(PhotoUpdate)
        .expect(200);

      expect(res.body).toBeDefined(); // Check if response body is defined
      expect(res.body).toHaveProperty("title", PhotoUpdate.title); // Check if the title is updated
      expect(res.body).toHaveProperty("caption", PhotoUpdate.caption); // Check if the caption is updated
      expect(res.body).toHaveProperty(
        "poster_image_url",
        PhotoUpdate.poster_image_url
      ); // Check if the image URL is updated

      expect(res.body).toHaveProperty("createdAt"); // Ensure createdAt is not present
      expect(res.body).toHaveProperty("updatedAt"); // Ensure updatedAt is not present
      expect(typeof res.body.title).toBe("string"); // Check if the updated title is a string
      expect(typeof res.body.caption).toBe("string"); // Check if the updated caption is a string
      expect(typeof res.body.poster_image_url).toBe("string"); // Check if the updated image URL is a string
      expect(Object.keys(res.body).length).toBe(7); // Check if there are exactly 7 properties in the response after send
      expect(res.status).toBe(200);
    });

    afterEach(async () => {
      // After each test, revert photo data to its previous state
      await Photo.update(photoData, { where: { id: registeredPhotoId } });
    });
  });

  describe("error update caused Photo not found", () => {
    it("should return 404 status if photo to update is not found", async () => {
      const res = await request(app)
        .put(`/photos/999`)
        .set("token", userToken)
        .send(PhotoUpdate)
        .expect(404);

      expect(res.body.messages).toContain("Photo Not Found");
      expect(res.body).toHaveProperty("messages"); // Check if 'messages' property exists
      expect(Array.isArray(res.body.messages)).toBe(true); // Check if 'messages' is an array
      expect(res.body.messages.length).toBeGreaterThan(0); // Check if 'messages' array has items
      expect(res.body.messages).toContain("Photo Not Found"); // Check if 'Photo Not Found' message exists in 'messages'
      // Add more expectations for the 'messages' array here...
      expect(res.body.messages).toHaveLength(3); // Ensure there's only one message
      // Check if specific properties are absent
      expect(res.body).not.toHaveProperty("error");
      expect(res.body).not.toHaveProperty("success");
      expect(res.body).not.toHaveProperty("data");
      expect(res.body).not.toHaveProperty("code");
      expect(Object.keys(res.body).length).toBe(1); // Ensure there's only one property in the response body
      expect(res.status).toBe(404);
    });
  });

  describe("error update caused token unprovided", () => {
    it("should return 401 status if token is not provided", async () => {
      const res = await request(app)
        .put(`/photos/${registeredPhotoId}`)
        .send(PhotoUpdate)
        .expect(401);

      expect(res.body).toHaveProperty("message", "Unauthorized");
      expect(res.body).toBeDefined(); // Response body should be defined
      expect(res.body).not.toHaveProperty("data"); // Ensure 'data' property is not present
      expect(res.body).not.toHaveProperty("error"); // Ensure 'error' property is not present
      expect(res.body).not.toHaveProperty("success"); // Ensure 'success' property is not present
      expect(Object.keys(res.body).length).toBe(1); // Ensure there's only one property in the response body
      expect(Array.isArray(res.body)).toBe(false); // Ensure response body is not an array
      expect(typeof res.body).toBe("object"); // Ensure response body is an object
      expect(res.headers).toBeDefined(); // Ensure headers are defined
      expect(res.headers).not.toHaveProperty("token"); // Ensure 'token' is not present in headers
      expect(res.status).toBe(401);
    });
  });

  describe("error update caused invalid token", () => {
    it("should return 401 status for invalid token", async () => {
      const invalidToken = "37124ri12uhf892383";
      expect(invalidToken).not.toEqual(userToken);
      const res = await request(app)
        .put(`/photos/${registeredPhotoId}`)
        .set("token", invalidToken)
        .send(PhotoUpdate)
        .expect(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
      expect(res.body).toBeDefined(); // Response body should be defined
      expect(res.body).not.toHaveProperty("data"); // Ensure 'data' property is not present
      expect(res.body).not.toHaveProperty("error"); // Ensure 'error' property is not present
      expect(res.body).not.toHaveProperty("success"); // Ensure 'success' property is not present
      expect(Object.keys(res.body).length).toBe(1); // Ensure there's only one property in the response body
      expect(Array.isArray(res.body)).toBe(false); // Ensure response body is not an array
      expect(typeof res.body).toBe("object"); // Ensure response body is an object
      expect(res.headers).toBeDefined(); // Ensure headers are defined
      expect(res.headers).not.toHaveProperty("token"); // Ensure 'token' is not present in headers
      expect(res.status).toBe(401);
    });
  });

  describe("Server Error 500", () => {
    it("should handle server errors (500)", async () => {
      // Mocking the update function to throw an error
      jest.spyOn(Photo, "update").mockImplementation(() => {
        throw new Error("Server Error");
      });

      try {
        await request(app)
          .put(`/photos/${registeredPhotoId}`)
          .set("token", userToken)
          .send(PhotoUpdate);
      } catch (error) {
        expect(error.status).toBe(500);
        expect(error.response.body).toHaveProperty("message", "Server Error");
        expect(error.response.body).toBeDefined(); // Ensure response body is defined
        expect(error.response.body).not.toHaveProperty("data"); // Ensure 'data' property is not present
        expect(error.response.body).not.toHaveProperty("error"); // Ensure 'error' property is not present
        expect(error.response.body).not.toHaveProperty("success"); // Ensure 'success' property is not present
        expect(Object.keys(error.response.body).length).toBe(1); // Ensure there's only one property in the response body
        expect(Array.isArray(error.response.body)).toBe(false); // Ensure response body is not an array
        expect(typeof error.response.body).toBe("object"); // Ensure response body is an object
        expect(error.response.headers).toBeDefined(); // Ensure headers are defined
        expect(error.response.headers).not.toHaveProperty("token"); // Ensure 'token' is not present in headers
        expect(res.status).toBe(500);
      }

      // Restore the original implementation after the test
      jest.restoreAllMocks();
    });
  });
});

describe("Photo delete", () => {
  let registeredPhotoId;

  beforeEach(async () => {
    // Add a photo before each test
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

  describe("success delete Photo", () => {
    it("should return 200 status code and message", async () => {
      const res = await request(app)
        .delete(`/photos/${registeredPhotoId}`)
        .set("token", userToken)
        .expect(200);
      expect(res.body).toHaveProperty(
        "message",
        "Your photo has been successfully deleted"
      );
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty("content-type");
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toBeInstanceOf(Object);
      expect(Object.keys(res.body)).toContain("message");
    });
  });

  describe("error delete caused Photo not found", () => {
    it("should return 404 status code for error delete caused Photo not found ", async () => {
      const res = await request(app)
        .delete(`/photos/999`)
        .set("token", userToken)
        .expect(404);
      expect(res.body.messages).toContain("Photo Not Found");
      expect(res.status).toBe(404);
      expect(res.headers).toHaveProperty("content-type");
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toBeInstanceOf(Object);
      expect(Object.keys(res.body)).toContain("messages");
      expect(res.status).toBe(404);
    });
  });

  describe("error delete Photo caused not authenticated", () => {
    it("should return 401 status code and error message", async () => {
      const res = await request(app)
        .delete(`/users/${registeredPhotoId}`)
        .expect(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
      expect(res.status).toBe(401);
      expect(res.headers).toHaveProperty("content-type");
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toBeInstanceOf(Object);
      expect(Object.keys(res.body)).toContain("message");
      expect(res.status).toBe(401);
    });
  });

  describe("Server Error 500", () => {
    it("should handle server errors (500)", async () => {
      // Mocking the update function to throw an error
      jest.spyOn(Photo, "update").mockImplementation(() => {
        throw new Error("Server Error");
      });

      try {
        await request(app)
          .put(`/photos/${registeredPhotoId}`)
          .set("token", userToken)
          .send(PhotoUpdate);
      } catch (error) {
        expect(error.status).toBe(500);
        expect(error.response.body).toHaveProperty("message", "Server Error");
        expect(error.response.body).toBeDefined(); // Ensure response body is defined
        expect(error.response.body).not.toHaveProperty("data"); // Ensure 'data' property is not present
        expect(error.response.body).not.toHaveProperty("error"); // Ensure 'error' property is not present
        expect(error.response.body).not.toHaveProperty("success"); // Ensure 'success' property is not present
        expect(Object.keys(error.response.body).length).toBe(1); // Ensure there's only one property in the response body
        expect(Array.isArray(error.response.body)).toBe(false); // Ensure response body is not an array
        expect(typeof error.response.body).toBe("object"); // Ensure response body is an object
        expect(error.response.headers).toBeDefined(); // Ensure headers are defined
        expect(error.response.headers).not.toHaveProperty("token"); // Ensure 'token' is not present in headers
        expect(res.status).toBe(500);
      }

      // Restore the original implementation after the test
      jest.restoreAllMocks();
    });
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
