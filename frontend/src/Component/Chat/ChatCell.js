import defaultProfile from '../../res/defaultProfile.png';

export default function ChatCell(props) {

    let msg;
    if (props.type === "file") {
        msg = [];

        let files = props.msg.split(";");

        files.forEach(fileInfo => {
            const idx = fileInfo.lastIndexOf("|");

            if (idx < 0) return;

            let fileName = fileInfo.substring(0, idx)
            let fileId = fileInfo.substring(idx + 1)

            msg.push(
                <a
                    key={fileId}
                    className='FileLink'
                    href={`/api/chat/file?fileId=${fileId}&name=${fileName}`}
                >
                    {fileName}
                </a>
            )
        })

    } else {
        msg = props.msg;
    }

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
                    {msg}
                </div>
            </div>
        </div>
    )
}