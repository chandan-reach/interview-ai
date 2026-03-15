const express = require("express")
const authUser  = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware") 

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new inerview report on the basis of self description
 * resume pdf and job description 
 * @access private 
 */

interviewRouter.post("/", authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/** 
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId
 * @access private
 * 
 */
interviewRouter.get("/report/:interviewId", authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of the user
 * @access private
 * 
 */

interviewRouter.get("/", authUser, interviewController.getAllInterviewReportsController)

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of self description, resume and job description.
 * @access private
 * 
 */

interviewRouter.post("/resume/pdf/:interviewReportId", authUser, interviewController.generateResumePdfController)


module.exports = interviewRouter