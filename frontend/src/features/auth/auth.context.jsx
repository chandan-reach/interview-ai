import {createContext,useState} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
   const [user, setUserState] = useState(() => {
       const savedUser = localStorage.getItem('user');
       return savedUser ? JSON.parse(savedUser) : null;
   });
   const [loading, setLoading] = useState(false);

   const setUser = (user) => {
       setUserState(user);
       if (user) {
           localStorage.setItem('user', JSON.stringify(user));
       } else {
           localStorage.removeItem('user');
       }
   };

   return <AuthContext.Provider value={{user,setUser,loading,setLoading}}>
    {children}
   </AuthContext.Provider>
}