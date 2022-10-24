import React, { useEffect, useState } from "react"
import './VideoCall.css'
import VideoCell from "./VideoCell";

export default function VideoCall(props) {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        let newVideos = [];
        props.members.forEach(info => {
            console.log(info)
            let stream = null;
            if (info.userId.toLowerCase() === sessionStorage.getItem("userId").toLowerCase()) {
                if (props.useCam || props.useMic) {
                    stream = props.myStream;
                }
            } else {
                const streamId = props.streamInfo[info.userId]
                if (streamId) {
                    stream = props.peerStream[streamId];
                }
            }

            newVideos.push(
                <VideoCell
                    key={info.userId}
                    memberId={info.userId}
                    name={info.name}
                    Stream={stream}
                    updateTime={new Date()}
                />
            )
        })

        setVideos(newVideos)

    }, [props.useCam, props.useMic, props.members, props.streamInfo, props.myStream, props.peerStream])

    let column;
    if (videos.length === 1) {
        column = "1fr";
    } else if (videos.length >= 2 && videos.length <= 4) {
        column = "1fr 1fr";
    } else {
        column = "1fr 1fr 1fr";
    }

    return (
        <div className="VideoCallBody">

            <div className="VideoCallGrid"
                style={{
                    display: "grid",
                    gridTemplateColumns: column,
                }}
            >
                {videos}
            </div>
        </div>

    )
}