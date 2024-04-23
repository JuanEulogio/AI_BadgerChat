import { Col } from "react-bootstrap";
import Bucki from '../../../assets/bucki.png'
import Bucki_Error from '../../../assets/bucki_error.png'
import Bucki_Success from '../../../assets/bucki_success.png'
import { FaRegPlayCircle  } from "react-icons/fa";

import AIEmoteType from "./AIEmoteType";
import { useRef, useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { IoCodeDownload } from "react-icons/io5";


export default function AIMessage(props) {

    const audioControlsRef = useRef();
    const [isWaitingForAudio, setIsWaitingForAudio] = useState(false);
    const [audioURL, setAudioURL] = useState();

    async function playAudio () {
        if (audioURL) {
            audioControlsRef.current.play();
        } else {
            setIsWaitingForAudio(true);
            const data = await props.chatAgent.handleSynthesis(props.text);
            setIsWaitingForAudio(false);
            setAudioURL(data); 
        }
    }

    return <Col
        style={{width: "fit-content", maxWidth: "66.6666667%", display: "flex"}}
        xs={8}>
            <div style={{cursor: isWaitingForAudio || !props.text || props.text.length >= 280 ? "" : "pointer"}} onClick={() => props.text?.length < 280 ? playAudio() : undefined}>
                {
                    (() => {
                        switch(props.emote) {
                            case AIEmoteType.NORMAL:
                                return <img src={Bucki} style={{width: 32, height: 32}} alt="Bucki the Badger"/>
                            case AIEmoteType.ERROR:
                                return <img src={Bucki_Error} style={{width: 32, height: 32}} alt="Bucki the Badger (Error)"/>
                            case AIEmoteType.SUCCESS:
                                return <img src={Bucki_Success} style={{width: 32, height: 32}} alt="Bucki the Badger (Success)"/>
                        }
                    })()
                }
                {
                    props.text?.length < 280 && <>
                        <br/>
                        <div style={{float: "right", marginTop: "-0.75rem"}}>
                        {isWaitingForAudio ? <ClipLoader size={16} color="#36d7b7" /> : (audioURL ? <FaRegPlayCircle/> : <IoCodeDownload />)}
                        <audio ref={audioControlsRef} src={audioURL} style={{display: "hidden"}} />
                        </div>
                    </>
                }
            </div>
            
            <div className="ai-message">
                {props.children}
            </div>
        
    </Col>
}