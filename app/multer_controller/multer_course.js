var path = require('path')
const multer = require("multer");
var __basedir = "./app/";
const maxSize = 25 * 1024 * 1024;

function makeid(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "image/course");
  },
  filename: (req, file, cb) => {
    if (file.originalname) {
      cb(null, `${Date.now() + makeid(8)}_Course${path.extname(file.originalname)}`);
    } else {
      cb(null, `${Date.now() + makeid(8)}_E-Learning_IMG.jpeg`);
    }
  },
});


var upload_course = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: imageFilter,
});
module.exports = upload_course;