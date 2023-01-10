import  { useRef, useState } from 'react';
import { postReq, Tokens } from '../App';
import PasswordVisibilityToggler from '../PasswordVisibilityToggler';


export default function Login() {
 const unameEmailRef = useRef<HTMLInputElement>(null);
 const passwordRef = useRef<HTMLInputElement>(null);

 const [serverError,setServerError] = useState<string>()


 async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    e.currentTarget.classList.add("was-validated")
    if(!e.currentTarget.checkValidity())return;

    let req = {}
    const password = passwordRef.current?.value!;
    const unameEmail = unameEmailRef.current?.value!;
    if(unameEmail.includes("@")) req = {password, email: unameEmail};
    else req = {password, username: unameEmail};

    const res = await fetch(window.origin+"1/auth/login", postReq(req));
    if(!res.ok) return setServerError(await res.text());
    const {accessToken,refreshToken} = await res.json();
    Tokens.setTokens(accessToken, refreshToken);
 }

 return(
    <form id='auth' onSubmit={handleSubmit} noValidate>
        <div className='my-3 form-floating'>
            <input className='form-control' type="text" required placeholder='username or email' id="unameEmail" ref={unameEmailRef} />
            <label htmlFor="unameEmail" className='form-label'>Username or Email:</label>
        </div>
        <div className='mb-3 input-group'>
            <div className='form-floating'>
                <input className='form-control' type="password" required minLength={8} placeholder='password' id="password" ref={passwordRef} />
                <label htmlFor="password" className='form-label'>Password:</label>
            </div>
            <PasswordVisibilityToggler input={passwordRef}/>
        </div>
        <div className='p-2 text-danger'>{serverError}</div>
        <button className='btn btn-primary' type="submit">Submit</button>
        
    </form>
 )
};