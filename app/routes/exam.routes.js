const controller = require("../controllers/exam.controller");
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
    "/api/course/exam/getExam/question/:exam_id",
    // [authJwt.verifyToken],
    controller.get_exam_question_choice_by_exam
  );

  app.get(
    "/api/course/getExam_student/:course_id",
    // [authJwt.verifyToken],
    controller.get_exam
  );


  




};
