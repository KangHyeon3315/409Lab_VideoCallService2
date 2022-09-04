import { MdOutlineKeyboardArrowLeft, MdPlayArrow, MdDesktopWindows, MdSend } from 'react-icons/md';
import { BiDotsVerticalRounded, BiArrowToBottom } from 'react-icons/bi';
import { Link, useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';

import './Chat.css'
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

function ChatCell(props) {
    return (
        <div className={props.myChat ? "MyChatCell" : 'ChatCell'}>
            <div className='Profile'>
                {/*<img className='profileImg' alt='profile' />*/}
                <div className='profileImg'> P </div>
            </div>
            <div className='ChatInfo'>
                <div className={props.myChat ? "MyChatSendInfo" : 'ChatSendInfo'}>
                    <div className='Sender'>
                        {props.sender}
                    </div>
                    <div className='SendTime'>
                        {props.time}
                    </div>
                </div>

                <div className={props.myChat ? "MyChatMsg" : 'ChatMsg'}>
                    {props.msg}
                </div>
            </div>
        </div>
    )
}

export default function Chat(props) {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState(null);
    const [scrollBottom, setScrollBottom] = useState(true);
    const [chatRoomTitle, setChatRoomTitle] = useState("Title");
    const [chatCmpList, setChatCmpList] = useState([]);

    const ChatBody = useRef(null);

    const scrollToBottom = useCallback(() => {
        if (ChatBody.current && scrollBottom) {
            ChatBody.current.scrollTop = ChatBody.current.scrollHeight;
        }
    }, [scrollBottom]);

    const getChatRoomInfo = useCallback(() => {
        const userId = sessionStorage.getItem('username');
        axios.get("/api/chat/info", {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                userId: userId,
                chatId: props.roomId,
            }
        }).then(res => {
            if (res.status === 403) navigate('/signin')

            console.log(res.data)
            if (res.data.result) {
                
                setChatRoomTitle(res.data.title);

                let chatList = [<p key="init" className='ChatSpacer' />];
                res.data.chatList.forEach(chatInfo => {
                    chatList.push(
                        <ChatCell
                            key={chatInfo.id}
                            myChat={chatInfo.senderId === userId}
                            profile={chatInfo.profile}
                            sender={chatInfo.sender}
                            time={chatInfo.sendTime}
                            msg={chatInfo.msg}
                        />
                    )
                })

                setChatCmpList(chatList)
                
                // TODO Web Socket 가입

            } else {
                alert(res.data.msg);
            }
        })
            .catch(ex => {
                console.log(ex)
                if (ex.response.status === 403) navigate('/signin')
            })
    }, [navigate, props.roomId, setChatCmpList]);

    useEffect(() => {
        if (props.roomId !== roomId) {
            getChatRoomInfo();
            setRoomId(props.roomId)
        }

        scrollToBottom()
    }, [props.roomId, roomId, scrollToBottom, setRoomId, getChatRoomInfo])

    return (
        <div className='ChatWrap'>
            <div className='ChatHeader'>
                <Link to="/"><MdOutlineKeyboardArrowLeft className='iconBtn' /></Link>
                <b className='RoomTitle'>{chatRoomTitle}</b>
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
                                if (props.deleteClicked)
                                    props.deleteClicked();
                            }}
                        >초대하기</button>
                    </div>

                </Popup>

            </div>
            <div className='ChatBody' ref={ChatBody}>
                {chatCmpList}
            </div>
            <form className='ChatFooter'>
                <input className='ChatInput' />
                <button className='SendBtn'><MdSend className='SendIcon' /></button>
            </form>
        </div>
    )
}