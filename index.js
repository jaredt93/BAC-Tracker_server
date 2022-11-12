const express = require("express");
const app = express();
const port = 443;
const jwt = require("jsonwebtoken");
const jwtSecret = "Group3KeyForJWT";
const headerTokenKey = "x-jwt-token";
const bcrypt = require("bcryptjs");
const bcryptSaltNum = 12;

app.listen(process.env.PORT || port, () => {
  console.log(`Listening on port ${port}`);
  console.log(`${process.env.PORT}`);
});

app.get("/", (req, res) => {
  //can declare get our put route, first param is the route, second param is the function that is executed
  res.send("Hello world");
});

const jwtValidateUserMiddleware = (req, res, next) => {
  console.log("validate user");

  let token = req.header(headerTokenKey);
  if (token == "LOGGING-OUT") {
    console.log("user logout");
    res.send({ message: "good to exit" });
    return;
  }

  if (token) {
    try {
      console.log("verify " + token);
      let decoded = jwt.verify(token, jwtSecret);
      req.decodedToken = decoded;
      req.customerId = decoded.customerId;
      console.log("user validated " + decoded);
      next();
    } catch (err) {
      res.status(401).send({ error: "Invalid token", fullError: err });
    }
  } else {
    res.status(401).send({ error: "Token is required" });
  }
};

app.use(express.urlencoded());
app.use(express.json());

app.post("/api/auth", async (req, res) => {
  let user = await findUser(req.body.email);
  console.log("found " + user);

  let isValidPassword = null;
  if (user) {
    isValidPassword = await bcrypt.compare(req.body.password, user.password);
    console.log("is password valid " + isValidPassword);
  }

  if (isValidPassword) {
    let token = jwt.sign(
      {
        uid: user._id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        customerId: user.customerId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        currentTime: Date.now(),
      },
      jwtSecret
    );
    console.log("generating token for " + user.firstName);
    console.log("Generated Token: " + token);

    res.send({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      city: user.city,
      readingHistory: user.readingHistory,
    });
  } else {
    res.status(401).send({ error: "You're not found" });
  }
});

app.post("/api/user/update", jwtValidateUserMiddleware, async (req, res) => {
  let updated = await updateUser(
    req.decodedToken.uid,
    req.body.firstName,
    req.body.lastName,
    req.body.gender,
    req.body.city
  );
  if (updated) {
    console.log("send successful updated response back");

    let decodedToken = req.decodedToken;

    res.send({ message: "user updated", data: { decoded: decodedToken } });
  } else {
    console.log("send failed update response back");
    res.status(401).send({ error: "user update failed" });
  }
});

const emailValidator = require("deep-email-validator"); //npm install deep-email-validator, https://www.abstractapi.com/guides/node-email-validation
async function isEmailValid(email) {
  return emailValidator.validate(email);
}

app.post("/api/signup", async (req, res) => {
  console.log("signup new user " + req.body.email);

  const { valid, reason, validators } = await isEmailValid(req.body.email);

  if (!valid && !validators[reason].reason.includes("suggested email")) {
    console.log("registration missing valid email");
    return res.status(401).send({
      message: "valid email required",
      reason: validators[reason].reason,
    });
    return;
  }

  if (null == req.body.password) {
    console.log("registration missing password");
    res.status(401).send({ error: "password required" });
    return;
  }

  if (null == req.body.firstName) {
    console.log("registration missing first name");
    res.status(401).send({ error: "first name required" });
    return;
  }

  if (null == req.body.lastName) {
    console.log("registration missing last name");
    res.status(401).send({ error: "last name required" });
    return;
  }

  if (null == req.body.gender) {
    console.log("registration missing gender");
    res.status(401).send({ error: "gender required" });
    return;
  }

  if (null == req.body.city) {
    console.log("registration missing city");
    res.status(401).send({ error: "city required" });
    return;
  }

  let userId = null;

  encryptedPassword = await getEncryptedPassword(req.body.password);
  console.log("new password: " + encryptedPassword);
});

app.post(
  "/api/logout",
  async (req, res) => {
    console.log("logout user " + req.body.email);
    delete req.headers[headerTokenKey];
    let userId;
  },
  jwtValidateUserMiddleware
);

const { MongoClient } = require("mongodb");
// Connection URI
const uri =
  "mongodb+srv://group35280:uncc2022@cluster0.rts9eht.mongodb.net/test";
const client = new MongoClient(uri);

async function createUser(email, password, firstName, lastName, gender, city) {
  try {
    await client.connect();
    const doc = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      city: city,
      readingHistory: readingHistory,
    };
    const result = await client
      .db("bacTracker")
      .collection("users")
      .insertOne(doc);
    if (result) {
      console.log("user created with id " + result.insertedId);
      return result.insertedId;
    }
  } finally {
    await client.close();
  }
}

async function findUser(email, password) {
  try {
    console.log("findUser connect to db start");
    await client.connect();

    var user = await client
      .db("bacTracker")
      .collection("users")
      .findOne({ email: email });

    if (user) {
      console.log("user is " + user.name);
      return user;
    }
  } finally {
    await client.close();
  }
}

const { ObjectId } = require("mongodb");
const { create } = require("domain");
async function updateUser(uid, firstName, lastName, gender, city, age) {
  try {
    await client.connect();

    const filter = { _id: ObjectId(uid) };
    console.log("attempt to update " + uid);
    const updateDoc = {
      $set: {
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        city: city,
        age: age,
      },
    };
    let updated = await client
      .db("users")
      .collection("user")
      .updateOne(filter, updateDoc);
    console.log("wait to update " + uid + " " + age);
    if (updated) {
      console.log("user was updated ");
      return updated;
    }
  } finally {
    await client.close();
  }
}

async function getEncryptedPassword(password) {
  const salt = await bcrypt.genSalt(bcryptSaltNum);
  console.log("using salt " + salt);
  let encryptedPassword = await bcrypt.hash(password, salt);
  console.log("password " + password + " " + encryptedPassword);

  return encryptedPassword;
}

// restarting of app, find user by email if token is valid
app.post("/api/user/find", jwtValidateUserMiddleware, async (req, res) => {
  console.log("find user by email after token validated " + req.body.email);

  let user = await findUser(req.body.email);
  console.log("found " + user);

  res.send({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    city: user.city,
  });
});
