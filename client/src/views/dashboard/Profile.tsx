import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Tokens, User } from "../App"
import LoadingModal from "../LoadingModal"
import { logout } from "./Dashboard" 

type ProfileProps = {
    user:User
}

async function profileChange(data:any,target:"header"|"profile"):Promise<void | string>{
    const res = await fetch(window.origin+"1/user/"+target,{
        method: "POST",
        headers: {
            authorization: Tokens.access
        },
        body: data
    });
    if(res.ok) return;

    const message = await res.text();
    if(message === "jwt expired" || res.status === 403){
        await Tokens.updateTokenSync();
        return profileChange(data,target);
    }
    return message;
}

const input = document.createElement("input");
input.type = "file";
input.accept = "image/*";

export default function Profile({user}:ProfileProps) {
    const navigate = useNavigate();
    const [loading,setLoading] = useState(false);

    function changeImageClicked(target:"profile"|"header"){
        setLoading(true);
        input.onchange = e => {
            if(!input.files![0])return;
            const fd = new FormData();
            fd.append("file", input.files![0]);
            profileChange(fd,target).then(res => {
                setLoading(false);
                window.location.reload();
            });
        }
        input.click();
    }

    return (
        <div className="w-100 h-100 position-relative">
            <img className="w-100 position-absolute top-0 left-0 z-n1" src={user.id ?`${window.origin}1/img/header/${user.id}`: "/images/header.jpg"} alt="header" id="profile-header"/>
            <div className="w-100 d-flex flex-column p-2">
                <div className="mb-3 mb-md-4  d-flex justify-content-between">
                    <button onClick={e=>navigate(-1)} type="button" className="material-icons btn btn-light p-2 rounded-circle">arrow_back</button>
                    <button className="btn btn-light rounded-circle p-1 shadow-lg material-icons" type="button" data-bs-toggle="dropdown" aria-expanded="false">more_vert</button>
                    <div className="dropdown-menu">
                        <button className="dropdown-item" type="button" onClick={e=>changeImageClicked("profile")}>Change profile</button>
                        <button className="dropdown-item" type="button" onClick={e=>changeImageClicked("header")}>Change header</button>
                    </div>
                </div>
                <div className="mt-4 mt-md-5 d-flex justify-content-between align-items-end">
                    <img className="w-25 rounded-circle" src={user.id ?`${window.origin}1/img/profile/${user.id}`: "/images/profile.jpg"} alt="profile" id="profile-picture" />

                    <div className="d-flex flex-column ">
                        <b className="">{user.name}</b>
                        <small className="">@{user.username}</small>
                    </div>
                    <button className="btn btn-outline-danger" type="button" data-bs-toggle="modal" data-bs-target="#logoutModal"><i className="material-icons">logout</i> logout</button>
                </div>
            </div>
            {loading && <LoadingModal />}
            <div className="modal fade" id="logoutModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">Logout</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        Are you sure?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button onClick={e=>logout(Tokens.refresh).then(() => Tokens.setTokens("",""))} type="button" data-bs-dismiss="modal" className="btn btn-danger"><i className="material-icons">logout</i> logout</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
