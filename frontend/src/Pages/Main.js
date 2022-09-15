import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import ListViewer from '../Component/Home/ListViewer';
import Contents from '../Component/Common/Contents';
import Header from '../Component/Common/Header';
import './Main.css';

function Main(props) {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState({ friends: [], rooms: [] });

    const updateUserInfo = useCallback(() => {
        axios.get("/api/user/info", {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
            params: { username: sessionStorage.getItem('userId') }
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
    }, [navigate]);

    useEffect(() => {
        updateUserInfo();
    }, [updateUserInfo])

    return (
        <div id="main">
            <Header />
            <div id="mainBody">
                <ListViewer userInfo={userInfo} UpdateUserInfo={updateUserInfo}/>
                <Contents userInfo={userInfo}/>
            </div>
        </div>
    )

}

export default Main;