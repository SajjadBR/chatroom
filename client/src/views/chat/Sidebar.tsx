import SidebarChat from './SidebarChat';
import { Link } from 'react-router-dom';
import { Chat } from '../SocketWrapper';

type SidebarProps = {
    chats:Chat[],
    deleteChat:((id:number)=>void),
}

export default function Sidebar({chats,deleteChat}:SidebarProps) {
    
    return (
        <div className='w-100 h-100 position-relative overflow-y-auto'>
        {chats.map(chat => <SidebarChat deleteChat={deleteChat} key={chat.id} chat={chat} />)}
        {!chats.length && <h3>no chats yet</h3>}
        <Link className='material-icons btn btn-dark rounded-circle p-3 mb-4 me-4 position-fixed bottom-0 end-0' to='/chats/search'>add</Link>
        </div>

    )
}