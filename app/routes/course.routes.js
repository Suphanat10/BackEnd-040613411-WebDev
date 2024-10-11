const controller = require("../controllers/course.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get(
    "/api/course/getCourseContent",
    // [authJwt.verifyToken],
    controller.get_lesson_chapter
  );

  app.get(
    "/api/course/getMyCourse",
    // [authJwt.verifyToken],
    controller.get_mycourse
  );
  
};


