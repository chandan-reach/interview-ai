import {getAllInterviewReport, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import {useContext, useEffect} from "react"
import {InterviewContext} from "../interview.context"
import {useParams} from "react-router"

export const useInterview =()=>{
    const context = useContext(InterviewContext)
    const {interviewId} = useParams()

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading, setLoading, report, setReport,reports, setReports} = context
    
    const generateReport = async ({jobDescription, selfDescription, resumeFile}) =>{
        setLoading(true)
        let data = null
        try{
            const response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})
            setReport(response.interviewReport)
            data = response.interviewReport
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
        }
        return data
    }

    const getReportById = async (interviewId) =>{
        setLoading(true)
        try{
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        }catch(error){
             console.log(error)
        }finally{
            setLoading(false)
        }
    }



    const getReports = async () =>{
        setLoading(true)
        try{
            const response = await getAllInterviewReport()
            setReports(response.interviewReports)
        }catch(error){
             //console.log(error)
    }finally{
            setLoading(false)
        }
}

    const getResumePdf = async (interviewReportId) =>{
        setLoading(true)
        let response = null
        try{
            response = await generateResumePdf({interviewReportId})
            // ensure we got a blob response
            const url = window.URL.createObjectURL(new Blob([ response], {type:"application/pdf"}))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download",`resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()

        }catch(error){
            console.log(error)
            alert("Failed to generate resume PDF. Please try again.")
        }finally{
            setLoading(false)
        }
    }

   useEffect(()=>{
    if(interviewId){
         getReportById(interviewId)
    }else{
        getReports()
    }
   },[interviewId])

return {loading, report , generateReport ,getReportById, reports, getReports, getResumePdf}
}