import { MdSend } from 'react-icons/md';

import './Chat.css'
import { useEffect, useRef, useState } from 'react';

export default function Chat(props) {
    
    const [inputMsg, setInputMsg] = useState("");
    const ChatBody = useRef(null);

    useEffect(() => {
        if (ChatBody.current && props.scrollBottom)
            ChatBody.current.scrollTop = ChatBody.current.scrollHeight;
    }, [props.ChatCmpList, ChatBody, props.scrollBottom])

    return (
        <div className='ChatWrap'>
            <div className='ChatBody' ref={ChatBody}>
                {props.ChatCmpList}
            </div>
            <form className='ChatFooter' onSubmit={(e) => {
                e.preventDefault();

                if (props.SendMsg) {
                    props.SendMsg(inputMsg)
                }
                setInputMsg("");
            }}>
                <input className='ChatInput' value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} />
                <button className='IconBtn'><MdSend className='Icon' /></button>
            </form>
        </div>
    )
}