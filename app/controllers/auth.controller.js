const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");


exports.delete_google = async (req, res) => {
  try {
    const user_id = req.user_id;
    const updateUser = await prisma.users_account.update({
      where: {
        user_id: user_id,
      },
      data: {
        google_id: null,
      },
    });
    res.status(200).send({
      message: "Google Account was deleted successfully!",
      code: 200,
    });
    const currentDate = new Date();
    const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "ยกเลิกการเชื่อต่อ Google Account",
        user_id: user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Some error occurred while delete the Google Account.",
      code: 500,
    });
  }
};

exports.register_by_google = async (req, res) => {
  try {
    const google_id = req.body.google_id;
    const email = req.body.google_email;
    const user_id = req.user_id;

    if (!google_id) {
      return res.status(403).send({
        message: "Google ID is required!",
        code: 403,
      });
    }

    if (!email) {
      return res.status(403).send({
        message: "Email is required!",
        code: 403,
      });
    }

    const checkGoogleId = await prisma.users_account.findFirst({
      where: {
        google_id: google_id,
      },
    });

    if (checkGoogleId) {
      return res.status(403).send({
        message: "บัญชี Google นี้ถูกใช้งานแล้ว!",
        code: 403,
      });
    }

  
    const updateUser = await prisma.users_account.update({
      where: {
        user_id: user_id,
      },
      data: {
        google_id: google_id,
        email: email,
      },

    });
    res.status(200).send({
      message: "Google Account was registered successfully!",
      code: 200,
    });
    
    const currentDate = new Date();
    const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "การเชื่อต่อ Google Account",
        user_id: user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(403).send({
      message: "Some error occurred while register the Google Account.",
      code: 403,
      
    });
  }
};

exports.login_by_google = async (req, res) => {
  try {
    const google_id = req.body.google_id;

    const user = await prisma.users_account.findFirst({
      where: {
        google_id: google_id,
      },
    });

    if (!user) {
      return res.status(404).send({
        message: "ไม่พบผู้ใช้งาน",
        code: 404,
      });
    }

    var token = jwt.sign({ id: user.user_id }, config.secret, {
      expiresIn: 86400,
    });

    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        httpOnly: false,
        sameSite: "lax",
        secure: false,
      })
      .send({
        id: user.user_id,
        name: user.prefix + user.first_name + " " + user.last_name,
        email: user.email,
        gender: user.gender,
        permission: user.permission_id,
        accessToken: token,
      });
      const currentDate = new Date();
      const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "เข้าสู่ระบบโดยใช้ Google Account",
        user_id: user.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Some error occurred while login the User.",
      code: 500,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await prisma.users_account.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(404).send({
        message: "ไม่พบผู้ใช้งาน",
        code: 404,
      });
    }

    var passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        code: 401,
        message: "Invalid Password!",
      });
    }

    var token = jwt.sign({ id: user.user_id }, config.secret, {
      expiresIn: 86400,
    });

    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        secure: false,
        httpOnly: true,
        sameSite: "lax"
      })
      .send({
        id: user.user_id,
        name: user.prefix + user.first_name + " " + user.last_name,
        email: user.email,
        gender: user.gender,
        permission: user.permission_id,
        accessToken: token,
      });
      const currentDate = new Date();
      const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
      const saveLogs = await prisma.logs.create({
      data: {
        log_description: "เข้าสู่ระบบ",
        user_id: user.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message:  "Some error occurred while login the User.",
      code: 500,
    });
  }
};

