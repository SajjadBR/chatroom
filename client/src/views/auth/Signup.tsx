import React, { useRef, useState } from "react";
import { postReq, Tokens } from "../App";
import PasswordVisibilityToggler from "../PasswordVisibilityToggler";


async function unique(value:string){
	if(!value) return(false);

	const res = await fetch(window.origin+"1/auth/uniqueUsername", postReq({username: value}));

	if(res.ok) return(true);
	if(res.status === 400) return(false)

	throw new Error(await res.text());
}


export default function Signup() {
	const [,setState] = useState({});
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const passwordConfirmRef = useRef<HTMLInputElement>(null);
	const [serverError,setServerError] = useState<string>()
	

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
		e.preventDefault();
		const target = e.currentTarget;
		target.classList.add("was-validated");
		
		if(passwordConfirmRef.current?.value !== passwordRef.current?.value) passwordConfirmRef.current?.setCustomValidity("passwords don't match");
		else passwordConfirmRef.current?.setCustomValidity("");
		
		if(usernameRef.current?.value){
			if(await unique(usernameRef.current!.value)) usernameRef.current?.setCustomValidity("");
			else usernameRef.current?.setCustomValidity("username is not unique");
		}
		setState({});
		
		if(!target.checkValidity()) return;


		const res = await fetch(
			window.origin+"1/auth/signup",
			postReq({ username:usernameRef.current?.value!, password:passwordRef.current?.value!})
		);

		if(!res.ok) return setServerError(await res.text());
		const {accessToken,refreshToken} = await res.json();
		Tokens.setTokens(accessToken, refreshToken);
	}
	
	return(
		<form id="auth" onSubmit={handleSubmit} noValidate>
			<div className="my-3 form-floating">
				<input className="form-control" type="text" required placeholder="username" id="username" ref={usernameRef} />
				<label htmlFor="username" className="form-label">Username:</label>
				<span className="invalid-feedback">{usernameRef.current?.validationMessage}</span>
			</div>
			<div className="mb-3 input-group">
				<div className="form-floating">
					<input className="form-control" type="password" minLength={8} required placeholder="password" id="password" ref={passwordRef} />
					<label htmlFor="password" className="form-label">Password:</label>
				</div>
				<PasswordVisibilityToggler input={passwordRef}/>
				<span className="invalid-feedback">{passwordRef.current?.validationMessage}</span>
			</div>
			<div className="mb-3 input-group">
				<div className="form-floating">
					<input required className="form-control" type="password" placeholder="repeat password" id="password-confirm" ref={passwordConfirmRef} />
					<label htmlFor="password-confirm" className="form-label">Confirm Password:</label>
				</div>
				<PasswordVisibilityToggler input={passwordConfirmRef} />
				<span className="invalid-feedback">{passwordConfirmRef.current?.validationMessage}</span>
			</div>

			<div className="p-2 text-danger">{serverError}</div>			
			<button className="btn btn-primary" type="submit">Submit</button>
		</form>
	)
}