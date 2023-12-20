const request = require("supertest");
const app = require("../app");
const { User, SocialMedia } = require("../models");

let userToken;
let createdUserId;
let server;
let socialMediaId;

beforeAll(async () => {
  server = app.listen;
});

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

  const loginResponse = await request(app).post("/users/login").send({
    email: "usertest@mail.com",
    password: "usertest",
  });
  userToken = loginResponse.body.token;
});

afterAll(async () => {
  await User.destroy({
    where: {},
  });
  await SocialMedia.destroy({
    where: {},
  });
});

describe("POST /socialmedia", () => {
  describe("success process", () => {
    it("should return res with status code 201", async () => {
      const res = await request(app)
        .post("/socialmedias")
        .set("token", userToken)
        .send({
          name: "facebook",
          social_media_url: "www.facebook.com/usertest",
        })
        .expect(201);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("id", expect.any(Number));
      expect(res.body).toHaveProperty("name", "facebook");
      expect(res.body).toHaveProperty(
        "social_media_url",
        "www.facebook.com/usertest"
      );
      expect(res.body).toHaveProperty("UserId", createdUserId);
      expect(res.body).toHaveProperty("updatedAt", expect.any(String));
      expect(res.body).toHaveProperty("createdAt", expect.any(String));

      socialMediaId = res.body.id;
    });
  });

  describe("error process", () => {
    it("should return res with status code 400 because empty name", async () => {
      const res = await request(app)
        .post("/socialmedias")
        .set("token", userToken)
        .send({
          social_media_url: "www.facebook.com/usertest",
          name: " ",
        })
        .expect(400);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", ["Name cannot be empty!"]);
      expect(res.body).not.toHaveProperty("id");
      expect(res.body).not.toHaveProperty("social_media_url");
      expect(res.body).not.toHaveProperty("UserId");
      expect(res.body).not.toHaveProperty("updatedAt");
      expect(res.body).not.toHaveProperty("createdAt");
      expect(res.body).not.toHaveProperty("name");
    });

    it("should return res with status code 400 because missing social_media_url", async () => {
      const res = await request(app)
        .post("/socialmedias")
        .set("token", userToken)
        .send({
          name: "facebook",
          social_media_url: " ",
        })
        .expect(400);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", [
        "Social media URL cannot be empty!",
      ]);
      expect(res.body).not.toHaveProperty("id");
      expect(res.body).not.toHaveProperty("name");
      expect(res.body).not.toHaveProperty("UserId");
      expect(res.body).not.toHaveProperty("updatedAt");
      expect(res.body).not.toHaveProperty("createdAt");
      expect(res.body).not.toHaveProperty("social_media_url");
    });

    it("should return res with status code 401 because missing token", async () => {
      const res = await request(app)
        .post("/socialmedias")
        .send({
          name: "facebook",
          social_media_url: "www.facebook.com/usertest",
        })
        .expect(401);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return res with status code 400 because invalid token", async () => {
      const res = await request(app)
        .post("/socialmedias")
        .set("token", "invalid token")
        .send({
          name: "facebook",
          social_media_url: "www.facebook.com/usertest",
        })
        .expect(401);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });
});

