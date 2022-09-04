import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ListViewer from '../Component/Home/ListViewer';
import Header from '../Component/Common/Header';
import Chat from '../Component/Chat/Chat';
import './Home.css';

function Home(props) {
    const navigate = useNavigate();
    const [isMobileMode, setMobileMode] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token === null || token === '') {
            navigate('/signin')
            return;
        }

        onResize();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize); // Unmounted
        }
    }, [navigate]);

    const onResize = () => {
        let width = window.innerWidth;

        if (width >= 800) {
            setMobileMode(false)
        } else {
            setMobileMode(true);
        }
    }

    const { roomId } = useParams();

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
                <Chat roomId={roomId}/>
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
                    <Chat roomId={roomId}/>
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