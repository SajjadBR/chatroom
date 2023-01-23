import { Socket } from 'socket.io-client';
import { User } from '../App';
import { Chat } from '../SocketWrapper';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import Messages from './Messages';

type ChatProps = {
    socket:Socket,
    user:User
    chat?:Chat,
    sendMessage:((text:string) => void),
}


export default function ChatPage({socket, user, chat, sendMessage}:ChatProps) {
    console.log("CP");
    
    return(
        <div className={'d-flex flex-column w-100 h-100  overflow-hidden'}>                
        {
        chat ?
        <>
            <ChatHeader socket={socket} chat={chat} />
            <Messages user={user} socket={socket} chat={chat} />
            <MessageInput sendMessage={sendMessage} />
        </>:<h2>Getting the chat...</h2>
        }
        </div>
    );
}
