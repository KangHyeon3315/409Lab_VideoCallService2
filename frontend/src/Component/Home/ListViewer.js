import './ListViewer.css'

import { MdPerson, MdChatBubble } from 'react-icons/md';
import { useState } from 'react';

function ListCell(props) {
    return (
        <div className={props.selected ? 'selectedListCell' : 'listCell'}>
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
    )
}

function ListViewer(props) {
    const [selectedCategory, setCategory] = useState("chat");

    let ListCells = [];
    if(selectedCategory === "profile" && props.friends) {
        props.friends.forEach(friendInfo => {
            ListCells.push(
                <ListCell
                    key={friendInfo.id}
                    title={friendInfo.nickname}
                    comment={friendInfo.email}
                    chatId={friendInfo.chatId}
                />
            )
        }) 
    } else if(selectedCategory === "chat" && props.rooms) {
        props.rooms.forEach(roomInfo => {
            // TODO if room selected => selected props is true
            ListCells.push(
                <ListCell
                    key={roomInfo.chatId}
                    title={roomInfo.title}
                    comment={""}
                    chatId={roomInfo.chatId}
                />
            )
        }) 
    }

    return (
        <div id="listViewer">
            <div id="listWrap">
                {ListCells}
            </div>
            <div id="listSelectWrap">
                <button className='listSelectBtn'
                    onClick={() => {
                        setCategory("profile")
                    }}
                >
                    <MdPerson className={selectedCategory === "profile" ? 'selectedListIcon' : 'listIcon'} />
                </button>
                <button className='listSelectBtn'
                    onClick={() => {
                        setCategory("chat")
                    }}
                >
                    <MdChatBubble className={selectedCategory === "chat" ? 'selectedListIcon' : 'listIcon'}/>
                </button>
            </div>
        </div>
    )
}

export default ListViewer;