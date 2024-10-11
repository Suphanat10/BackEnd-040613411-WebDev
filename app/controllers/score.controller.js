const { PrismaClient } = require("@prisma/client");
const e = require("express");
const prisma = new PrismaClient();

exports.get_score = async (req, res) => {
   try {
     const registration_id = parseInt(req.params.registration_id);
 //ค้นหาข้อมูล lesson  โดยค้นหาจาก registration_id ที่ได้รับ และรวมข้อมูลของ course, course_lesson, course_exam, course_exam_problem, course_exam_choices, และ reg_exam_ans ด้วย include.
    
   const find_lesson = await prisma.course_reg.findFirst({
       where: {
         registration_id: registration_id,
       },
       include: {
         course: {
           include: {
             course_lesson: {
               include: {
                 course_exam: {
                   include: {
                     course_exam_problem: {
                       include: {
                         course_exam_choices: true,
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
             },
           },
         },
       },
     });
     
     //กรองเลสันที่มีการสอบโดยใช้ filter โดยตรวจสอบว่ามี course_exam มากกว่า 0 
     let lesson_arr = find_lesson.course.course_lesson.filter((lesson) => {
       return lesson.course_exam.length > 0;
     });
 
//      let pass = true;
//  //การคำนวณคะเเนน
//      lesson_arr.map((lesson) => {
//        lesson.course_exam.map((exam) => {
//          //หาคำถามทั้งหมดว่ากี่ข้อ
//          exam.total_problems = exam.course_exam_problem.length;
 
//          exam.sum_Score = 0; //ตัวเเปรเก็บคะเเนน
//          exam.is_do = false; //ตัวเเปรเช็คทำข้อสอบ
 
//          exam.course_exam_problem.map((problem) => {
//            //ตรวจสอบว่ามีข้อมูล reg_exam_ans ใน problem หรือไม่ ถ้ามีก็จะกำหนดค่า problem.reg_exam_ans ให้เป็นข้อมูลแรกในอาเรย์ problem.reg_exam_ans แต่ถ้าไม่มีข้อมูลก็จะกำหนดค่า problem.reg_exam_ans เป็น null
//            problem.reg_exam_ans =
//              problem.reg_exam_ans.length > 0 ? problem.reg_exam_ans[0] : null;
 
//          //การตรวจสอบว่า problem.reg_exam_ans มีค่าไม่ใช่ null, undefined, หรือ false และ exam.is_do มีค่าเป็น false หรือไม่ ถ้าเงื่อนไขเป็นจริงจะกำหนดค่า exam.is_do เป็น true
 
//            if (problem.reg_exam_ans && exam.is_do == false) {
//              exam.is_do = true;
//            }
//  //ตรวจสอบว่าผู้เรียนได้ทำการตอบคำถามในการสอบ (ในตัวแปร problem.reg_exam_ans) และคำตอบที่ผู้เรียนเลือก (problem.reg_exam_ans.select_choice) เท่ากับคำตอบที่ถูกต้อง (problem.correct_choice) ถ้าตรงกันทำการเพิ่มคะแนน (exam.sum_Score++) 
//            if (
//              problem.reg_exam_ans &&
//              problem.reg_exam_ans.select_choice === problem.correct_choice
//            ) {
//              exam.sum_Score++;
//            }
//            if (problem.correct_choice) {
//              delete problem.correct_choice;
//            }
//          });
//        });
//      });
 
     res.status(200).send(lesson_arr);
   } catch (err) {
     res.status(500).send({
       message: err.message,
       code: 500,
     });
   }
 };