exports.register = async (req, res) => {
  try {
    const password = req.body.password;
    const username = req.body.username;
    const confirm_password = req.body.confirm_password;
    const prefix = req.body.prefix;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const gender = req.body.gender;
    const permission_id = req.body.permission_id;

    if (
      !password ||
      !username ||
      !confirm_password ||
      !prefix ||
      !first_name ||
      !last_name ||
      !email ||
      !permission_id ||
      !gender
    ) {
      return res.status(403).send({
        message: "All field is required!",
        code: 403,
      });
    }

    if (password !== confirm_password) {
      return res.status(403).send({
        message: "Password and Confirm Password are not match!",
        code: 403,
      });
    }

    const checkUsername = await prisma.users_account.findUnique({
      where: {
        username: username,
      },
    });

    if (checkUsername) {
      return res.status(403).send({
        message: "ผุ้ใช้งานนี้ถูกใช้งานแล้ว!",
        code: 403,
      });
    }

    const checkEmail = await prisma.users_account.findUnique({
      where: {
        email: email,
      },

    });

    if (checkEmail) {
      return res.status(403).send({
        message: "อีเมล์นี้ถูกใช้งานแล้ว!",
        code: 403,
      });
    }

    const createUser = await prisma.users_account.create({
      data: {
        prefix: prefix,
        first_name: first_name,
        last_name: last_name,
        email: email,
        username: username,
        password: bcrypt.hashSync(password, 8),
        permission_id: permission_id,
        gender: gender,
      },
    });

    var token = jwt.sign({ id: createUser.user_id }, config.secret, {
      expiresIn: 86400,
    });

    res
      .status(200)
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        httpOnly: false,
        sameSite: "lax",
        secure: false,
      })
      .send({
        message: "User was registered successfully!",
        id: createUser.user_id,
        name:createUser.prefix  + createUser.first_name + " " +createUser.last_name,
        email: createUser.email,
        gender: createUser.gender,
        permission: createUser.permission_id,
        accessToken: token,
      });
      const currentDate = new Date();
      const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "ลงทะเบียนผู้ใช้งานใหม่",
        user_id: createUser.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Some error occurred while creating the User.",
      code: 500,
    });
  }
};

