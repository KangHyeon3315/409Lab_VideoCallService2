import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ListViewer from '../Component/Home/ListViewer';
import Header from '../Component/Common/Header';
import axios from 'axios';
import './Home.css';

function Home({ match }) {
    const navigate = useNavigate();
    const [isMobileMode, setMobileMode] = useState(false);
    const [friends, setFriends] = useState([]);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token === null || token === '') {
            navigate('/signin')
            return;
        }

        axios.get("/api/user/info", {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: { username: sessionStorage.getItem('username') }
        })
            .then(res => {
                if (res.status === 403) navigate('/signin')

                setFriends(res.data.friendsList)
                setRooms(res.data.roomList)
            })
            .catch(ex => {
                if (ex.response.status === 403) navigate('/signin')
            })

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


    let contents;
    if (isMobileMode) {
        contents = (
            <div id='mobileItemList'>
                <ListViewer friends={friends} rooms={rooms}/>
            </div>
        )
    } else {
        contents = (
            <div id="contentsWrap">
                <div id='itemList'>
                    <ListViewer friends={friends} rooms={rooms}/>
                </div>
                <div id='contents'>
                    채팅방을 선택하세요
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