import { MdOutlineKeyboardArrowLeft, MdPlayArrow, MdDesktopWindows, MdSend } from 'react-icons/md';
import { BiDotsVerticalRounded, BiArrowToBottom } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';

import './Chat.css'
import { useEffect, useRef, useState } from 'react';

export default function Chat(props) {
    const [scrollBottom, setScrollBottom] = useState(true);
    const [inputMsg, setInputMsg] = useState("");
    const ChatBody = useRef(null);
    
    useEffect(() => {
        if (ChatBody.current && scrollBottom)
            ChatBody.current.scrollTop = ChatBody.current.scrollHeight;
    }, [props.ChatCmpList, ChatBody, scrollBottom])

    return (
        <div className='ChatWrap'>
            <div className='ChatHeader'>
                <Link to="/"><MdOutlineKeyboardArrowLeft className='iconBtn' /></Link>
                <b className='RoomTitle'>{props.ChatRoomTitle}</b>
                <MdPlayArrow className='iconBtn' />
                <MdDesktopWindows className='iconBtn' />
                <BiArrowToBottom className='iconBtn' style={{ backgroundColor: scrollBottom ? "#44444444" : "#00000000" }} onClick={() => setScrollBottom(!scrollBottom)} />
                <Popup
                    position="bottom right"
                    trigger={<button className='MenuBtn'><BiDotsVerticalRounded className='iconBtn' /></button>}
                >
                    <div className='MenuPopupWrap'>
                        <button className='optionBtn'
                            onClick={() => {

                            }}
                        >초대하기</button>
                    </div>

                </Popup>

            </div>
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
                <button className='SendBtn'><MdSend className='SendIcon' /></button>
            </form>
        </div>
    )
}