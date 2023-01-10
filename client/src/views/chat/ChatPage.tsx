import { Socket } from 'socket.io-client';
import { User } from '../App';
import { Chat, Contact } from '../SocketWrapper';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import Messages from './Messages';

type ChatProps = {
    socket:Socket,
    user:User
    currentChat?:Chat,
    sendMessage:((text:string) => void)
}


export default function ChatPage({socket, user, currentChat, sendMessage}:ChatProps) {
    const contact = currentChat?.Users[0];


    return(
        <div className={'d-flex flex-column collapse collapse-horizontal col-12 h-100 overflow-hidden'+(currentChat?" show":"")}>
            {
                currentChat?
                <>
                <ChatHeader contact={contact!} />
                <Messages user={user} socket={socket} chat={currentChat} />
                <MessageInput socket={socket} sendMessage={sendMessage} />
                </> : <div>select a contact to chat with <hr /></div>
            }
        </div>        
    );
}
