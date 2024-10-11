const { PrismaClient } = require("@prisma/client");
const e = require("express");
const prisma = new PrismaClient();

exports.get_exam_question_choice_by_exam = async (req, res) => {
   try {
     const exam_id = parseInt(req.params.exam_id);
 
     if (!exam_id) {
       return res.status(400).send({
         message: "Exam ID is required!",
         code: 400,
       });
     }
 
     const existingExam = await prisma.course_exam.findFirst({
       where: {
         exam_id: exam_id,
       },
     });
 
     if (!existingExam) {
       return res.status(404).send({
         message: "Exam is not found!",
         code: 404,
       });
     }
     
     const examQuestion = await prisma.course_exam_problem.findMany({
       select: {
         problem_id: true,
         problem_name: true,
         correct_choice: true,
         course_exam_choices: {
           select: {
             choices_id: true,
             label: true,
           },
         },
       },
       where: {
         exam_id: exam_id,
       },
     });
 
     if (!examQuestion) {
       return res.status(200).send([]);
     }
 
     res.status(200).send(examQuestion);
   } catch (err) {
     res.status(500).send({
       message: err.message,
       code: 500,
     });
   }
 };


 exports.get_exam = async (req, res) => {
  try {
    // const course_id = parseInt(req.params.course_id);
    // const user_id = req.userId;


    const registration = await prisma.course_reg.findFirst({
      where: {
        user_id: 71,
        course_id: course_id,
      },
    });

    if (!registration) {
      return res.status(404).send({
        message: "User is not registered for this course!",
        code: 404,
      });
    }

    const registration_id = registration.registration_id;

    const find_lesson = await prisma.course_lesson.findMany({
      where: {
        course_id: course_id,
      },
      include: {
        course_exam: {
          include: {
            course_exam_problem: {
              include: {
                reg_exam_ans: {
                  where: {
                    registration_id: registration_id,
                  },
                },
              },
            },
          },
        },
      },
    });



    // let lesson_arr = find_lesson.filter((lesson) => {
    //   return lesson.course_exam.length > 0;
    // });

    // lesson_arr.map((lesson) => {
    //   lesson.course_exam.map((exam) => {
    //     exam.total_problems = exam.course_exam_problem.length;

    //     exam.sum_Score = 0;
    //     exam.is_do = false;

    //     exam.course_exam_problem.map((problem) => {
    //       problem.reg_exam_ans =
    //         problem.reg_exam_ans.length > 0 ? problem.reg_exam_ans[0] : null;

    //       if (problem.reg_exam_ans && exam.is_do == false) {
    //         exam.is_do = true;
    //       }

    //       if (
    //         problem.reg_exam_ans &&
    //         problem.reg_exam_ans.select_choice === problem.correct_choice
    //       ) {
    //         exam.sum_Score++;
    //       }

    //       if (problem.correct_choice) {
    //         delete problem.correct_choice;
    //       }
    //     });
    //   });
    // });

    res.status(200).send(find_lesson);
  } catch (err) {
    res.status(500).send({
      message: err.message,
      code: 500,
    });
  }
};
