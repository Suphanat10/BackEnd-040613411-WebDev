const controller = require("../controllers/profile.controller");
const { authJwt } = require("../middleware");
const express = require("express");
const multer = require("multer");
const upload_profile = require("../multer_controller/multer_profile");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  
};
