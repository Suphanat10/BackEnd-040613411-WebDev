const express = require("express");
const cors = require("cors");
const app = express();
const config = require("./app/config/auth.config");

const PORT = process.env.PORT || 8080;

app.set("trust proxy", true);
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the server" });
}
);

require("./app/routes/auth.routes")(app);
require("./app/routes/exam.routes")(app);
require("./app/routes/course.routes")(app);
require("./app/routes/score.routes")(app);
require("./app/routes/upimage.routes")(app);