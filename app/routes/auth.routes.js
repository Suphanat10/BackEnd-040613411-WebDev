const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/login", controller.login);
  app.post("/api/register", controller.register);
  app.post(
    "/api/profile/google",
    [authJwt.verifyToken],
    controller.register_by_google
  );

  app.post(
    "/api/profile/delete/google",
    [authJwt.verifyToken],
    controller.delete_google
  );

  app.post("/api/login/google", controller.login_by_google);

  app.post("/api/logout",
    
   controller.logout);

  app.post("/api/auth/forgotPassword", controller.Forgot_password);

};