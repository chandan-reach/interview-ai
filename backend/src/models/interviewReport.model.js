const mongoose = require('mongoose');
/** 
 * -job description :String 
 * resume text:String 
 * self description :String 
 * 
 * overall score
 * 
 * technical questions :[{}]
 * behaviours questions:[]
 * skills gaps :[]
 * preparations plan:[{}]
 * 
 */
const technicalQuestionSchema = new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    Answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
})

const behaviourQuestionSchema = new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    Answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
})


const skillGapsSchema = new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"Skill is required"]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[true,"Severity is required"]
    }
},{
    _id:false
})


const preparationPlanSchema = new mongoose.Schema({
     day:{
        type:Number,
        required:[true,"Day is required"]
     },
     focus:{
        type:String,
        required:[true,"Focus is required"]
     },
     tasks:[{
        type:String,
        required:[true,"Task is required"]
     }]
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription:{
        type:String,
        required:[true,"Job description is required"]
    },
    resume:{
        type:String,
    },
    selfDescription:{
        type:String,
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    technicalQuestions:[technicalQuestionSchema],
    behaviourQuestions:[behaviourQuestionSchema],
    skillGaps:[skillGapsSchema],
    preparationPlan:[preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    title:{
        type:String,
         required:[true,"Job title is required"]
    }
},{
    timestamps:true
})

const InterviewReportModel = mongoose.model("InterviewReport",interviewReportSchema);

module.exports = InterviewReportModel;