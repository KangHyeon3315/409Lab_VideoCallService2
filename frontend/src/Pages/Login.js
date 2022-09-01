import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'

function Login() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');

    const onLogin = (e) => {
        e.preventDefault();
                
        axios.post('/api/auth/signin', null, {
            params: {
                username: userId,
                password: userPw,
            }
        }).then(res => {
            if(res.status === 200 && res.data.result === true) {
                sessionStorage.setItem("token", res.data.token)
                
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
                <h1 id='LoginLabel'>Login</h1>
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
                            <tr className='EmptyTr' />
                            <tr className='Btn'>
                                <td colSpan={2}>
                                    <Link to="/signup">회원가입</Link>
                                </td>
                            </tr>
                            <tr className='Btn'>
                                <td colSpan={2}>
                                    <button id='LoginBtn' onClick={onLogin}>로그인</button>
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

export default Login;