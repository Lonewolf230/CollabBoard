import { Navigate,useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import './styles.css'
import Loader from "../components/Loader";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const {user,loading}=useAuth()
    const location=useLocation()
    if(loading){
        return <div className="loading-container"><Loader /></div>
    } 
    if (!user) {
        return <Navigate to="/" state={{from:location}} />;
    }
    return <>{children}</>;

}

export default ProtectedRoute;