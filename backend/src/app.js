const express =require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(express.json({ strict: false }))

// global error handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.warn('Bad JSON received:', err.message)
        return res.status(400).json({ message: 'Invalid JSON payload' })
    }
    next(err)
})
app.use(cookieParser())

app.use(cors({
     origin:["http://localhost:5173", "http://localhost:5174"],
     credentials:true

}))

/*require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/*using all the routes here */
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

module.exports = app;

