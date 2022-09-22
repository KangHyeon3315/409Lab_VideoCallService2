import React, { useEffect, useRef } from "react"
import './VideoCall.css'

export default function VideoCall(props) {
    const videoRef = useRef([]);

    useEffect(() => {
        if(props.myStream) videoRef.current[0].srcObject = props.myStream;
        else videoRef.current[0].srcObject = null;
    }, [props.myStream])

    let videoList = [];
    for (let i = 0; i < 9; i++) {
        videoList.push(<video className="Video" autoPlay playsInline ref={(el) => videoRef.current.push(el)} />)
    }

    let Contents;
    // switch (MemberList.length) {
    let count = 9;
    switch (count) {
        case 0:
        case 1:
            Contents = (
                <div className="VideoRow">
                    <div className="VideoSection">
                        {videoList[0]}
                    </div>
                </div>
            )
            break;
        case 2:
        case 3:
        case 4:
            Contents = (
                <div className="VideoRow">
                    <div className="VideoColumn">
                        <div className="VideoSection">
                            {videoList[0]}
                        </div>
                        <div className="VideoSection">
                            {videoList[1]}
                        </div>
                    </div>
                    <div className="VideoColumn">
                        <div className="VideoSection">
                            {videoList[2]}
                        </div>
                        <div className="VideoSection">
                            {videoList[3]}
                        </div>
                    </div>

                </div>
            )
            break;

        case 5:
        case 6:
            Contents = (
                <div className="VideoRow">
                    <div className="VideoColumn">
                        <div className="VideoSection">
                            {videoList[0]}
                        </div>
                        <div className="VideoSection">
                            {videoList[1]}
                        </div>
                        <div className="VideoSection">
                            {videoList[2]}
                        </div>
                    </div>
                    <div className="VideoColumn">
                        <div className="VideoSection">
                            {videoList[3]}
                        </div>
                        <div className="VideoSection">
                            {videoList[4]}
                        </div>
                        <div className="VideoSection">
                            {videoList[5]}
                        </div>
                    </div>
                </div>
            )
            break;
        default:
            Contents = (
                <div className="VideoRow">
                    <div className="VideoColumn">
                        <div className="VideoSection">
                            {videoList[0]}
                        </div>
                        <div className="VideoSection">
                            {videoList[1]}
                        </div>
                        <div className="VideoSection">
                            {videoList[2]}
                        </div>
                    </div>
                    <div className="VideoColumn">
                        <div className="VideoSection">
                            {videoList[3]}
                        </div>
                        <div className="VideoSection">
                            {videoList[4]}
                        </div>
                        <div className="VideoSection">
                            {videoList[5]}
                        </div>
                    </div>
                    <div className="VideoColumn">
                        <div className="VideoSection">
                            {videoList[6]}
                        </div>
                        <div className="VideoSection">
                            {videoList[7]}
                        </div>
                        <div className="VideoSection">
                            {videoList[8]}
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