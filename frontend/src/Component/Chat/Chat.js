import { MdSend } from 'react-icons/md';
import { FiPaperclip } from 'react-icons/fi';

import './Chat.css'
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

export default function Chat(props) {
    const [fileList, setFileList] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const chatBody = useRef(null);
    const fileUploadBtnRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        if (chatBody.current && props.scrollBottom) {
            chatBody.current.scrollTop = chatBody.current.scrollHeight;
        }
    }, [chatBody, props.scrollBottom])

    useEffect(() => {
        scrollToBottom();
    }, [scrollToBottom])

    function onSaveFiles(e) {
        const uploadFiles = Array.prototype.slice.call(e.target.files); // 파일선택창에서 선택한 파일들

        let newFileList = [...fileList]
        uploadFiles.forEach((uploadFile) => {
            newFileList.push(uploadFile);
        });
        setFileList(newFileList)
    };


    let footCmp;
    if (fileList.length > 0) {
        let fileCmpList = [];
        for (let i = 0; i < fileList.length; i++) {
            let file = fileList[i];

            fileCmpList.push(
                <div
                    key={i}
                    className='fileCell'

                >
                    <div>
                        {file.name}
                    </div>
                    <div className='FileCancel'
                        onClick={() => {
                            let newFileList = [...fileList];
                            newFileList.splice(i, 1)
                            setFileList(newFileList)
                        }}
                    >
                        X
                    </div>
                </div>
            )
        }

        footCmp = (
            <div className='fileListContainer'>
                {fileCmpList}
            </div>
        )

    } else {
        footCmp = <input className='ChatInput' value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} />
    }


    return (
        <div className='ChatWrap'>
            <div className='ChatBody' ref={chatBody}>
                <div className='TopSpacer' />
                {props.ChatCmpList}
            </div>

            <div className='ChatFooter'>
                <input className='ChatFileUploadBtn' type="file" ref={fileUploadBtnRef} multiple onChange={onSaveFiles} />
                <button className='IconBtn' onClick={() => fileUploadBtnRef.current.click()}><FiPaperclip className='Icon' /></button>
                <form className='ChatForm' onSubmit={(e) => {
                    e.preventDefault();

                    if (fileList.length > 0) {
                        // File 전송
                        const formData = new FormData();

                        fileList.forEach((file) => {
                            formData.append('files', file); // 파일 데이터 저장
                        });

                        // 또 다른 Param을 넘기고 싶으면 다음과 같이 직렬화해 객체로 저장
                        formData.append('roomId', props.roomId);
                        formData.append('userId', sessionStorage.getItem('userId'));

                        axios.post('/api/chat/file', formData, {
                            headers: { "X-AUTH-TOKEN": sessionStorage.getItem('token'), },
                        });
                    } else {
                        // msg 전송
                        if (props.SendMsg) {
                            props.SendMsg(inputMsg)
                        }
                    }

                    setInputMsg("");
                    setFileList([])
                }}>
                    {footCmp}
                    <button className='IconBtn'><MdSend className='Icon' /></button>
                </form>
            </div>

        </div>
    )
}