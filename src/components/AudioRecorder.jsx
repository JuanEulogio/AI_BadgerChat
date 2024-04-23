import React, { useRef, useState } from 'react';
import { HiOutlineMicrophone } from "react-icons/hi";

import useRecorder from '../hooks/useRecorder';
import { ClipLoader, PuffLoader } from 'react-spinners';
import { MdOutlineReplay } from 'react-icons/md';

function AudioRecorder(props) {

    const [audioURL, setAudioURL] = useState('');
    const [isWaitingForAudio, setIsWaitingForAudio] = useState(false); 

    const recorder = useRecorder();
    const audioControlsRef = useRef();


    const startRecording = async () => {
        props.setIsTranscribing(true);
        await recorder.startRecording(async () => {
            setIsWaitingForAudio(false);
            setAudioURL(recorder.getRecordedCompressionAsURLObject());
            await transcribe();
            props.setIsTranscribing(false);
        });
        setIsWaitingForAudio(true);
    };

    const stopRecording = () => {
        recorder.stopRecording();
    };

    const playbackAudio = () => {
        audioControlsRef.current.play()
    }

    const transcribe = async () => {
        const soundObj = await recorder.getRecordedRawSoundData();
        const transcription = await props.chatAgent.handleTranscription(soundObj.sound, soundObj.contentType);
        if (transcription) {
            props.setInput(transcription);
        }
    }

    return (
        <div style={{display: "inline-flex"}}>
            {
                !isWaitingForAudio && props.isTranscribing ? <div style={{ marginTop: 8, marginRight: 8 }}>
                    <ClipLoader size={16} color="#36d7b7" />
                </div> : (
                    isWaitingForAudio ?
                        <div style={{
                            marginTop: 8,
                            marginRight: 8,
                            cursor: "pointer" 
                        }} onClick={stopRecording}>
                            <PuffLoader size={16} color="#cc1b18" />
                        </div>
                        : <HiOutlineMicrophone style={{
                            height: "100%",
                            marginRight: "0.5rem",
                            cursor: "pointer"
                        }} onClick={startRecording} />
                )

            }
            
            {!isWaitingForAudio && audioURL && <>
                <MdOutlineReplay onClick={playbackAudio} style={{cursor: "pointer", height: "100%", marginRight: "0.5rem"}}/>
                <audio ref={audioControlsRef} src={audioURL} style={{display: "hidden"}} />
            </>}
        </div>
    );
}

export default AudioRecorder;
