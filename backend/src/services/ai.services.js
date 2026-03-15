const {GoogleGenerativeAI} = require("@google/generative-ai")
const {z} = require("zod")
const {zodToJsonSchema} = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const model = ai.getGenerativeModel({ model: "gemini-pro" })

const interviewReportSchema = z.object({
    matchScore:z.number().describe("A score between 0 and 100 that indicates how well the candidate's profile matches the job description. A higher score indicates a better match."),
    technicalQuestions:z.array(z.object({
        question:z.string().describe("The technical question can be asked in the interview"),
        intention:z.string().describe("The intention behind asking this question"),
        answer:z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("A list of technical questions that can be asked in the interview, along with the intention behind asking those questions and how to answer them."),

    behaviouralQuestions:z.array(z.object({
        question:z.string().describe("The behavioural question can be asked in the interview"),
        intention:z.string().describe("The intention behind asking this question"),
        answer:z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioural questions that can be asked in the interview, along with the intention behind asking those questions and how to answer them."),
    
    skillGaps:z.array(z.object({
        skill:z.string().describe("The skill gap that the candidate has"),
        severity:z.enum(["low","medium","high"]).describe("The severity of the skill gap, whether it is low, medium or high")
    })).describe("A list of skill gaps that the candidate has, along with the severity of those skill gaps."),

    preparationPlan:z.array(z.object({
        day:z.number().describe("the day number in the preparation plan, starting from 1"),
        focus:z.string().describe("The main focus of the preparation for that day, such as resume building, technical skills improvement, mock interviews etc."),
        tasks:z.array(z.string()).describe("list of tasks to be done on that day to prepare for the interview"),
    })).describe("A day-wise preparation plan for the candidate to prepare for the interview, which includes a list of actions that the candidate should take and the resources that they can use to prepare for the interview."),
    title:z.string().describe("The title of the interview report, which the interview report is generated"),
})

async function generateInterviewReport({resume, selfDescription, jobDescription}){
    
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume || 'No resume provided'}
Self Description: ${selfDescription || 'No self description provided'}
Job Description: ${jobDescription}

Return ONLY valid JSON with these fields:
- matchScore (number 0-100)
- technicalQuestions (array of {question, intention, answer})
- behaviouralQuestions (array of {question, intention, answer})
- skillGaps (array of {skill, severity: "low"|"medium"|"high"})
- preparationPlan (array of {day: number, focus: string, tasks: array})
- title (string)`

   try {
       const response = await model.generateContent(prompt)

       let textContent = response.response.text()
       
       // Clean up JSON if it has markdown formatting
       const jsonMatch = textContent.match(/```json\n?([\s\S]*?)\n?```/) || textContent.match(/\{[\s\S]*\}/)
       const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : textContent
       
       let parsedData;
       try {
           parsedData = JSON.parse(jsonStr)
       } catch (parseErr) {
           console.error("Failed to parse AI response as JSON:", parseErr.message)
           console.error("Raw response:", textContent)
           throw new Error("AI returned invalid JSON response")
       }
       
       return parsedData
   } catch (error) {
       console.error("AI Generation Error:", error)
       // if quota error from Google API
       if (error?.error?.code === 429 || String(error).toLowerCase().includes("quota")) {
           throw new Error("AI quota exceeded: " + (error.message || error))
       }
       throw new Error("Failed to generate interview report: " + (error.message || error))
   }
}


async function generatePdfFromHtml(htmlContent){
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, {waitUntil: "networkidle0"})

    const pdfBuffer= await page.pdf({format:"A4", margin:{
        top:"20mm",
        bottom:"20mm",
        left:"15mm",
        right:"15mm"
    }})

    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({resume, selfDescription, jobDescription}){
    const prompt = `Generate professional resume HTML for a candidate. Return ONLY the HTML content, no JSON wrapper, no markdown.

Resume: ${resume || 'No resume provided'}
Self Description: ${selfDescription || 'No self description'}
Job Description: ${jobDescription}

Requirements:
- Tailored for the given job description
- Highlight candidate's strengths
- ATS-friendly
- 1-2 pages when converted to PDF
- Use clean HTML with inline CSS
- Include sections: Contact, Summary, Experience, Skills, Education`

    try {
        const response = await model.generateContent(prompt)

        let textContent = response.response.text()

        // Clean up if it has markdown
        const htmlMatch = textContent.match(/```html\n?([\s\S]*?)\n?```/) || textContent.match(/<html[\s\S]*<\/html>/i) || textContent
        const htmlContent = htmlMatch ? (Array.isArray(htmlMatch) ? htmlMatch[1] || htmlMatch[0] : htmlMatch) : textContent
        
        const pdfBuffer = await generatePdfFromHtml(htmlContent)
        return pdfBuffer
    } catch (error) {
        console.error("Resume PDF Generation Error:", error.message)
        throw new Error("Failed to generate resume PDF: " + error.message)
    }
}

module.exports = {generateInterviewReport, generateResumePdf}
