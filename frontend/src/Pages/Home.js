import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ListViewer from '../Component/Home/ListViewer';
import Header from '../Component/Common/Header';
import axios from 'axios';
import './Home.css';

function Home({ match }) {
    const navigate = useNavigate();
    const [isMobileMode, setMobileMode] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token === null || token === '') {
            navigate('/signin')
            return;
        } 

        axios.get("/api/user/info", {
            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), }
        })
        .then(res => {
            if (res.status === 403) navigate('/signin')

            console.log(res)
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
                <ListViewer />
            </div>
        )
    } else {
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
    }

    return (
        <div id="home">
            <Header/>
            <div id="homeBody">
                {contents}
            </div>
        </div>
    )

}

export default Home;