const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const verifyToken = (req, res, next) => {
  const cookie = req.headers.cookie;

  if (!cookie) {
    return res.status(403).send({
      message: "No Token provided!",
    });
  }
  const arrTok = cookie.split(";").reduce((cookies, cookie) => {
    const [name, val] = cookie.split("=").map((c) => c.trim());
    cookies[name] = val;
    return cookies;
  }, {});
  const token = arrTok["accessToken"];
  if (!token) {
    return res.status(403).send({
      message: "No Token provided 2!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    req.user_id = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  const user_id = parseInt(req.user_id);
  try {
    const user = await prisma.users_account.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (user.length == 0) {
      return res.status(403).send({ message: "Require Admin Role!" });
    }
    next();
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
};

const isTutor = async (req, res, next) => {
  try {
    const user_id = parseInt(req.user_id);
    const user = await prisma.users_account.findUnique({
      where: {
        user_id: user_id,
      },
    });
    if (user.length == 0) {
      return res.status(403).send({ message: "Require Tutor Role!" });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
};

const isStudent = async (req, res, next) => {
  try {
    const user_id = parseInt(req.user_id);
    const user = await prisma.users_account.findUnique({
      where: {
        user_id: user_id,
      },
    });
    if (user.length == 0) {
      return res.status(403).send({ message: "Require Student Role!" });
    }
    next();
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
};

const SaveLogs = (log_description) => async (req, res, next) => {
  try {
    const currentDate = new Date();
    const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
   
    await prisma.logs.create({
      data: {
        log_description: log_description,
        user_id: req.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate

      },
    });
    next();
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
};

const isAdminORisTutor = async (req, res, next) => {
  try {
    const user_id = parseInt(req.user_id);
    const user = await prisma.users_account.findUnique({
      where: {
        user_id: user_id,
      },
    });

  if(user.permission_id == 1){
    return res.status(403).send({ message: "Require admin &&  Tutor" });
  }

    next();
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      code: 500,
    });
  }
}

const authJwt = {
  verifyToken,
  isAdmin,
  isTutor,
  isStudent,
  SaveLogs,
  isAdminORisTutor,
};



module.exports = authJwt;





