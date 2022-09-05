import defaultProfile from '../../res/defaultProfile.png';

export default function ChatCell(props) {
    return (
        <div className={props.myChat ? "MyChatCell" : 'ChatCell'}>
            <div className='Profile'>
                <img className='profileImg' alt="profile" src={defaultProfile} width="100%" height="100%" />
            </div>
            <div className='ChatInfo'>
                <div className={props.myChat ? "MyChatSendInfo" : 'ChatSendInfo'}>
                    <div className='Sender'>
                        {props.sender}
                    </div>
                    <div className='SendTime'>
                        {props.time}
                    </div>
                </div>

                <div className={props.myChat ? "MyChatMsg" : 'ChatMsg'}>
                    {props.msg}
                </div>
            </div>
        </div>
    )
}