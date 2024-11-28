import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux-hooks";

const ProtectedLayout = () => {
    const userDetail = useAppSelector((state) => state.auth.userDetail)

    if(!userDetail){
        return <Navigate replace to={"/login"} />
    }

    return(
        <>
            <Outlet />
        </>
    )
}

export default ProtectedLayout;