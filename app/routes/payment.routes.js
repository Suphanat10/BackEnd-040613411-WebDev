const controller = require("../controllers/payment.controller");
const { authJwt } = require("../middleware");
const bodyParser = require("body-parser");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  



  app.post(
    "/api/course/payment/createPayment",
    [authJwt.verifyToken],
    controller.create
  );

  app.post(
    "/api/course/payment/check_price",
    [authJwt.verifyToken],
    controller.check_price
  );


  app.post(
    "/api/course/payment/webhook",
    bodyParser.raw({ type: "application/json" }),
    // [authJwt.verifyToken],
    controller.webhook
  );



  


  
}