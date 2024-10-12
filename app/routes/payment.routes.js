const controller = require("../controllers/payment.controller");
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
    "/api/payment/checkout",
    [authJwt.verifyToken],
    controller.checkout
  );



  


  
}