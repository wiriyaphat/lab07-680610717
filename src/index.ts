import express, { type Request, type Response } from "express";

// import middleware
import morgan from "morgan";

// import database
import { students } from "./db/db.ts";
import { type Student, type Course } from "./libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "./libs/studentValidator.ts";
import type { ok } from "node:assert";

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json()); // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /students
// get students (by program)
app.get("/api/students", (req: Request, res: Response) => {
  try {
    const program = req.query.program;
    const studentId = req.query.studentId;

    if (program && studentId) {
      let filtered_Bothstudents = students
        .filter((student) => student.program === program)
        .filter((stuId) => stuId.studentId === studentId);
      return res.json({
        ok: true,
        students: filtered_Bothstudents,
      });
    } else if (studentId) {
      let filtered_studentsId = students.filter(
        (student) => student.studentId === studentId,
      );
      return res.json({
        ok: true,
        students: filtered_studentsId,
      });
    } else if (program) {
      let filtered_students = students.filter(
        (student) => student.program === program,
      );
      return res.json({
        ok: true,
        students: filtered_students,
      });
    } else {
      return res.json({
        ok: true,
        count: students.length,
        data: students,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /students, body = {new student data}
// add a new student
app.post("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId,
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId,
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
app.delete("/api/students", (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;
    const val = zStudentDeleteBody.safeParse({ studentId });
    if (!val.success) {
      return res.status(400).json({
        ok: false,
        message: `Student Id must contain 9 characters`,
      });
    }
    const found = students.find((student) => student.studentId === studentId);
    const deletedStudent = students.filter((s) => s.studentId !== studentId);
    if (deletedStudent && found) {
      return res.status(200).json({
        ok: true,
        message: `Student Id ${studentId} has been deleted`,
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: `Student ID does not exist`,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }

  res.json({
    message: "Implement this!",
  });
});

// GET /api/me

app.get("/api/me", (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      ok: true,
      fullName: "Wiriyaphat Phromphong",
      studentId: 680610717,
    });
  } catch {}
});

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;
