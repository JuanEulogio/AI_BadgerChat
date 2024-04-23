import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { BeatLoader } from 'react-spinners';

import TextAppMessageList from './TextAppMessageList';
import MessageType from './messages/MessageType';

import createChatAgent from '../../agent/ChatAgent';
import AudioRecorder from '../AudioRecorder';
import AIEmoteType from './messages/AIEmoteType';
import { logout } from '../../agent/Util';

const LOGOUT_ON_HOTRELOAD = true;

function TextApp() {
    const callbackQueueRef = useRef([]);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isSensitive, setIsSensitive] = useState(false);
    const [input, setInput] = useState("");


    const chatAgent = useMemo(() => createChatAgent(), []);

    const addMessage = (m) => {
        setMessages(o => [...o, m]);
    }

    const addClientMessage = (txt) => {
        addMessage({ type: MessageType.CLIENT, text: txt })
    }

    const addAIMessage = (txt, emote) => {
        addMessage({ type: MessageType.AI, text: txt, emote: emote})
    }

    useEffect(() => {
        if (LOGOUT_ON_HOTRELOAD) {
            logout();
        }
    }, [])

    useEffect(() => {
        setIsLoading(true);
        chatAgent.handleInitialize().then(m => {
            handleAIMessages(m)
        })
    }, [])

    const handleSend = (e) => {
        e?.preventDefault();
        const trimmedInput = input.trim();
        if (trimmedInput) {
            if (isSensitive) {
                addClientMessage("Sensitive information redacted!");
            } else {
                addClientMessage(trimmedInput);
            }
            setIsLoading(true);
            chatAgent.handleReceive(input).then(m => {
                handleAIMessages(m)
            });
            setInput("");
            setIsSensitive(false);
        }
    };

    function handleAIMessages(ms) {
        if(Array.isArray(ms)) {
            ms.forEach((m, i) => setTimeout(() => {
                handleAIMessage(m)
                if (i === ms.length - 1) {
                    setIsLoading(false);
                }
            }, i * 750));
        } else {
            handleAIMessage(ms)
            setIsLoading(false);
        }
        
    }

    function handleAIMessage(m) {
        if(typeof(m) === 'object') {
            if (m.nextIsSensitive) {
                setIsSensitive(true);
            }
            addAIMessage(m.msg, m.emote ?? AIEmoteType.NORMAL);
        } else {
            addAIMessage(m, AIEmoteType.NORMAL);
        }
    }

    return (
        <div className="app">
            <TextAppMessageList messages={messages} chatAgent={chatAgent} />
            {isLoading ? <BeatLoader color="#36d7b7" /> : <></>}
            <div className="input-area">
                <AudioRecorder
                    setInput={(i) => setInput(i)}
                    isTranscribing={isTranscribing}
                    setIsTranscribing={setIsTranscribing}
                    chatAgent={chatAgent}
                />
                <Form className="inline-form" onSubmit={handleSend}>
                    <Form.Control
                        value={input}
                        type={isSensitive ? "password" : "text"}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isTranscribing}
                        style={{ marginRight: "0.5rem", display: "flex" }}
                        placeholder="Type a message..."
                        aria-label='Type and submit to send a message.'
                    />
                    <Button type='submit' disabled={isLoading || isTranscribing || !input.trim()}>Send</Button>
                </Form>
            </div>
        </div>
    );
}

export default TextApp;
