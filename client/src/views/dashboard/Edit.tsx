import { useState } from "react"
import { Tokens, User } from "../App";
import LoadingModal from "../LoadingModal";
import EditPassword from "./EditPassword";
import EditProfile from "./EditProfile";

type EditProps = {
  user:User,
  setUser: React.Dispatch<React.SetStateAction<User>>
}

export default function Edit({user, setUser}:EditProps) {
  const [loading,setLoading] = useState(false);

  async function passwordEdit(data:any):Promise<void | string>{
    setLoading(true)
    const res = await fetch(window.origin+"1/user/password",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: Tokens.access
        },
        body: JSON.stringify(data)
    });
    if(res.ok) return setLoading(false);
                
    const message = await res.text();
    if(message === "jwt expired" || res.status === 403){
      await Tokens.updateTokenSync();
      return passwordEdit(data);
    }
    setLoading(false)
    return message;
  }

  async function profileEdit(data:any):Promise<void | string>{
    setLoading(true);
    const res = await fetch(window.origin+"1/user/edit",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: Tokens.access
        },
        body: JSON.stringify(data)
    });
    if(res.ok) {
        const data = await res.json()
        setLoading(false)
        return setUser(data);
    }
                
    const message = await res.text();
    if(message === "jwt expired" || res.status === 403){
        await Tokens.updateTokenSync();
        return profileEdit(data);
    }
    setLoading(false);
    return message;
  }

  return (
    <>
    <div className="accordion container my-3 shadow p-0" id="accordionExample">
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingOne">
          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
            Edit your personal information
          </button>
        </h2>
        <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
          <div className="accordion-body">
            <EditProfile user={user} onsubmit={profileEdit} />
          </div>
        </div>
      </div>
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingTwo">
          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
            Change your password
          </button>
        </h2>
        <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
          <div className="accordion-body">
            <EditPassword onsubmit={passwordEdit} />
          </div>
        </div>
      </div>
    </div>

    {loading && <LoadingModal />}

    </>
  )
}
