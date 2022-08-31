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

function ListViewer() {
    const [selectedCategory, setCategory] = useState("chat");

    return (
        <div id="listViewer">
            <div id="listWrap">
                <ListCell title="Test1Test1Test1Test1Test1Test1Test1Test1Test1" comment="Test" selected={true}/>
                <ListCell title="Test1" comment="Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
                <ListCell title="Test1" comment="Test"/>
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