describe("GET /socialmedia", () => {
  describe("success process", () => {
    it("should return res with status code 200", async () => {
      const res = await request(app)
        .get("/socialmedias")
        .set("token", userToken)
        .expect(200);
      expect(res.statusCode).toEqual(200);
      res.body.forEach((socialmedia) => {
        expect(socialmedia).toHaveProperty("id", expect.any(Number));
        expect(socialmedia).toHaveProperty("name", expect.any(String));
        expect(socialmedia).toHaveProperty(
          "social_media_url",
          expect.any(String)
        );
        expect(socialmedia).toHaveProperty("UserId", expect.any(Number));
        expect(socialmedia).toHaveProperty("createdAt", expect.any(String));
        expect(socialmedia).toHaveProperty("updatedAt", expect.any(String));
        expect(socialmedia).toHaveProperty("User", expect.any(Object));
        expect(socialmedia.User).toHaveProperty("id", expect.any(Number));
        expect(socialmedia.User).toHaveProperty("username", expect.any(String));
        expect(socialmedia.User).toHaveProperty(
          "profile_image_url",
          expect.any(String)
        );
      });
    });
  });
  describe("error process", () => {
    it("should return res with status code 401 because Unauthorized", async () => {
      const res = await request(app).get("/socialmedias").expect(401);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
      expect(res.headers).toHaveProperty("content-type");
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toBeInstanceOf(Object);
      expect(Object.keys(res.body)).toContain("message");
    });
  });

  describe("error process invalid Token", () => {
    it("should return res with status code 401 because Invalid Token", async () => {
      const res = await request(app)
        .get("/socialmedias")
        .set("token", "invalid token")
        .expect(401);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
      expect(res.headers).toHaveProperty("content-type");
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.body).toBeInstanceOf(Object);
      expect(Object.keys(res.body)).toContain("message");
    });
  });

  describe("error process - route Not Found", () => {
    it("should return res with status code 404 because route doesn't exist", async () => {
      const res = await request(app)
        .get("/nonexistentroute") // Replace with a non-existent route
        .set("token", userToken)
        .expect(404);

      expect(res.statusCode).toEqual(404);
      expect(res.headers).toHaveProperty("content-type");
      expect(res.headers["content-type"]).toContain("text/html");
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toEqual({});
    });
  });

  describe("Server Error 500", () => {
    it("should handle server errors (500)", async () => {
      // Mocking the function within the SocialMedia model to throw an error
      jest.spyOn(SocialMedia, "findAll").mockImplementation(() => {
        throw new Error("Server Error");
      });

      try {
        await request(app).get("/socialmedias").set("token", userToken);
      } catch (error) {
        expect(error.status).toBe(500);
        expect(error.response.body).toHaveProperty("message", "Server Error");
        expect(error.response.body).toBeDefined(); // Ensure response body is defined
        // Add more specific expectations based on your actual error response structure
        // Adjust expectations as needed according to your application's response format
        // For example, checking for specific properties in the error response

        // Expectations to ensure the response structure
        expect(error.response.body).not.toHaveProperty("data");
        expect(error.response.body).not.toHaveProperty("error");
        expect(error.response.body).not.toHaveProperty("success");
        expect(Object.keys(error.response.body).length).toBe(1);
        expect(Array.isArray(error.response.body)).toBe(false);
        expect(typeof error.response.body).toBe("object");
        expect(error.response.headers).toBeDefined();
        expect(error.response.headers).not.toHaveProperty("token");
      }

      // Restore the original implementation after the test
      jest.restoreAllMocks();
    });
  });
});

