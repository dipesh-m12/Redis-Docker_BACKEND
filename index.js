const express = require("express");
const app = express();
const cors = require("cors");
const redis = require("redis");
// const fetch = require("node-fetch"); // Ensure to install this package if you haven't already

const redisClient = redis.createClient({});

redisClient.connect().catch(console.error); // Ensure the client is connected

redisClient.on("error", (err) => {
  console.error("Redis error: ", err);
});

app.use(cors());

app.get("/", async (req, res) => {
  const cacheKey = "todos";

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache hit");
      return res.send(JSON.parse(cachedData));
    } else {
      console.log("Cache miss");
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos"
      );
      const data = await response.json();

      await redisClient.setEx(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour
      res.send(data);
    }
  } catch (err) {
    console.error("Error fetching data: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", (req, res) => {
  res.send({
    name: "Dipesh",
    age: 19,
    role: "DEV",
  });
});

app.listen(5001, () => {
  console.log("Listening on PORT 5001");
});
