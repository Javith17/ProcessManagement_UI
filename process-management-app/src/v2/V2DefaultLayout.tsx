import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux-hooks";

// Same auth check as layouts/DefaultLayout.tsx, redirecting to /v2 instead
// of / so the v2 area stays self-contained on auth transitions.
const V2DefaultLayout = () => {
    const userDetail = useAppSelector((state) => state.auth.userDetail)

    if(userDetail && userDetail != undefined){
        return <Navigate replace to={"/v2"} />
    }

    return(
        <>
            <Outlet />
        </>
    )
}

export default V2DefaultLayout;
