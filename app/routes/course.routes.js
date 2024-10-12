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

  app.post(
    "/api/course/createCourse",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("สร้างคอร์สเรียนใหม่"),
    controller.create
  );

  app.post(
    "/api/course/createLesson",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("สร้างบทเรียนใหม่"),
    controller.course_lesson
  );

  app.post(
    "/api/course/createContent",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("สร้างเนื้อหาบทเรียนใหม่"),
    controller.course_lesson_content
  );

  app.get("/api/course/getCourse",
   controller.get_course);

  app.get(
    "/api/course/getCourseContent/:id",
    [authJwt.verifyToken],
    controller.get_lesson_chapter
  );
  //

  app.get(
    "/api/course/getCourse/course/:id",
    [authJwt.verifyToken],
    controller.get_course_by_id
  );
//
  app.post(
    "/api/course/updateCourse",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("เเก้ไขคอร์สเรียน"),
    controller.update_course
  );

  app.post(
    "/api/course/updateLesson",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("เเก้ไขบทเรียน"),
    controller.update_lesson
  );

  app.post(
    "/api/course/updateContent",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("เเก้ไขเนื้อหาบทเรียน"),
    controller.update_content
  );

  app.delete(
    "/api/course/delete/course_lesson/:id",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("ลบบทเรียน"),
    controller.delete_course_lesson
  );

  app.delete(
    "/api/course/delete/course_content/:id",
    [authJwt.verifyToken , authJwt.isTutor],
    authJwt.SaveLogs("ลบเนื้อหาบทเรียน"),
    controller.delete_content
  );

  app.post(
    "/api/course/registerCourse",
    [authJwt.verifyToken, authJwt.isStudent],
    authJwt.SaveLogs("ลงทะเบียนคอร์สเรียน"),
    controller.regis_course
  );

  app.get(
    "/api/course/mycourse",
    [authJwt.verifyToken],
    controller.get_mycourse
  );

  app.get(
    "/api/course/lesson/:course_id",
    [authJwt.verifyToken],
    controller.get_course_lesson
  );

  app.get(
    "/api/course/lesson/content/:course_id",
    [authJwt.verifyToken],
    controller.get_course_lesson_by_course_id
  );

  app.get(
    "/api/course/lesson/content_student/:lesson_id",
    [authJwt.verifyToken],
    controller.get_Content_study
  );


app.delete(
  "/api/course/deleteCourse/:id",
  [authJwt.verifyToken , authJwt.isTutor],
  authJwt.SaveLogs("ลบคอร์สเรียน"),
  controller.delete_course
);
};