import './ListViewer.css'

import { MdPerson, MdChatBubble, MdPersonAddAlt1 } from 'react-icons/md';
import { BiCommentAdd, BiDotsVerticalRounded } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

function ListCell(props) {
    return (
        <div className={props.selected ? 'selectedListCell' : 'listCell'}>
            <div className='subCell' onClick={() => {
                if (props.clicked) {
                    props.clicked(props)
                }
            }}>
                <div className='listCellImg'>
                    Img
                </div>
                <div className='listCellInfo'>
                    <div className='listCellTitle'>
                        {props.title}
                    </div>
                    <div className='listCellComment'>
                        {props.comment}
                    </div>
                </div>
            </div>
            <Popup
                position="bottom right"
                trigger={
                    <button className='listCellOption'>
                        <BiDotsVerticalRounded />
                    </button>
                }
            >
                <div className='optionBtnWrap'>
                    <button className='optionBtn'
                        onClick={() => {
                            if (props.deleteClicked)
                                props.deleteClicked();
                        }}
                    >삭제하기</button>
                </div>

            </Popup>

        </div>
    )
}

function ListViewer(props) {
    const navigate = useNavigate();
    const [selectedCategory, setCategory] = useState("chat");

    const [chatTitle, setChatTitle] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [inputedFriendId, setFriendId] = useState("");

    const [userInfo, setUserInfo] = useState({ friends: [], rooms: [] });

    const updateUserInfo = useCallback(() => {
        axios.get("/api/user/info", {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: { username: sessionStorage.getItem('username') }
        })
            .then(res => {
                if (res.status === 403) navigate('/signin')

                setUserInfo({
                    friends: res.data.friendsList,
                    rooms: res.data.roomList
                })
            })
            .catch(ex => {
                if (ex.response.status === 403) navigate('/signin')
            })
    }, [navigate, setUserInfo])

    useEffect(() => {
        updateUserInfo();
    }, [updateUserInfo])

    const userClicked = (friendInfo) => {
        if (selectedCategory === "newChat") {
            let newUsers = [...selectedUsers];
            const idx = newUsers.indexOf(friendInfo.id);
            if (idx > -1) {
                newUsers.splice(idx, 1);
            } else {
                newUsers.push(friendInfo.id);
            }
            setSelectedUsers(newUsers);
        }
    }

    const deleteFriends = (friendInfo) => {
        axios.delete('/api/user/friend', {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                userId: sessionStorage.getItem('username'),
                friendKey: friendInfo.id
            }
        }).then(res => {
            if (res.status === 403) {
                navigate('/signin')
                return;
            } else if (!res.data.result) {
                alert(res.data.msg)
                return;
            }

            updateUserInfo();
        }).catch(ex => {
            if (ex.response.status === 403) navigate('/signin')
        })
    }

    const exitChatRoom = (roomInfo) => {
        axios.delete('/api/chat/exit', {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                userId: sessionStorage.getItem('username'),
                chatId: roomInfo.chatId
            }
        }).then(res => {
            if (res.status === 403) {
                navigate('/signin')
                return;
            } else if (!res.data.result) {
                alert(res.data.msg)
                return;
            }

            updateUserInfo();
        }).catch(ex => {
            if (ex.response.status === 403) navigate('/signin')
        })
    }

    const joinChat = () => {
        axios.post('/api/chat/join', null, {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                title: chatTitle,
                userIds: [sessionStorage.getItem('username')].concat(selectedUsers),
            }
        })
            .then(res => {
                if (res.data.result) {
                    setCategory("chat");
                    setChatTitle("");
                    setSelectedUsers([]);
                    updateUserInfo();
                } else {
                    alert(res.data.msg)
                    return;
                }
            })
    }

    const friendAdd = () => {
        axios.post('/api/user/friend', null, {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                userId: sessionStorage.getItem('username'),
                friendId: inputedFriendId
            }
        }).then(res => {
            if (res.status === 403) {
                navigate('/signin')
                return;
            } else if (!res.data.result) {
                alert(res.data.msg)
                return;
            }

            updateUserInfo();

        }).catch(ex => {
            if (ex.response.status === 403) navigate('/signin')
        })
    }

    let ListCells = [];
    if ((selectedCategory === "profile" || selectedCategory === "newChat")) {
        userInfo.friends.forEach(friendInfo => {
            ListCells.push(
                <ListCell
                    key={friendInfo.id}
                    title={friendInfo.nickname}
                    comment={friendInfo.email}
                    chatId={friendInfo.chatId}
                    selected={selectedUsers.includes(friendInfo.id)}
                    clicked={() => userClicked(friendInfo)}
                    deleteClicked={() => deleteFriends(friendInfo)}
                />
            )
        })
    } else if (selectedCategory === "chat") {
        userInfo.rooms.forEach(roomInfo => {
            ListCells.push(
                <ListCell
                    key={roomInfo.chatId}
                    title={roomInfo.title}
                    comment={""}
                    chatId={roomInfo.chatId}
                    clicked={() => navigate("/chat/" + roomInfo.chatId)}
                    deleteClicked={() => exitChatRoom(roomInfo)}
                />
            )
        })
    }



    let newChatInfo = null;
    if (selectedCategory === "newChat") {
        newChatInfo = (
            <div className='newChatMsg'>
                <b>채팅방에 추가할 친구를 선택하세요.</b>
                <input className='chatTitleInput' placeholder='채팅방 이름' value={chatTitle} onChange={(e) => { setChatTitle(e.target.value) }} />
                <button onClick={joinChat}>채팅방 만들기</button>
            </div>
        )
    }

    return (
        <div id="listViewer">
            <div id="listHeader">
                <button className='listSelectBtn' onClick={() => {
                    if (selectedCategory === "newChat") {
                        setCategory("profile")
                        setSelectedUsers([])
                    } else {
                        setCategory("newChat")
                    }
                }}>
                    <BiCommentAdd className='listIcon' />
                </button>

                <Popup
                    position="bottom right"
                    trigger={<button className='listSelectBtn'> <MdPersonAddAlt1 className='listIcon' /> </button>}
                    onClose={() => setFriendId("")}
                >
                    <div id="FriendAddWrap">
                        <h3> 친구 추가하기 </h3>
                        <div className='inputWrap'>
                            <label> 친구 ID </label>
                            <input value={inputedFriendId} onChange={(e) => setFriendId(e.target.value)} />
                        </div>
                        <button id="FriendsAddBtn" onClick={friendAdd} > 추가하기 </button>
                    </div>
                </Popup>

            </div >
            {newChatInfo}
            <div id="listWrap">
                {ListCells}
            </div>
            <div id="listSelectWrap">
                <button className='listSelectBtn'
                    onClick={() => {
                        setCategory("profile")
                        setSelectedUsers([])
                    }}
                >
                    <MdPerson className={selectedCategory === "profile" ? 'selectedListIcon' : 'listIcon'} />
                </button>
                <button className='listSelectBtn'
                    onClick={() => {
                        setCategory("chat")
                        setSelectedUsers([])
                    }}
                >
                    <MdChatBubble className={selectedCategory === "chat" ? 'selectedListIcon' : 'listIcon'} />
                </button>
            </div>
        </div >
    )
}

export default ListViewer;