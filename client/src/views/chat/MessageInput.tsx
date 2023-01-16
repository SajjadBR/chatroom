import React, {useEffect, useState} from "react";

type MIT = {
    sendMessage:((text:string) => void)
}


function MessageInput({sendMessage}:MIT) {
    const [message, setMessage] = useState<string>("");
    
    const submit:React.FormEventHandler<HTMLFormElement> = e => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    }

    /*
    function setHight(){
        let size = messageRef.current?.value.split(/\r\n|\r|\n/).length!;
        if(size > 10) size = 10
        else if(size < 2) size++
        messageRef.current!.style.height = size*1.5 + "em";
        messageRef.current!.style.bottom = ""+ (size-2)*1.5 +"em";
    }
    */

    useEffect(() => {
        // setHight()
    })

    return(
        <form className="input-group p-2 d-flex" onSubmit={submit}>
            {/* <label htmlFor="message-input"></label> */}
            <input className="form-control border border-1 border-success" placeholder="type something..."  type="text" onInput={e => setMessage(e.currentTarget.value)} value={message} />
            <button type="submit" className="material-icons btn btn-success">send</button>
            {/* <textarea ref={messageRef} placeholder="type something..." id='message-input' value={message} onBlur={e => setSearchParams({"m": e.target.value})} 
            onInput={(e) => {
                    setHight()
                    setMessage(e.currentTarget.value)
                }}/> */}
        </form>
    );
}

export default MessageInput;