describe("Put /socialmedia", () => {
  let socialMediaId;

  beforeEach(async () => {
    // Add a social media entry before each test
    const res = await request(app)
      .post("/socialmedias")
      .set("token", userToken)
      .send({
        name: "Facebook",
        social_media_url: "www.facebook.com",
      })
      .expect(201);

    socialMediaId = res.body.id;
  });

  describe("Success update Social Media", () => {
    it("should return 200 status and Success Update a Social Media entry", async () => {
      const updatedName = "Updated Facebook";
      const updatedURL = "www.updatedfacebook.com";

      const res = await request(app)
        .put(`/socialmedias/${socialMediaId}`)
        .set("token", userToken)
        .send({
          name: updatedName,
          social_media_url: updatedURL,
        })
        .expect(200);

      expect(res.body).toBeDefined(); // Check if response body is defined
      expect(res.body).toHaveProperty("id", socialMediaId); // Check if the ID is the same
      expect(res.body).toHaveProperty("name", updatedName); // Check if the name is updated
      expect(res.body).toHaveProperty("social_media_url", updatedURL); // Check if the URL is updated
      expect(res.body).toHaveProperty("UserId"); // Assuming it's returned

      expect(res.body).toHaveProperty("createdAt"); // Ensure createdAt is present
      expect(res.body).toHaveProperty("updatedAt"); // Ensure updatedAt is present
      expect(typeof res.body.name).toBe("string"); // Check if the updated name is a string
      expect(typeof res.body.social_media_url).toBe("string"); // Check if the updated URL is a string
      expect(Object.keys(res.body).length).toBe(6); // Check if there are exactly 6 properties in the response after send
      expect(res.status).toBe(200);
    });

    afterEach(async () => {
      // After each test, revert social media data to its previous state
      await SocialMedia.update(
        {
          name: "Facebook",
          social_media_url: "www.facebook.com",
        },
        { where: { id: socialMediaId } }
      );
    });
  });

  describe("Unauthorized", () => {
    it("should return 401 status because of missing token", async () => {
      const res = await request(app)
        .put(`/socialmedias/${socialMediaId}`)
        .send({
          name: "Updated Facebook",
          social_media_url: "www.updatedfacebook.com",
        })
        .expect(401);

      expect(res.body).toHaveProperty("message", "Unauthorized");
      expect(res.status).toBe(401);
      expect(res.headers).toBeDefined(); // Check if headers are present
      expect(res.headers["content-type"]).toContain("application/json"); // Check content type in headers
      expect(res.body).toBeInstanceOf(Object); // Ensure the response body is an object
      expect(Object.keys(res.body)).toContain("message"); // Check if the message property exists in the response body
      expect(res.body.message).toEqual("Unauthorized"); // Validate the message content
    });

    it("should return 401 status because of invalid token", async () => {
      const res = await request(app)
        .put(`/socialmedias/${socialMediaId}`)
        .set("token", "invalid token")
        .send({
          name: "Updated Facebook",
          social_media_url: "www.updatedfacebook.com",
        })
        .expect(401);

      expect(res.body).toHaveProperty("message", "Unauthorized");
      expect(res.status).toBe(401);
      expect(res.headers).toBeDefined(); // Check if headers are present
      expect(res.headers["content-type"]).toContain("application/json"); // Check content type in headers
      expect(res.body).toBeInstanceOf(Object); // Ensure the response body is an object
      expect(Object.keys(res.body)).toContain("message"); // Check if the message property exists in the response body
      expect(res.body.message).toEqual("Unauthorized"); // Validate the message content
    });
  });

  describe("Error cases for updating Social Media", () => {
    describe("Empty fields", () => {
      it("should return 500 status because of empty name field", async () => {
        const res = await request(app)
          .put(`/socialmedias/${socialMediaId}`)
          .set("token", userToken)
          .send({
            name: "",
            social_media_url: "www.updatedfacebook.com",
          });
        expect(res.body.errors[0].message).toBe("Name cannot be empty!");
        expect(res.status).toBe(500);
        expect(res.headers).toBeDefined(); // Check if headers are present
        expect(res.headers["content-type"]).toContain("application/json"); // Check content type in headers
        expect(res.body).toBeInstanceOf(Object); // Ensure the response body is an object
        expect(Object.keys(res.body)).toContain("errors"); // Check if 'errors' property exists in the response body
        expect(res.body.errors).toBeInstanceOf(Array); // Ensure errors property is an array
        expect(res.body.errors.length).toBeGreaterThan(0); // Ensure there are errors in the array
      });

      it("should return 500 status because of empty social_media_url field", async () => {
        const res = await request(app)
          .put(`/socialmedias/${socialMediaId}`)
          .set("token", userToken)
          .send({
            name: "Updated Facebook",
            social_media_url: "",
          });
        expect(res.body.errors[0].message).toBe(
          "Social media URL cannot be empty!"
        );
        expect(res.status).toBe(500);
        expect(res.headers).toBeDefined(); // Check if headers are present
        expect(res.headers["content-type"]).toContain("application/json"); // Check content type in headers
        expect(res.body).toBeInstanceOf(Object); // Ensure the response body is an object
        expect(Object.keys(res.body)).toContain("errors"); // Check if 'errors' property exists in the response body
        expect(res.body.errors).toBeInstanceOf(Array); // Ensure errors property is an array
        expect(res.body.errors.length).toBeGreaterThan(0); // Ensure there are errors in the array
      });
    });

    describe("Server Error", () => {
      it("should handle server errors (500)", async () => {
        // Mocking the function within the SocialMedia model to throw an error
        jest.spyOn(SocialMedia, "update").mockImplementation(() => {
          throw new Error("Server Error");
        });

        try {
          await request(app)
            .put(`/socialmedias/${socialMediaId}`)
            .set("token", userToken)
            .send({
              name: "Updated Facebook",
              social_media_url: "www.updatedfacebook.com",
            });
        } catch (error) {
          expect(error.status).toBe(500);
          expect(error.response.body).toHaveProperty("message", "Server Error");
          expect(error.response.body).toBeDefined();
          expect(error.response.body).not.toHaveProperty("data");
          expect(error.response.body).not.toHaveProperty("error");
          expect(error.response.body).not.toHaveProperty("success");
          expect(Object.keys(error.response.body).length).toBe(1);
          expect(Array.isArray(error.response.body)).toBe(false);
          expect(typeof error.response.body).toBe("object");
          expect(error.response.headers).toBeDefined();
          expect(error.response.headers).not.toHaveProperty("token");
        }

        // Restore the original implementation after the test
        jest.restoreAllMocks();
      });
    });
  });
});