exports.Forgot_password = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;

    let transporter = nodemailer.createTransport({
      host: 'mail.wutthiphon.space',
      port: 587,
      secure: false,
      auth: {
          user: 'project@wutthiphon.space',
          pass: '6504062620116'
        
      },
  });

    const user = await prisma.users_account.findFirst({
      where: {
        username: username,
        email: email,
      },
    });

    console.log(user.email);

    if (!user) {
      return res.status(404).send({
        message: "User Not found.",
        code: 404,
      });
    }

    const randomPassword = Math.random().toString(36).slice(-12);
    const newPassword = bcrypt.hashSync(randomPassword, 8);

    const updateUser = await prisma.users_account.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: newPassword,
      },
    });

    
    transporter.sendMail({
      from: "project@wutthiphon.space" ,
      to: user.email,
      subject: 'Reset Password',
      html: `
      <!doctype html>
      <html lang="en">
      
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300&display=swap" rel="stylesheet">
        <title>E-mail</title>
        <style media="all" type="text/css">
          /* -------------------------------------
          GLOBAL RESETS
      ------------------------------------- */
      
          body {
            font-family: "Kanit", sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: 16px;
            line-height: 1.3;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
          }
      
          table {
            border-collapse: separate;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            width: 100%;
          }
      
          table td {
            font-family: "Kanit", sans-serif;
            font-size: 16px;
            vertical-align: top;
          }
      
          /* -------------------------------------
          BODY & CONTAINER
      ------------------------------------- */
      
          body {
            background-color: #f4f5f6;
            margin: 0;
            padding: 0;
          }
      
          .body {
            background-color: #f4f5f6;
            width: 100%;
          }
      
          .container {
            margin: 0 auto !important;
            max-width: 600px;
            padding: 0;
            padding-top: 24px;
            width: 600px;
          }
      
          .content {
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
            max-width: 600px;
            padding: 0;
          }
      
          /* -------------------------------------
          HEADER, FOOTER, MAIN
      ------------------------------------- */
      
          .main {
            background: #ffffff;
            border: 1px solid #eaebed;
            border-radius: 16px;
            width: 100%;
          }
      
          .wrapper {
            box-sizing: border-box;
            padding: 24px;
          }
      
          .footer {
            clear: both;
            padding-top: 24px;
            text-align: center;
            width: 100%;
          }
      
          .footer td,
          .footer p,
          .footer span,
          .footer a {
            color: #9a9ea6;
            font-size: 16px;
            text-align: center;
          }
      
          /* -------------------------------------
          TYPOGRAPHY
      ------------------------------------- */
      
          p {
            font-family: "Kanit", sans-serif;
            font-size: 16px;
            font-weight: normal;
            margin: 0;
            margin-bottom: 16px;
          }
      
          a {
            color: #0867ec;
            text-decoration: underline;
          }
      
          /* -------------------------------------
          BUTTONS
      ------------------------------------- */
      
          .btn {
            box-sizing: border-box;
            min-width: 100% !important;
            width: 100%;
          }
      
          .btn>tbody>tr>td {
            padding-bottom: 16px;
          }
      
          .btn table {
            width: auto;
          }
      
          .btn table td {
            background-color: #ffffff;
            border-radius: 4px;
            text-align: center;
          }
      
          .btn a {
            background-color: #ffffff;
            border: solid 2px #0867ec;
            border-radius: 4px;
            box-sizing: border-box;
            color: #0867ec;
            cursor: pointer;
            display: inline-block;
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            padding: 12px 24px;
            text-decoration: none;
            text-transform: capitalize;
          }
      
          .btn-primary table td {
            background-color: #0867ec;
          }
      
          .btn-primary a {
            background-color: #0867ec;
            border-color: #0867ec;
            color: #ffffff;
          }
      
          @media all {
            .btn-primary table td:hover {
              background-color: #ec0867 !important;
            }
      
            .btn-primary a:hover {
              background-color: #ec0867 !important;
              border-color: #ec0867 !important;
            }
          }
      
          /* -------------------------------------
          OTHER STYLES THAT MIGHT BE USEFUL
      ------------------------------------- */
      
          .last {
            margin-bottom: 0;
          }
      
          .first {
            margin-top: 0;
          }
      
          .align-center {
            text-align: center;
          }
      
          .align-right {
            text-align: right;
          }
      
          .align-left {
            text-align: left;
          }
      
          .text-link {
            color: #0867ec !important;
            text-decoration: underline !important;
          }
      
          .clear {
            clear: both;
          }
      
          .mt0 {
            margin-top: 0;
          }
      
          .mb0 {
            margin-bottom: 0;
          }
      
          .preheader {
            color: transparent;
            display: none;
            height: 0;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            mso-hide: all;
            visibility: hidden;
            width: 0;
          }
      
          .powered-by a {
            text-decoration: none;
          }
      
          /* -------------------------------------
          RESPONSIVE AND MOBILE FRIENDLY STYLES
      ------------------------------------- */
      
          @media only screen and (max-width: 640px) {
      
            .main p,
            .main td,
            .main span {
              font-size: 16px !important;
            }
      
            .wrapper {
              padding: 8px !important;
            }
      
            .content {
              padding: 0 !important;
            }
      
            .container {
              padding: 0 !important;
              padding-top: 8px !important;
              width: 100% !important;
            }
      
            .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
      
            .btn table {
              max-width: 100% !important;
              width: 100% !important;
            }
      
            .btn a {
              font-size: 16px !important;
              max-width: 100% !important;
              width: 100% !important;
            }
          }
      
          /* -------------------------------------
          PRESERVE THESE STYLES IN THE HEAD
      ------------------------------------- */
      
          @media all {
            .ExternalClass {
              width: 100%;
            }
      
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
              line-height: 100%;
            }
      
            .apple-link a {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              text-decoration: none !important;
            }
      
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
              font-size: inherit;
              font-family: inherit;
              font-weight: inherit;
              line-height: inherit;
            }
          }
        </style>
      </head>
      
      <body>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
          <tr>
            <td>&nbsp;</td>
            <td class="container">
              <div class="content">
      
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
      
                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper">
                      <p><b>เปลี่ยนรหัสผ่าน</b></p>
                      <p>
                        คุณได้ทำการรีเซ็ตรหัสผ่านของคุณ<br>
                        รหัสผ่านใหม่ของคุณคือ <b>${randomPassword}</b>
                      </p>
                    
                      <p>Thank You.</p>
                    </td>
                  </tr>
      
                  <!-- END MAIN CONTENT AREA -->
                </table>
      
                <!-- START FOOTER -->
                <div class="footer">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="content-block powered-by">
                        E-Learning
                      </td>
                    </tr>
                  </table>
                </div>
      
                <!-- END FOOTER -->
      
                <!-- END CENTERED WHITE CONTAINER -->
              </div>
            </td>
            <td>&nbsp;</td>
          </tr>
        </table>
      </body>
      </html>
      `,      
      
    }, (err, info) => {
      if (err) {
          console.log(err);
      } else {
           res.status(200).send({
            message: "Send email successfully!",
            code: 200,
          });
      }
  });


  const currentDate = new Date();
  const sevenHoursAheadDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));
    const saveLogs = await prisma.logs.create({
      data: {
        log_description: "ลืมรหัสผ่าน",
        user_id: user.user_id,
        ip_address: req.ip,
        timestamp: sevenHoursAheadDate 
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Some error occurred while sending email.",
      code: 500,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.status(200).send({
      message: "User was logout successfully!",
      code: 200,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while logout the User.",
      code: 500,
    });
  }
};