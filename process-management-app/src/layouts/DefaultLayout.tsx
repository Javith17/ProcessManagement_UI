import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux-hooks";

const DefaultLayout = () => {
    const userDetail = useAppSelector((state) => state.auth.userDetail)

    if(userDetail && userDetail != undefined){
        return <Navigate replace to={"/"} />
    }

    return(
        <>
            <Outlet />
        </>
    )
}

export default DefaultLayout;