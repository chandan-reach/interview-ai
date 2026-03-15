import {createBrowserRouter} from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import ErrorBoundary from "./components/ErrorBoundary";



export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },{
        path:'/',
        element:<Protected><Home /></Protected>,
        errorElement:<ErrorBoundary><div>Something went wrong on the home page.</div></ErrorBoundary>
    },
    {
        path:'/interview/:interviewId',
        element:<Protected><Interview /></Protected>,
        errorElement:<ErrorBoundary><div>Failed to load interview details.</div></ErrorBoundary>
    }
]) 