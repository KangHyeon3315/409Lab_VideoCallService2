import './ListViewer.css'

import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdPerson, MdChatBubble, MdPersonAddAlt1 } from 'react-icons/md';
import { BiCommentAdd } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import axios from 'axios';

import ListCell from './ListCell';

import { useState } from 'react';

function ListViewer(props) {
    const navigate = useNavigate();
    const [folded, setFolded] = useState(false);
    const [selectedCategory, setCategory] = useState("chat");
    const [selectedUsers, setSelectedUsers] = useState([]);


    const [inputTitle, setInputTitle] = useState("");
    const [inputedFriendId, setFriendId] = useState("");

    const userCellClicked = (friendInfo) => {
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

            if (props.UpdateUserInfo)
                props.UpdateUserInfo();
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

            if (props.UpdateUserInfo)
                props.UpdateUserInfo();
        }).catch(ex => {
            if (ex.response.status === 403) navigate('/signin')
        })
    }

    const joinChat = () => {
        axios.post('/api/chat/join', null, {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: {
                title: inputTitle,
                userIds: [sessionStorage.getItem('username')].concat(selectedUsers),
            }
        })
            .then(res => {
                if (res.data.result) {
                    setCategory("chat");
                    setInputTitle("");
                    setSelectedUsers([]);
                    if (props.UpdateUserInfo)
                        props.UpdateUserInfo();

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

            if (props.UpdateUserInfo)
                props.UpdateUserInfo();

        }).catch(ex => {
            if (ex.response.status === 403) navigate('/signin')
        })
    }

    let ListCells = [];
    if ((selectedCategory === "profile" || selectedCategory === "newChat")) {
        if (props.userInfo)
            props.userInfo.friends.forEach(friendInfo => {
                ListCells.push(
                    <ListCell
                        key={friendInfo.id}
                        title={friendInfo.nickname}
                        comment={friendInfo.email}
                        chatId={friendInfo.chatId}
                        selected={selectedUsers.includes(friendInfo.id)}
                        clicked={() => userCellClicked(friendInfo)}
                        deleteClicked={() => deleteFriends(friendInfo)}
                    />
                )
            })
    } else if (selectedCategory === "chat") {
        if (props.userInfo)
            props.userInfo.rooms.forEach(roomInfo => {
                ListCells.push(
                    <ListCell
                        key={roomInfo.chatId}
                        title={roomInfo.title}
                        comment={""}
                        chatId={roomInfo.chatId}
                        clicked={() => { navigate("/chat/" + roomInfo.chatId) }}
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
                <input className='chatTitleInput' placeholder='채팅방 이름' value={inputTitle} onChange={(e) => { setInputTitle(e.target.value) }} />
                <button onClick={joinChat}>채팅방 만들기</button>
            </div>
        )
    }

    let Contents;
    if (folded) {
        Contents = (
            <div id="listContents">
                <button className='IconBtn' onClick={() => {
                    setFolded(!folded)
                }}>
                    {<MdOutlineKeyboardArrowRight className='Icon' />}
                </button>
            </div>
        )
    } else {
        Contents = (
            <div id="listContents" style={{ width: 300 }}>
                <div id="listHeader">
                    <div id="listHeader2">
                        <button className='IconBtn'
                            style={{ backgroundColor: selectedCategory === "newChat" ? "#44444444" : null }}
                            onClick={() => {
                                if (selectedCategory === "newChat") {
                                    setCategory("profile")
                                    setSelectedUsers([])
                                } else {
                                    setCategory("newChat")
                                }
                            }}
                        >
                            <BiCommentAdd className='Icon' />
                        </button>

                        <Popup
                            position="bottom center"
                            trigger={<button className='IconBtn'> <MdPersonAddAlt1 className='Icon' /> </button>}
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
                    </div>
                    <button className='IconBtn' onClick={() => {
                        setFolded(!folded)
                    }}>
                        {<MdOutlineKeyboardArrowLeft className='Icon' />}
                    </button>

                </div >

                <div id="listWrap">
                    {newChatInfo}
                    <div id="listCellWrap">
                        {ListCells}
                    </div>
                </div>
                <div id="listSelectWrap">
                    <button className='IconBtn'
                        style={{ backgroundColor: selectedCategory === "profile" ? "#44444444" : null }}
                        onClick={() => {
                            setCategory("profile")
                            setSelectedUsers([])
                        }}
                    >
                        <MdPerson className='Icon' />
                    </button>
                    <button className='IconBtn'
                        style={{ backgroundColor: selectedCategory === "chat" ? "#44444444" : null }}
                        onClick={() => {
                            setCategory("chat")
                            setSelectedUsers([])
                        }}
                    >
                        <MdChatBubble className='Icon' />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div id="listViewer">
            {Contents}
        </div >
    )
};

export default ListViewer;