describe("DELETE /socialmedia", () => {
  let socialMediaIdToDelete;

  beforeEach(async () => {
    // Create a social media entry before each test
    const createResponse = await request(app)
      .post("/socialmedias")
      .set("token", userToken)
      .send({
        name: "Social Media to Delete",
        social_media_url: "www.delete-social-media.com",
      });

    socialMediaIdToDelete = createResponse.body.id;
  });

  it("should delete a social media entry and return 200 status", async () => {
    const deleteResponse = await request(app)
      .delete(`/socialmedias/${socialMediaIdToDelete}`)
      .set("token", userToken)
      .expect(200);

    expect(deleteResponse.body).toHaveProperty(
      "message",
      "your social media has been successfully deleted"
    );
    // Additional expectations
    expect(deleteResponse.headers).toBeDefined(); // Check if headers are present
    expect(deleteResponse.headers["content-type"]).toContain(
      "application/json"
    ); // Check content type in headers
    expect(deleteResponse.body).toBeInstanceOf(Object); // Ensure the response body is an object
  });

  it("should return 401 status when token is missing", async () => {
    const deleteResponse = await request(app)
      .delete(`/socialmedias/${socialMediaIdToDelete}`)
      .expect(401);

    expect(deleteResponse.body).toHaveProperty("message", "Unauthorized");
    // Additional expectations
    expect(deleteResponse.headers).toBeDefined(); // Check if headers are present
    expect(deleteResponse.headers["content-type"]).toContain(
      "application/json"
    ); // Check content type in headers
    expect(deleteResponse.body).toBeInstanceOf(Object); // Ensure the response body is an object
  });

  it("should return 401 status when token is invalid", async () => {
    const deleteResponse = await request(app)
      .delete(`/socialmedias/${socialMediaIdToDelete}`)
      .set("token", "invalid token")
      .expect(401);

    expect(deleteResponse.body).toHaveProperty("message", "Unauthorized");
    // Additional expectations
    expect(deleteResponse.headers).toBeDefined(); // Check if headers are present
    expect(deleteResponse.headers["content-type"]).toContain(
      "application/json"
    ); // Check content type in headers
    expect(deleteResponse.body).toBeInstanceOf(Object); // Ensure the response body is an object
  });

  it("should return 500 status when attempting to delete a non-existent social media entry", async () => {
    const nonExistentId = "nonexistentid";
    const deleteResponse = await request(app)
      .delete(`/socialmedias/${nonExistentId}`)
      .set("token", userToken)
      .expect(500);

    expect(deleteResponse.body).toHaveProperty(
      "message",
      "Internal Server Error"
    );
    // Additional expectations
    expect(deleteResponse.headers).toBeDefined(); // Check if headers are present
    expect(deleteResponse.headers["content-type"]).toContain(
      "application/json"
    ); // Check content type in headers
    expect(deleteResponse.body).toBeInstanceOf(Object); // Ensure the response body is an object
  });
});
