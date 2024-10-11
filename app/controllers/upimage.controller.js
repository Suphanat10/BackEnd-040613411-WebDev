const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



exports.upload_course = async (req, res) => {
    
    res.status(200).send({
      status: true,
      image :req.file.filename
    
    });
  };


exports.upload_profile = async (req, res) => {
    res.status(200).send({
      status: true,
      image :req.file.filename
    });
  };


  exports.upload_slip = async (req, res) => {
    res.status(200).send({
      status: true,
      image :req.file.filename
    });
  };



