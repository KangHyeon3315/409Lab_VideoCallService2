import './Contents.css'

import { MdOutlineKeyboardArrowLeft, MdPlayArrow, MdDesktopWindows, MdPerson, MdPersonAdd } from 'react-icons/md';
import { BiArrowToBottom, BiComment } from 'react-icons/bi';
import { FiCamera, FiMic } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom'
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    const [myStream, setMyStream] = useState(null);

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

    const PeerConn = useRef({});
    // const [trackSenders, setTrackSenders] = useState([]);

    /** 현재 시간을 YYYY-MM-DD hh:mm:ss 형식으로 변환*/
    const getTimeStr = () => {
        var today = new Date();
        today.setHours(today.getHours() + 9);
        return today.toISOString().replace('T', ' ').substring(0, 19);
    }

    /** 사용자가 입력한 채팅 문자열을 다른 유저들에게 Broadcasting */
    const SendMsg = (msg) => {
        SendData({
            type: "Chat",
            token: sessionStorage.getItem("token"),
            room: roomId,
            time: getTimeStr(),
            msg: msg
        })
    }

    /** JSON 형식의 데이터를 서버에 WebSock 방식으로 전송 */
    const SendData = useCallback((data) => {
        if (ws.current && isConnected && roomId) {
            ws.current.send(JSON.stringify(data));
            return true;
        } else {
            return false;
        }
    }, [isConnected, roomId])

    /** 현재 채팅방에 새로운 Member 초대 */
    const InviteMember = async () => {
        const res = await axios.post('/api/chat/invite', null, {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                chatId: roomId,
                userIds: selectedInviteMemberId,
            }
        })

        if (res.data.result) {
            setMemberIds(memberIds.concat(selectedInviteMemberId))
            setSelectedInviteMemberId([]);
        } else {
            alert(res.data.msg)
            return;
        }
    }

    /** 채팅을 수신받은 경우 chatList에 Chat 정보를 Component로 추가 */
    const chatRecv = useCallback((data) => {
        const userId = sessionStorage.getItem('userId');
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
    }, [chatCmpList])

    /** Media Stream을 생성 */
    const getMediaStream = useCallback(async (camId, micId) => {
        try {
            if (myStream) myStream.getTracks().forEach((track) => { track.stop() })

            let newMyStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: micId === undefined ? MicId : micId },
                video: { deviceId: camId === undefined ? CamId : camId },
            });
            newMyStream.getAudioTracks().forEach((track) => (track.enabled = useMic))
            newMyStream.getVideoTracks().forEach((track) => (track.enabled = useCam))

            console.log("MediaStream Created")
            setMyStream(newMyStream);
        } catch (ex) {
            console.log(ex);
        }
    }, [myStream, useCam, useMic, CamId, MicId])

    useEffect(() => {
        // mode가 VideoCall이면서 myStream이 null인 경우 새로운 mediaStream 생성
        // videoCall이 아닌데 mediaStream이 null이 아닌경우 Stream 중지
        if (mode === "VideoCall" && myStream === null) {
            getMediaStream();
        } else if (mode !== "VideoCall" && myStream !== null) {
            myStream.getTracks().forEach((track) => { track.stop() })
        }
    }, [mode, myStream, getMediaStream])

    useEffect(() => {
        // mic및 cam 사용을 토글 하는 경우 mediaStream을 수정
        if (myStream === null) return;
        myStream.getAudioTracks().forEach((track) => (track.enabled = useMic))
        myStream.getVideoTracks().forEach((track) => (track.enabled = useCam))
    }, [myStream, useCam, useMic])

    const handleIce = useCallback((data) => {
        console.log("============ got ice candidate ============");
        console.log(data);
    }, [])

    /** 새로운 유저가 접속했다고 수신받은 경우 Offer를 생성해 전송 */
    const enteredRecv = useCallback(async (memberId) => {
        PeerConn.current[memberId] = new RTCPeerConnection();
        PeerConn.current[memberId].onicecandidate = handleIce;
        console.log("RTCPeerConnection Created")

        if (myStream)
            myStream.getTracks().forEach((track) => PeerConn.current[memberId].addTrack(track, myStream))

        console.log("Recv Entered")
        const offer = await PeerConn.current[memberId].createOffer();

        PeerConn.current[memberId].setLocalDescription(offer);
        console.log("Send My Offer");
        SendData({
            type: "Offer",
            token: sessionStorage.getItem("token"),
            offer: offer,
            roomId: roomId,
            target: memberId,
        })
    }, [roomId, SendData, handleIce, myStream])

    /** Offer를 수신받은 경우 Answer를 생성해 응답 */
    const offerRecv = useCallback(async (data) => {

        const offer = data.offer;
        const targetId = data.userId;

        PeerConn.current[targetId] = new RTCPeerConnection();
        PeerConn.current[targetId].onicecandidate = handleIce;
        console.log("RTCPeerConnection Created")
        if (myStream)
            myStream.getTracks().forEach((track) => PeerConn.current[targetId].addTrack(track, myStream))


        console.log("Recv Target Offer")
        await PeerConn.current[targetId].setRemoteDescription(offer);
        let answer = await PeerConn.current[targetId].createAnswer();
        await PeerConn.current[targetId].setLocalDescription(answer);

        console.log("Send My Answer")
        SendData({
            type: "Answer",
            token: sessionStorage.getItem("token"),
            answer: answer,
            roomId: roomId,
            target: targetId,
        })

    }, [SendData, roomId, handleIce, myStream])

    /** Answer를 수신받은 경우 처리 */
    const answerRecv = useCallback(async (data) => {
        const answer = data.answer;
        const targetId = data.userId;

        console.log("Recv Answer");
        PeerConn.current[targetId].setRemoteDescription(answer);
    }, [])

    /** WebSocket에서 데이터를 수신받은 경우 데이터의 타입에 따라서 처리하는 메서드 호출 */
    const RecvData = useCallback((data) => {
        const type = data.type;

        if (type === "Chat") {
            chatRecv(data);
        } else if (type === "Entered") {
            const userId = data.userId;
            if (userId === sessionStorage.getItem("userId")) return;
            enteredRecv(userId);
        } else if (type === "Offer") {
            offerRecv(data)
        } else if (type === "Answer") {
            answerRecv(data);
        } else {
            console.log("Unkown Data Recv")
            console.log(data);
        }
    }, [chatRecv, enteredRecv, offerRecv, answerRecv])

    /** 컴포넌트가 처음 로드됐을 때 WebSocket 생성 */
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
        ws.current.onmessage = (evt) => { RecvData(JSON.parse(evt.data)) } // RecvData가 업데이트 될 때 onmessage 이벤트를 다시 등록
    }, [RecvData])


    useEffect(() => {
        // 새로운 room에 접속한 경우 자신이 접속했다는 정보를 서버에 전송
        const result = SendData({
            type: "Enter",
            token: sessionStorage.getItem("token"),
            roomId: roomId,
        })
        if (result) console.log("Send Room Entered")
    }, [roomId, SendData])

    /** 서버에서 접속 전의 채팅 정보와 맴버 정보를 요청 후 업데이트 */
    const getChatInfo = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (token === null || token === '') { navigate('/signin'); return; }
            if (roomId === undefined) return;

            const userId = sessionStorage.getItem('userId');

            const res = await axios.get("/api/chat/info", {
                headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
                params: {
                    userId: userId,
                    chatId: roomId,
                }
            })
            if (res.status === 403) {
                navigate('/signin')
                return;
            }
            if (!res.data.result) {
                alert(res.data.msg);
                return;
            }

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

            setChatCmpList(chatList);

        } catch (ex) {
            console.log(ex)
            if (ex.response.status === 403) navigate('/signin')
        }
    }, [navigate, roomId])


    useEffect(() => {
        getChatInfo();
    }, [getChatInfo]);

    /** 초대가 가능한 User 목록을 가져오기 */
    const getInviteList = () => {
        let inviteList = [];
        if (!props.userInfo) return inviteList;

        props.userInfo.friends.forEach(friend => {
            if (memberIds.includes(friend.id)) return;
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

        })
        return inviteList;
    }

    const getContentsCmp = () => {
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
                        myStream={myStream}
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

        return Contents;
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
                            {getInviteList()}
                        </div>
                        <button className='InviteBtn' onClick={InviteMember}>초대하기</button>
                    </div>
                </Popup>
                <Setting
                    CamId={CamId}
                    MicId={MicId}
                    DeviceChanged={(deviceType, deviceId) => {
                        if (deviceType === "Cam") {
                            setCamId(deviceId);
                            getMediaStream(deviceId, MicId);
                        } else {
                            setMicId(deviceId);
                            getMediaStream(CamId, deviceId);
                        }
                    }}
                />

            </div>
            {getContentsCmp()}
        </div>
    )
}
