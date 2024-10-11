const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.get_mycourse = async (req, res) => {
   try {
     const user_id = req.user_id;
 
     const users = await prisma.users_account.findFirst({
       where: {
         user_id: user_id,
       },
     });
 
     if (users.permission_id == 1) {
       const course = await prisma.course.findMany({
         where: {
           course_reg: {
             some: {
               user_id: user_id,
             },
           },
         },
         select: {
           course_id: true,
           course_name: true,
           course_description: true,
           course_visibility: true,
           image: true,
           img_account: true,
           cost: true,
           course_lesson: {
             select: {
               lesson_name: true,
               lesson_id: true,
             },
           },
           users_account: {
             select: {
               prefix: true,
               first_name: true,
               last_name: true,
             },
           },
           course_reg: {
             select: {
               registration_status: true,
               completion_status: true,
               registration_id: true,
               users_reg_transfer_document: {
                 select: {
                   transfer_document: true,
                   comment: true,
                 },
               },
             },
             where: {
               user_id: user_id,
             },
           },
         },
       });
 
       if (!course) {
         return res.status(200).send([]);
       }
       res.status(200).send(course);
     } else if (users.permission_id == 2) {
       const course = await prisma.course.findMany({
         where: {
           instructor: user_id,
         },
         select: {
           course_id: true,
           course_name: true,
           course_description: true,
           course_visibility: true,
           image: true,
           cost: true,
           course_lesson: {
             select: {
               lesson_name: true,
               lesson_id: true,
             },
           },
           users_account: {
             select: {
               prefix: true,
               first_name: true,
               last_name: true,
             },
           },
         },
       });
       if (!course) {
         return res.status(200).send([]);
       }
       res.status(200).send(course);
     } else {
       return res.status(200).send([]);
     }
   } catch (err) {
     res.status(500).send({
       message: err.message,
       code: 500,
     });
   }
 };
 
 exports.get_lesson_chapter = async (req, res) => {
   try {
     const content = await prisma.course_lesson.findFirst({
       where: {
         lesson_id: 46,
         
       },
       include: {
         lesson_chapter: {
           select: {
             lesson_chapter_id: true,
             content_data: true,
             content_type: true,
             content_name: true,
           },
         },
       },
     });
 
     if (!content) {
       return res.status(404).send([]);
     }
     res.status(200).send(content);
   
   } catch (e) {
     res.status(500).send({
       message: e.message,
       code: 500,
     });
   }
 };


 exports.get_mycourse = async (req, res) => {
  try {
    const user_id = 71;

    
      const course = await prisma.course.findMany({

        where: {
          course_reg: {
    
            some: {
              user_id: user_id,
            },
          },
        },
        select: {
          course_id: true,
          course_name: true,
          course_description: true,
          course_visibility: true,
          image: true,
          img_account: true,
          cost: true,
          course_lesson: {
            select: {
              lesson_name: true,
              lesson_id: true,
            },
          },
          users_account: {
            select: {
              prefix: true,
              first_name: true,
              last_name: true,
            },
          },
          course_reg: {
            select: {
              registration_status: true,
              completion_status: true,
              registration_id: true,
              users_reg_transfer_document: {
                select: {
                  transfer_document: true,
                  comment: true,
                },
              },
            },
            where: {
              user_id: user_id,
            },
          },
        },
      });

      if (!course) {
        return res.status(200).send([]);
      }

      res.status(200).send(course);
  
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};
