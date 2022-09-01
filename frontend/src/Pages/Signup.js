import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.css'

function Signup() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const onSignup = (e) => {
        e.preventDefault();
                
        axios.post('/api/auth/signup', null, {
            params: {
                username: userId,
                password: userPw,
                nickname: userName,
                email: userEmail,
                role: "ADMIN"
            }
        }).then(res => {
            if(res.status === 200 && res.data.result === true) {
                navigate('/')
            } else if(res.status === 200){
                alert(res.data.msg)
            } else {
                alert("서버에 요청을 실패했습니다.");
            }
            
        })
        
    }

    return (
        <div id='LoginPage'>
            <div id='LoginSection'>
                <h1 id='LoginLabel'>Signup</h1>
                <form id="LoginForm">
                    <table>
                        <tbody>
                            <tr className='EmptyTr' />
                            <tr className='InputTr'>
                                <td>
                                    ID
                                </td>
                                <td>
                                    <input className='LoginInput' value={userId} onChange={(e) => setUserId(e.target.value)}/>
                                </td>
                            </tr>
                            <tr className='InputTr'>
                                <td>
                                    PW
                                </td>
                                <td>
                                <input className='LoginInput' type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)}/>
                                </td>
                            </tr>
                            <tr className='InputTr'>
                                <td>
                                    Name
                                </td>
                                <td>
                                    <input className='LoginInput' value={userName} onChange={(e) => setUserName(e.target.value)}/>
                                </td>
                            </tr>
                            <tr className='InputTr'>
                                <td>
                                    email
                                </td>
                                <td>
                                    <input className='LoginInput' value={userEmail} onChange={(e) => setUserEmail(e.target.value)}/>
                                </td>
                            </tr>
                            <tr className='EmptyTr' />
                            <tr className='Btn'>
                                <td colSpan={2}>
                                    <button id='LoginBtn' onClick={onSignup}>회원가입</button>
                                </td>
                            </tr>
                            <tr className='EmptyTr' />
                            <tr className='EmptyTr' />
                        </tbody>

                    </table>
                </form>
                <div/>
            </div>
        </div>

    )
}

export default Signup;