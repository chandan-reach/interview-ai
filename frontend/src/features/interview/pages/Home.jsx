import React,{useState,useRef} from 'react'
import "./../style/home.scss"
import {useInterview} from "../hooks/useInterview.js"
import { useNavigate } from 'react-router-dom';


const Home = () => {

    const {loading, generateReport,reports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription,setSelfDescription] =useState("")
    const [resumeFile, setResumeFile] = useState(null)
    const resumeInputRef = useRef()

    const navigate = useNavigate();

    const handleResumeClick = () => {
        resumeInputRef.current?.click()
    }

    const handleResumeChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setResumeFile(file)
        }
    }

    const handleGenerateReport = async () =>{
        const file = resumeFile || resumeInputRef.current?.files[0]
        const data = await generateReport({jobDescription, selfDescription, resumeFile: file})
        if (data && data._id) {
            navigate(`/interview/${data._id}`)
        } else {
            alert("Failed to generate interview report. Please check your inputs and try again.")
        }
    }

if(loading){
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan</h1>
            </main>
        )
    }

    return (
        <main className='home'>
            <header className="hero">
                <h1>Create Your Custom Interview Plan</h1>
                <p className="subtitle">
                    Let our AI analyze the job requirements and your unique profile to build a winning strategy.
                </p>
            </header>

            <div className="interview-input-group">
                <div className="input-card left-card">
                    <div className="card-header">
                        <span className="icon job-icon" />
                        <h2>Target Job Description <span className="required">REQUIRED</span></h2>
                    </div>
                    <textarea

                        onChange={(e) => setJobDescription(e.target.value)}
                        className="job-description-input"
                        name="jobDescription"
                        id="jobdescription"
                        placeholder="Paste the full job description here..."
                    ></textarea>
                    <div className="char-count">0 / 5000 chars</div>
                </div>

                <div className="input-card right-card">
                    <div className="card-header">
                        <span className="icon profile-icon" />
                        <h2>Your Profile</h2>
                    </div>
                    <div className="upload-box">
                        <p className="upload-label">
                            Upload Resume <span className="tag">BEST RESULTS</span>
                        </p>
                        <div className="drop-area" onClick={handleResumeClick}>
                            <span>Click to upload or drag & drop</span>
                            <small>PDF or DOCX (Max 5MB)</small>
                        </div>
                        <input
                            ref={resumeInputRef}
                            hidden
                            type="file"
                            id="resume"
                            name="resume"
                            accept=".pdf, .doc, .docx"
                            onChange={handleResumeChange}
                        />
                        {resumeFile && <p className="file-name">✓ {resumeFile.name}</p>}
                    </div>
                    <div className="input-group">
                        <label htmlFor="selfDescription">Quick Self-Description</label>
                        <textarea
                            onChange={(e) => setSelfDescription(e.target.value)}
                            name="selfDescription"
                            id="selfDescription"
                            placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                        ></textarea>
                    </div>
                    <div className="notice">
                        Either a Resume or a Self Description is required to generate a personalized plan.
                    </div>
                    <button  onClick={handleGenerateReport} className='button primary-button'>Generate My Interview Strategy</button>
                </div>
            </div>
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        
            
        </main>
    )}

export default Home