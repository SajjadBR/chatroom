import {useEffect, useState} from 'react';
import { Route, Routes } from 'react-router-dom'
import Header from './Header';
import Home from './Home';
import NotFound from './NotFound';
import Dashboard from './dashboard/Dashboard';
import SocketWrapper from './SocketWrapper';
import Auth from './auth/Auth';

interface AppProps {
  appName: string
}

export function postReq(req:any){
  return {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(req)
    }
}

export class Tokens{
  private static accessToken = "";
  private static refreshToken = "";
  static setState:React.Dispatch<React.SetStateAction<any>>;

  private constructor() {}

  static get access() {
    return this.accessToken;
  }
  static get refresh() {
    return this.refreshToken;
  }

  static get logged():boolean{
    return !!this.refreshToken
  }

  static init(){
    const saved = localStorage.getItem("tokens");
    if(!saved) return;
    try{
      const {accessToken,refreshToken} = JSON.parse(saved);
      if(accessToken === undefined || refreshToken === undefined) return;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    }
    catch(err){}
  }

  static setTokens(access:string, refresh?:string){
    this.accessToken = access;
    if(refresh !== undefined) {
      this.refreshToken = refresh;
      this.setState?.({})
    }
    localStorage.setItem("tokens", JSON.stringify({accessToken:this.accessToken, refreshToken:this.refreshToken}))
  }

  static setUpdater(setState:React.Dispatch<React.SetStateAction<any>>){
    this.setState = setState;
  }

  static async updateTokenSync() {
    // console.clear();
    const res = await fetch(window.origin+"1/auth/token", postReq({token: this.refreshToken}));
    
    if (!res.ok){
      const text = await res.text();
      if(text === "invalid token") return this.setTokens("","");
      throw new Error(text);
    } 
    const {accessToken} = await res.json();
    if(!accessToken) throw new Error("server didn't send the access token");
    
    this.setTokens(accessToken);
  
  }
};


export interface User {
    id: number,
    email: string,
    username: string,
    name: string        
};

async function getUser():Promise<any>{
    const res = await fetch(window.origin+"1/user", {
        method: "POST",
        headers: {
            "authorization": Tokens.access
        }
    });
    
    if(res.ok) return await res.json();
    
    const message = await res.text();
    console.log(message);
    if(message === "jwt expired"){
        await Tokens.updateTokenSync();
        return getUser();
    }
    throw new Error(message);
}


export default function App({appName}: AppProps) {
  Tokens.init();
  const [,setState] = useState();
  const [user,setUser] = useState<User>();
  Tokens.setUpdater(setState)

  useEffect(() => {
    if(Tokens.logged){
        getUser().then(res => setUser(res));
    }
    else{
      setUser(undefined);
    }
  },[Tokens.logged]);

  return (
    <div className='w-100 h-100 d-flex flex-column'>
      <Header appName={appName} />
      {Tokens.logged && !user && <h1>Loading...</h1> }
      {Tokens.logged && user && <SocketWrapper user={user} />}
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/chats/*' element={<></>}/>
        <Route path='/Dashboard/*' element={user ? <Dashboard user={user} setUser={setUser} />:<></>}/>
        <Route path='/login' element={<Auth type='login' />} />
        <Route path='/signup' element={<Auth type='signup' />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}