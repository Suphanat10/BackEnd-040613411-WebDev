const { PrismaClient } = require('@prisma/client');
const e = require('express');
const prisma = new PrismaClient();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");


exports.checkout = async (req, res) => {
   const course = req.body.course;


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
         success_url: `http://localhost:3000/success?order_id=${order_id}`,
         cancel_url: `http://localhost:3000/cancel?order_id=${order_id}`,
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

exports.webhook = async (req, res) => {
   const sig = req.headers["stripe-signature"];
   let event;

   try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
   }catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
   }

   switch (event.type) {
      case "checkout.session.completed":
         const session = event.data.object;
         const order_id = session.client_reference_id;
         const order = await prisma.order.findUnique({
            where: {
               order_id: order_id,
            },
         });
         if (order) {
            await prisma.order.update({
               where: {
                  order_id: order_id,
               },
               data: {
                  status: "success",
               },
            });
         }
         break;
      default:
         return res.status(400).end();
   }
}


