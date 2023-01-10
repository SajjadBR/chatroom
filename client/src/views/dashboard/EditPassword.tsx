import React, { FormEventHandler, useRef, useState } from "react";
import PasswordVisibilityToggler from "../PasswordVisibilityToggler";

type EPP = {
    onsubmit:((data:any) => Promise<void | string>)
}

export default function EditPassword({onsubmit}:EPP) {
    const currentPasswordRef = useRef<HTMLInputElement>(null);
    const newPasswordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const [showErrors,setShowErrors] = useState<any | undefined>();

    let [error,setError] = useState("");

    function mark():any|null {
        const currentPassword = currentPasswordRef.current?.value;
        const newPassword = newPasswordRef.current?.value;
        const confirmPassword = confirmPasswordRef.current?.value;

        if(!currentPassword || !newPassword || !confirmPassword || newPassword.length < 8 || newPassword !== confirmPassword){
            setShowErrors({});
            return null;
        }

        return{currentPassword,newPassword}
    }


    const onPassword:FormEventHandler = (e) => {
        e.preventDefault();

        const data = mark();
        if(!data) return;

        onsubmit(data).then(res => {
            currentPasswordRef.current!.value = ""
            newPasswordRef.current!.value = ""
            confirmPasswordRef.current!.value = ""
            
            if(!res) return;
            console.log(res);
            setError(res);
        })
    }

  return (
    <form onSubmit={onPassword}>
        <div className="pt-2">
            <label className="form-label" htmlFor="current-password">Current Password</label>
            <div className="input-group">
                <input className="form-control" name="current" ref={currentPasswordRef} type="password" id="current-password" placeholder="Enter your current password" />
                <PasswordVisibilityToggler input={currentPasswordRef} />
            </div>
            <span>
                {!currentPasswordRef.current?.value && showErrors && "this field should not be empty" }
                {currentPasswordRef.current?.value && currentPasswordRef.current.value.length < 8 && showErrors && "password is at least 8 characters"}
            </span>
        </div>
        <div className="pt-2">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="input-group">
                <input className="form-control" ref={newPasswordRef} type="password" id="new-password" placeholder="your new password" />
                <PasswordVisibilityToggler input={newPasswordRef} />
            </div>
            <span>
                {!newPasswordRef.current?.value && showErrors && "this field should not be empty"}
                {newPasswordRef.current?.value && newPasswordRef.current.value.length < 8  && showErrors && "password should be at least 8 characters"}
            </span>
        </div>
        <div className="pt-2">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <div className="input-group">
                <input className="form-control" ref={confirmPasswordRef} type="password" id="confirm-password" placeholder="repeat your new password" />
                <PasswordVisibilityToggler input={confirmPasswordRef} />
            </div>
            <span>
            {!confirmPasswordRef.current?.value && showErrors && "this field should not be empty"}
            {confirmPasswordRef.current?.value && newPasswordRef.current?.value !== confirmPasswordRef.current?.value  && showErrors && "passwords don't match"}
            </span>
        </div>
        <span className="py-2">{error}</span>
        <button className="btn btn-primary my-2" type="submit">submit</button>
    </form>
    )
}
