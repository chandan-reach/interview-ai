const rawPdfParse = require("pdf-parse")
const pdfParse = rawPdfParse.default || rawPdfParse
const {generateInterviewReport, generateResumePdf} = require("../services/ai.services")
const InterviewReportModel = require("../models/interviewReport.model")

/**
 * @description controller to generate interview report on the basis of resume, self description and job description
 * 
 * 
 * 
 */
async function generateInterViewReportController(req, res){
    try {
        console.log("Received interview report generation request")
        console.log("User ID:", req.user?.id)
        console.log("File present:", !!req.file)
        console.log("Body keys:", Object.keys(req.body))

        // resume is optional; parse only if provided
        let resumeText = ""
        if (req.file && req.file.buffer) {
            if (typeof pdfParse !== 'function') {
                console.warn("pdf-parse module is not a function, skipping resume parsing")
            } else {
                try {
                    console.log("Parsing PDF resume...")
                    const resumeContent = await pdfParse(req.file.buffer)
                    resumeText = resumeContent.text || ""
                    console.log("Resume parsed, length:", resumeText.length)
                } catch (pdfErr) {
                    console.warn("PDF parsing warning:", pdfErr.message)
                    resumeText = "" // Continue without resume if parsing fails
                }
            }
        }

        const {selfDescription, jobDescription} = req.body

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        console.log("Calling AI service to generate interview report...")
        let interviewReportByAi
        try {
            interviewReportByAi = await generateInterviewReport({
                resume: resumeText,
                selfDescription,
                jobDescription
            })
            console.log("AI report generated successfully")
        } catch (aiErr) {
            console.error("AI service failed:", aiErr.message)
            if (aiErr.message.includes("quota")) {
                // fallback stub report
                console.warn("Quota exceeded - returning stub report")
                interviewReportByAi = {
                    matchScore: 50,
                    technicalQuestions: [],
                    behaviouralQuestions: [],
                    skillGaps: [],
                    preparationPlan: [],
                    title: "Fallback Interview Plan (Quota Limit)"
                }
            } else {
                throw aiErr
            }
        }

        const interviewReport = await InterviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })
        console.log("Interview report saved to database")

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (err) {
        console.error("Error generating interview report:", err.message)
        console.error("Full error:", err)
        res.status(500).json({
            message: "Failed to generate interview report",
            error: err.message || String(err)
        })
    }
}

async function getInterviewReportByIdController(req, res){
    const {interviewId} = req.params

    const interviewReport = await InterviewReportModel.findOne({_id:interviewId, user:req.user.id})
    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found"
        })
    }
    res.status(200).json({
        message:"Interview report found",
        interviewReport
    })
}


/** 
 *  @description controller to get all interview reports of the user
 * 
 */
async function getAllInterviewReportsController(req, res){
     const interviewReports = await InterviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description , resume and job description.
 * 
 */

async function generateResumePdfController(req, res){
    const {interviewReportId} = req.params

    const interviewReport = await InterviewReportModel.findById(interviewReportId)

    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found."
        })

    }

    const {resume, jobDescription, selfDescription} = interviewReport

    const pdfBuffer = await generateResumePdf({resume, jobDescription , selfDescription})

    res.set({
        "Content-Type":"application/pdf",
        "Content-Disposition":`attachment; filename=resume_${interviewReportId}.pdf`
    })
    res.send(pdfBuffer)
}

module.exports = {generateInterViewReportController,getInterviewReportByIdController,getAllInterviewReportsController,generateResumePdfController}
