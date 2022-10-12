import React, { useEffect, useState } from "react"
import './VideoCall.css'
import VideoCell from "./VideoCell";

export default function VideoCall(props) {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        let newVideos = [];
        props.members.forEach(info => {
            let stream;
            if(info.userId.toLowerCase() === sessionStorage.getItem("userId").toLowerCase()) {
                if(props.useCam || props.useMic) {
                    stream = props.myStream;
                }
            } else {
                const streamId = props.streamInfo[info.userId]
                if(streamId) {
                    stream = props.peerStream[streamId];
                }
            }

            newVideos.push(
                <VideoCell
                    memberId={info.userId}
                    name={info.name}
                    Stream={stream}
                />
            )
        })

        setVideos(newVideos)
    }, [props.useCam, props.useMic, props.members, props.streamInfo, props.myStream, props.peerStream])

    let Contents;
    // switch (videos.length) {
    switch(10) {
        case 0:
        case 1:
            Contents = (
                <div className="VideoRow">
                    <div className="VideoSection">
                        {videos[0]}
                    </div>
                </div>
            )
            break;
        case 2:
        case 3:
        case 4:
            Contents = (
                <div className="VideoColumn">
                    <div className="VideoRow">
                        <div className="VideoSection">
                            {videos[0]}
                        </div>
                        <div className="VideoSection">
                            {videos[1]}
                        </div>
                    </div>
                    <div className="VideoRow">
                        <div className="VideoSection">
                            {videos[2]}
                        </div>
                        <div className="VideoSection">
                            {videos[3]}
                        </div>
                    </div>

                </div>
            )
            break;

        case 5:
        case 6:
            Contents = (
                <div className="VideoColumn">
                    <div className="VideoRow">
                        <div className="VideoSection">
                            {videos[0]}
                        </div>
                        <div className="VideoSection">
                            {videos[1]}
                        </div>
                        <div className="VideoSection">
                            {videos[2]}
                        </div>
                    </div>
                    <div className="VideoRow">
                        <div className="VideoSection">
                            {videos[3]}
                        </div>
                        <div className="VideoSection">
                            {videos[4]}
                        </div>
                        <div className="VideoSection">
                            {videos[5]}
                        </div>
                    </div>
                </div>
            )
            break;
        default:
            Contents = (
                <div className="VideoColumn">
                    <div className="VideoRow">
                        <div className="VideoSection">
                            {videos[0]}
                        </div>
                        <div className="VideoSection">
                            {videos[1]}
                        </div>
                        <div className="VideoSection">
                            {videos[2]}
                        </div>
                    </div>
                    <div className="VideoRow">
                        <div className="VideoSection">
                            {videos[3]}
                        </div>
                        <div className="VideoSection">
                            {videos[4]}
                        </div>
                        <div className="VideoSection">
                            {videos[5]}
                        </div>
                    </div>
                    <div className="VideoRow">
                        <div className="VideoSection">
                            {videos[6]}
                        </div>
                        <div className="VideoSection">
                            {videos[7]}
                        </div>
                        <div className="VideoSection">
                            {videos[8]}
                        </div>
                    </div>
                </div>
            )
            break;
    }


    return (
        <div className="VideoCall">
           {Contents} 
        </div>
    )
}