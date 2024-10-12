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
      course.price = course.price - (course.price * 0.2);
   }else if (course_ && course_.Continuity && course_.Continuity.length >= 3) {
      course.price = course.price - (course.price * 0.3);
   }else if (course_ && course_.Continuity && course_.Continuity.length >= 5) {
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

      const update_data = await prisma.course_reg.update({
         where: {
           user_id: req.user_id,
         },
         data: {
            session_id: session.id,
            order_id: order_id,
            registration_status : 1,

         },
           
      })
      res.status(200).send({
         status: true,
         message: "success",
         session_id: session.id,
         order_id: order_id,
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



exports.recheck_status =  async (req, res) => {
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
   }
   catch (err) {
      res.status(500).send({
         message: err.message,
         code: 500,
      });
   }
}


      
         

