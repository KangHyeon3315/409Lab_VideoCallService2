import './Contents.css'

import { MdOutlineKeyboardArrowLeft, MdPlayArrow, MdDesktopWindows, MdPerson, MdPersonAdd } from 'react-icons/md';
import { BiArrowToBottom, BiComment } from 'react-icons/bi';
import { FiCamera, FiMic } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import ChatCell from '../Chat/ChatCell';
import ListCell from '../Home/ListCell';
import Member from '../Member/Member';
import Chat from '../Chat/Chat';
import Popup from 'reactjs-popup';
import axios from 'axios';
import VideoCall from '../VideoCall/VideoCall';
import Setting from '../VideoCall/Setting';

export default function Contents(props) {
    const navigate = useNavigate();
    const { roomId } = useParams();

    const [useMic, setUseMic] = useState(false);
    const [MicId, setMicId] = useState("default");
    const [useCam, setUsecam] = useState(false);
    const [CamId, setCamId] = useState("default");
    const [chatEnable, setChatEnable] = useState(false);
    const [memberEnable, setMemberEnable] = useState(false);

    const [mode, setMode] = useState("VideoCall");
    const [roomTitle, setRoomTitle] = useState("Title")

    const [autoScroll, setAutoScroll] = useState(true);
    const [chatCmpList, setChatCmpList] = useState([]);

    const ws = useRef(null);
    const [isConnected, setConnected] = useState(false);

    const [members, setMembers] = useState([]);
    const [memberIds, setMemberIds] = useState([]);
    const [selectedInviteMemberId, setSelectedInviteMemberId] = useState([]);

    const getTimeStr = () => {
        var today = new Date();
        today.setHours(today.getHours() + 9);
        return today.toISOString().replace('T', ' ').substring(0, 19);
    }

    const SendMsg = (msg) => {
        if (isConnected) {
            ws.current.send(

                JSON.stringify(
                    {
                        type: "Chat",
                        token: sessionStorage.getItem("token"),
                        room: roomId,
                        time: getTimeStr(),
                        msg: msg
                    }
                )
            )
        }
    }


    const InviteMember = () => {
        axios.post('/api/chat/invite', null, {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                chatId: roomId,
                userIds: selectedInviteMemberId,
            }
        })
            .then(res => {
                if (res.data.result) {
                    setMemberIds(memberIds.concat(selectedInviteMemberId))
                    setSelectedInviteMemberId([]);
                } else {
                    alert(res.data.msg)
                    return;
                }
            })
    }

    useEffect(() => {
        if (!ws.current) {
            ws.current = new WebSocket("ws://localhost:8080/ws/chat");

            ws.current.onopen = () => {
                setConnected(true);
                ws.current.send(JSON.stringify({
                    type: "Join",
                    token: sessionStorage.getItem("token"),
                    name: sessionStorage.getItem("userName")
                }))
            }
            ws.current.onclose = (err) => { setConnected(false); }
            ws.current.onerror = (err) => { }

        }

        return () => {
            console.log("Clean up");
            // ws.current.close();
        }
    }, [])

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token === null || token === '') { navigate('/signin'); return; }

        if (roomId !== undefined) {
            const userId = sessionStorage.getItem('userId');

            // TODO Socket에 해당 Room으로 세션 가입 전송


            axios.get("/api/chat/info", {
                headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
                params: {
                    userId: userId,
                    chatId: roomId,
                }
            }).then(res => {
                if (res.status === 403) navigate('/signin')

                if (res.data.result) {
                    setRoomTitle(res.data.title);

                    let memberIdList = [];
                    res.data.members.forEach(memberInfo => {
                        memberIdList.push(memberInfo.userId);
                    })

                    setChatEnable(true);
                    setMemberIds(memberIdList);
                    setMembers(res.data.members);

                    let chatList = [];
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
                } else {
                    alert(res.data.msg);
                }
            }).catch(ex => {
                console.log(ex)
                if (ex.response.status === 403) navigate('/signin')
            })
        }
    }, [navigate, roomId]);

    useEffect(() => {
        if (ws.current) {
            ws.current.onmessage = (evt) => {
                const userId = sessionStorage.getItem('userId');
                const data = JSON.parse(evt.data);

                if (data.type === "Chat") {
                    let chatList = [...chatCmpList];
                    chatList.push(
                        <ChatCell
                            key={data.id}
                            myChat={data.senderId === userId}
                            profile={data.profile}
                            sender={data.sender}
                            time={data.sendTime}
                            msg={data.msg}
                        />
                    )
                    setChatCmpList(chatList)
                }
            }

        }
    }, [chatCmpList, setChatCmpList])

    let inviteList = [];

    if (props.userInfo) {
        props.userInfo.friends.forEach(friend => {
            if (!memberIds.includes(friend.id)) {
                inviteList.push(
                    <ListCell
                        key={friend.id}
                        title={friend.nickname}
                        comment={friend.email}
                        chatId={friend.chatId}
                        selected={selectedInviteMemberId.includes(friend.id)}
                        clicked={() => {
                            const idx = selectedInviteMemberId.indexOf(friend.id)
                            let memberList = [...selectedInviteMemberId];
                            if (idx >= 0) {
                                memberList.splice(idx, 1);
                            } else {
                                memberList.push(friend.id);
                            }
                            setSelectedInviteMemberId(memberList);
                        }}
                        deleteDisable={true}
                    />

                )
            }
        })
    }

    let MemberCmp = <Member MemberList={members} />
    let ChatCmp = <Chat ChatCmpList={chatCmpList} SendMsg={SendMsg} scrollBottom={autoScroll} />

    let SideContents = null;
    if (mode !== null && (chatEnable || memberEnable)) {
        if (chatEnable && memberEnable) {
            SideContents = (
                <div className='SideWrap'>
                    <div className='HarfSideSection'>
                        {MemberCmp}
                    </div>
                    <div className='HorizontalLine' />
                    <div className='HarfSideSection'>
                        {ChatCmp}
                    </div>
                </div>
            )

        } else {
            SideContents = (
                <div className='SideWrap'>
                    {chatEnable ? ChatCmp : MemberCmp}
                </div>
            )
        }

    } else if (mode === null && chatEnable && memberEnable) {
        SideContents = (
            <div className='SideWrap'>
                {memberEnable ? MemberCmp : null}
            </div>
        )
    }

    let mainContents = null;
    if (mode === "VideoCall") {
        mainContents = (
            <div className='MainContents'>
                <VideoCall
                    CamId={CamId}
                    MicId={MicId}
                    audioEnabled={useMic}
                    cameraEnabled={useCam}
                    MemberList={members}
                />
            </div>
        )
    } else if (mode === "Meta") {
        mainContents = (
            <div className='MainContents'>
                Meta
            </div>
        )
    } else if (chatEnable) {
        mainContents = (
            <div className='MainContents'>
                {ChatCmp}
            </div>
        )
    }

    let Contents;
    if (roomId === undefined) {
        Contents = <div className='ContentsBody'> 채팅방을 선택하세요 </div>
    } else {
        Contents = (
            <div className='ContentsBody'>
                {mainContents}
                {SideContents ? <div className='VerticalLine' /> : null}
                {SideContents}
            </div>
        )
    }

    return (
        <div id="ContentsWrap">
            <div className='ContentsHeader'>
                <button className='IconBtn' onClick={() => navigate("/")}>
                    <MdOutlineKeyboardArrowLeft className='Icon' />
                </button>
                <b className='RoomTitle'>{roomTitle}</b>

                {mode !== "VideoCall" ? null :
                    <button className='IconBtn' onClick={() => { setUsecam(!useCam) }}
                        style={{ backgroundColor: useCam ? "#44444444" : null }}
                    >
                        <FiCamera className='Icon' />
                    </button>
                }
                {mode !== "VideoCall" ? null :
                    <button className='IconBtn' onClick={() => { setUseMic(!useMic) }}
                        style={{ backgroundColor: useMic ? "#44444444" : null }}
                    >
                        <FiMic className='Icon' />
                    </button>
                }

                {!chatEnable ? null :
                    <button className='IconBtn' onClick={() => { setAutoScroll(!autoScroll) }}
                        style={{ backgroundColor: autoScroll ? "#44444444" : null }}
                    >
                        <BiArrowToBottom className='Icon' />
                    </button>
                }

                <button className='IconBtn' onClick={() => setMode(mode === "Meta" ? null : "Meta")}
                    style={{ backgroundColor: mode === "Meta" ? "#44444444" : null }}
                >
                    <MdPlayArrow className='Icon' />
                </button>
                <button className='IconBtn' onClick={() => setMode(mode === "VideoCall" ? null : "VideoCall")}
                    style={{ backgroundColor: mode === "VideoCall" ? "#44444444" : null }}
                >
                    <MdDesktopWindows className='Icon' />
                </button>
                <button className='IconBtn' onClick={() => setChatEnable(!chatEnable)}
                    style={{ backgroundColor: chatEnable ? "#44444444" : null }}
                >
                    <BiComment className='Icon' />
                </button>
                <button className='IconBtn' onClick={() => setMemberEnable(!memberEnable)}
                    style={{ backgroundColor: memberEnable ? "#44444444" : null }}
                >
                    <MdPerson className='Icon' />
                </button>
                <Popup
                    position="bottom right"
                    onClose={() => { setSelectedInviteMemberId([]) }}
                    trigger={<button className='IconBtn'><MdPersonAdd className='Icon' /></button>}
                >
                    <div className='InvitePopupWrap'>
                        <div className='InvitePopupMsg'>
                            <h3>초대할 멤버를 선택하세요</h3>
                        </div>
                        <div className='inviteListWrap'>
                            {inviteList}
                        </div>
                        <button className='InviteBtn' onClick={InviteMember}>초대하기</button>
                    </div>
                </Popup>
                <Setting
                    CamId={CamId}
                    MicId={MicId}
                    DeviceChanged={(deviceType, deviceId) => {
                        if(deviceType === "Cam") {
                            setCamId(deviceId);
                        } else {
                            setMicId(deviceId);
                        }
                    }}
                />

            </div>
            {Contents}
        </div>
    )
}