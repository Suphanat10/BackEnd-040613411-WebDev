const { PrismaClient } = require("@prisma/client");
const e = require("express");
const prisma = new PrismaClient();
const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
const stripe = Stripe(
  "sk_test_51Q8ubq03aiNqpbdkPSeTczO0ePZPmwHCVsJrvBRdVBnDZl0VtOG5m7TLbUQkpMBABOMVrdUGydAJHWRMtvmt3SS30001SJEo2b"
);

exports.create = async (req, res) => {
  const course = req.body.course;
  const use_promotion = req.body.use_promotion;
  if (use_promotion == true) {
    const course_ = await prisma.course_reg.findMany({
      where: {
        user_id: course.user_id,
      },
      include: {
        course: true,
      },
    });

    if (course_ && course_.length >= 3) {
      course.cost = course.cost - course.cost * 0.3;
    } else if (course_ && course_.length >= 4) {
      course.cost = course.cost - course.cost * 0.4;
    } else if (course_ && course_.length >= 5) {
      course.cost = course.cost - course.cost * 0.5;
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["promptpay"],
      line_items: [
        {
          price_data: {
            currency: "THB",
            product_data: {
              name: course.course_name,
            },
            unit_amount: course.cost * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://demos.wutthiphon.space/lab/ubuntu/serv/90/?payment=success",
      cancel_url: "https://demos.wutthiphon.space/lab/ubuntu/serv/90/?payment=reject",
      metadata: {
        user_id: req.user_id,
        course_id: course.course_id,
      },
    });

    res.send({
      sessionId: session.id,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

exports.check_price = async (req, res) => {
  const user_id = req.user_id;
  const course = req.body.course;
  try {
    if (!course) {
      return res.status(400).send({
        message: "course is required",
        code: 400,
      });
    }
    
    //เเก้เอาเฉพาะคอร์สเรียนที่เสียเงิน ตรวจสอบใหม่ ไม่นับคอร์สเรียนฟรี
    
    const course_ = await prisma.course_reg.findMany({
      where: {
        user_id: user_id,
        course: {
          course_visibility: true,
        }
      },
      include: {
        course: true,
      }
    })
    
    let prommotion_status = false;
    if (course_ && course_.length >= 3) {
      course.cost = course.cost - course.cost * 0.3;
      prommotion_status = true;
    } else if (course_ && course_.length >= 4) {
      course.cost = course.cost - course.cost * 0.4;
      prommotion_status = true;
    } else if (course_ && course_.length >= 5) {
      course.cost = course.cost - course.cost * 0.5;
      prommotion_status = true;
    }

    res.status(200).send({
      status: prommotion_status,
      price: course.cost,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};

exports.webhook = async (req, res) => {
  if (req.body.data.object.metadata) {
    await prisma.course_reg.create({
      data: {
        user_id: Number(req.body.data.object.metadata.user_id),
        course_id: Number(req.body.data.object.metadata.course_id),
        registration_status: 2,
      },
    });

    res.json({ received: true });
  } else {
    return res.status(400).send({
      message: "metadata is required",
      code: 400,
    });
  }
};

exports.recheck_status = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await prisma.course_reg.findFirst({
      where: {
        order_id: orderId,
      },
    });
    if (!order) {
      return res.status(404).send([]);
    }

    res.status(200).send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};
