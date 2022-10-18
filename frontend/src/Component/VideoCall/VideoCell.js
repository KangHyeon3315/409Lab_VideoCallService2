import React, { useEffect, useRef } from "react";
import './VideoCell.css';

export default function VideoCell(props) {
    let vidoeRef = useRef(null)

    useEffect(() => {
        console.log('Stream!!!!')
        console.log(props.Stream)
        if (props.Stream && vidoeRef.current) {
            vidoeRef.current.srcObject = props.Stream;
        }
    }, [props.Stream])

    return (
        <div className="VideoContainer">
            <video
                autoPlay
                playsInline
                className="Video"
                ref={vidoeRef}
            />
            <div className="NameLabelWrap">
                <label className="NameLabel">
                    {props.name}
                </label>
            </div>
        </div>
    )
}