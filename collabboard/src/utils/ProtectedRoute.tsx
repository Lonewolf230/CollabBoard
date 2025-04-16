import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import './styles.css'

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const {user,loading}=useAuth()
    if(loading){
        return <div className="loading-container">Loading...</div>
    }
    if (!user) {
        return <Navigate to="/" />;
    }
    return <>{children}</>;

}

export default ProtectedRoute;