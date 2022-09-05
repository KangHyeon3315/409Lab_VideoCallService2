import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ListViewer from '../Component/Home/ListViewer';
import Header from '../Component/Common/Header';
import ChatCell from '../Component/Chat/ChatCell';
import Chat from '../Component/Chat/Chat';

import axios from 'axios';
import './Home.css';


function Home(props) {
    const navigate = useNavigate();
    const [isMobileMode, setMobileMode] = useState(false);
    const [isConnected, setConnected] = useState(false);
    const ws = useRef(null);
    const { roomId } = useParams();
    const [chatCmpList, setChatCmpList] = useState([]);
    const [selectedRoomTitle, setSelectedRoomTitle] = useState("Title")
    // const [members, setMembers] = useState([]);
    const [memberIds, setMemberIds] = useState([]);


    useEffect(() => {
        if (ws.current) {
            ws.current.onmessage = (evt) => {
                const userId = sessionStorage.getItem('username');
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

    useEffect(() => {
        if (!ws.current) {
            ws.current = new WebSocket("ws://localhost:8080/ws/chat");

            ws.current.onopen = () => {
                setConnected(true);
                ws.current.send(JSON.stringify({
                    type: "Join",
                    token: sessionStorage.getItem("token")
                }))
            }
            ws.current.onclose = (err) => {
                setConnected(false);
                console.log("close 1")
                console.log(err)
            }
            ws.current.onerror = (err) => {
                console.log("error")
                console.log(err)
            }
        }
        return () => {
            console.log("clean up");
            ws.current.close();
        }
    }, [])

    useEffect(() => {

        onResize();
        window.addEventListener('resize', onResize);

        const token = sessionStorage.getItem('token');
        if (token === null || token === '') {
            navigate('/signin')
            return;
        }

        if (roomId !== undefined) {
            const userId = sessionStorage.getItem('username');
            axios.get("/api/chat/info", {
                headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
                params: {
                    userId: userId,
                    chatId: roomId,
                }
            }).then(res => {
                if (res.status === 403) navigate('/signin')

                if (res.data.result) {
                    setSelectedRoomTitle(res.data.title);

                    let memberIdList = [];
                    res.data.members.forEach(memberInfo => {
                        memberIdList.push(memberInfo.userId);
                    })
                    setMemberIds(memberIdList);
                    // setMembers(res.data.members);
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
                } else {
                    alert(res.data.msg);
                }
            }).catch(ex => {
                console.log(ex)
                if (ex.response.status === 403) navigate('/signin')
            })
        }


        return () => {
            window.removeEventListener('resize', onResize); // Unmounted
        }
    }, [navigate, roomId]);


    const onResize = () => {
        let width = window.innerWidth;

        if (width >= 800) {
            setMobileMode(false)
        } else {
            setMobileMode(true);
        }
    }

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
                        users: memberIds,
                        msg: msg
                    }
                )
            )
        }

    }

    let contents;
    if (roomId === undefined && isMobileMode) {
        contents = (
            <div id='mobileItemList'>
                <ListViewer />
            </div>
        )
    } else if (isMobileMode) {
        contents = (
            <div id='contents'>
                <Chat roomId={roomId} />
            </div>
        )
    } else if (roomId === undefined) {
        contents = (
            <div id="contentsWrap">
                <div id='itemList'>
                    <ListViewer />
                </div>
                <div id='contents'>
                    채팅방을 선택하세요
                </div>
            </div>
        )
    } else {
        contents = (
            <div id="contentsWrap">
                <div id='itemList'>
                    <ListViewer />
                </div>
                <div id='contents'>
                    <Chat ChatRoomTitle={selectedRoomTitle} ChatCmpList={chatCmpList} SendMsg={SendMsg} />
                </div>
            </div>
        )
    }

    return (
        <div id="home">
            <Header />

            <div id="homeBody">
                {contents}
            </div>
        </div>
    )

}

export default Home;