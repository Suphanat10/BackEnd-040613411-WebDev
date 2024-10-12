const { PrismaClient } = require('@prisma/client');
const e = require('express');
const prisma = new PrismaClient();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");


exports.checkout = async (req, res) => {
   const course = req.body.course;
   const  information = req.body.information;

   try {
   const course_ = await prisma.course.findMany({
      where: {
         course_id: course.course_id,
      },
      include: {
         Continuity: true, 
      },
   });
   
   if (course_ && course_.Continuity && course_.Continuity.length >= 2) {
      // ถ้ามี 2 รายการใน Continuity ให้ลดราคา 20%
      course.price = course.price - (course.price * 0.2);
   }else if (course_ && course_.Continuity && course_.Continuity.length >= 3) {
      // ถ้ามี 3 รายการใน Continuity ให้ลดราคา 30%
      course.price = course.price - (course.price * 0.3);
   }else if (course_ && course_.Continuity && course_.Continuity.length >= 5) {
      // ถ้ามี 4 รายการใน Continuity ให้ลดราคา 50%
      course.price = course.price - (course.price * 0.5);
   }
      const order_id = uuidv4();
      const session = await stripe.checkout.sessions.create({
         payment_method_types: ["QR"],
         line_items: [
            {
               price_data: {
                  currency: "thb",
                  product_data: {
                     name: course.course_name,
                  },
                  unit_amount: course.price * 100,
               },
               quantity: 1,
            },
         ],
         mode: "payment",
         success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
         cancel_url: `${process.env.CLIENT_URL}/cancel`,
      });
      const data = {
         order_id: order_id,
         session_id: session.id,
         course_id: course.course_id,
         user_id: req.user_id,
         status: "pending",
         information: information,
      };
      const create_order = await prisma.order.create({
         data: data,
      });
      res.status(200).send({
         status: true,
         message: "success",
         session_id: session.id,
      });



   } catch (err) {
       res.status(500).send({
          message: err.message,
          code: 500,
       });
    }
   }




