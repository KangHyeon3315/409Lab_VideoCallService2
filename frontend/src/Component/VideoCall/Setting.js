import React, { useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import Popup from "reactjs-popup";

export default function Setting(props) {
    const [cameraList, setCameraList] = useState([]);
    const [audioList, setAudioList] = useState([]);

    useEffect(() => {
        getCamera();
        getAudios();
    }, [])

    const getCamera = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === "videoinput")

            setCameraList(cameras);
        } catch (ex) {
            console.log(ex);
        }
    }

    const getAudios = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audios = devices.filter(device => device.kind === "audioinput" && device.deviceId !== "default")
            setAudioList(audios);
        } catch (ex) {
            console.log(ex);
        }
    }

    const getCameraSelect = () => {
        let cameraOptionList = []
        cameraList.forEach(camera => {
            cameraOptionList.push(
                <option
                    key={camera.deviceId}
                    value={camera.deviceId}
                >
                    {camera.label}
                </option>
            )
        })
        return cameraOptionList;
    }

    const getAudioSelect = () => {
        let audioOptionList = [];
        audioList.forEach(audio => {
            audioOptionList.push(
                <option
                    key={audio.deviceId}
                    value={audio.deviceId}
                >
                    {audio.label}
                </option>
            )
        })
        return audioOptionList;
    }

    const DeviceChanged = (deviceType, deviceId) => {
        if (props.DeviceChanged)
            props.DeviceChanged(deviceType, deviceId);
    }

    return (
        <Popup
            modal
            nested
            trigger={<button className='IconBtn'> <MdSettings className="Icon" /> </button>}
        >
            <div className='SettingContainer'>
                <h2>Setting</h2>
                <div className='SettingCell'>
                    <label className='SettingLabel'>
                        Cam
                    </label>
                    <select
                        className='DeviceSelect'
                        value={props.CamId}
                        onChange={(e) => DeviceChanged("Cam", e.target.value)}
                    >
                        {getCameraSelect()}
                    </select>
                </div>
                <div className='SettingCell'>
                    <label className='SettingLabel' >
                        Mic
                    </label>
                    <select
                        className='DeviceSelect'
                        value={props.MicId}
                        onChange={(e) => DeviceChanged("Mic", e.target.value)}
                    >
                        {getAudioSelect()}
                    </select>
                </div>

            </div>

        </Popup>
    )
}