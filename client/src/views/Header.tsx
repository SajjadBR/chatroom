import {NavLink} from 'react-router-dom';
import { Tokens } from './App';
import Clock from './Clock';

type HeaderProps = {
    appName: string
}

export default function Header({ appName }: HeaderProps){
    return(
        <header className='container-fluid shadow-lg'>
            <nav className='navbar navbar-expand-md'>
                <NavLink className="navbar-brand" to="/">{appName}</NavLink>
                {
                Tokens.logged ?
                <>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className='navbar-nav'>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/chats">Chats</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/Dashboard">Dashboard</NavLink>
                        </li>
                        <li className="nav-item">
                            <span className="nav-link"><Clock /></span>
                        </li>
                    </ul>
                </div>
                </>:
                <div className='nav-item d-flex w-25 justify-content-between'>
                <NavLink className="nav-link py-1 px-3 text-white btn btn-primary" to="/login">Login</NavLink>
                <NavLink className="nav-link py-1" to="/signup">Signup</NavLink>
                </div>
                }

            </nav>
        </header>
    );
}