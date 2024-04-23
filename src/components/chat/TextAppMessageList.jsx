import { useEffect, useRef } from "react";
import { Container, Row } from "react-bootstrap";
import Message from "./messages/Message";

export default function TextAppMessageList(props) {

    const lastItem = useRef();

    useEffect(() => {
        lastItem.current?.scrollIntoView({ behavior: 'smooth' })
    }, [props.messages])

    return <Container className="message-list">
        {props.messages.map((message, i) => (
            <div
                ref={i === props.messages.length - 1 ? lastItem : undefined}
                key={i}
            >
                <Row style={{ display: "flow-root", marginBottom: "0.5rem" }}>
                    <Message {...message} chatAgent={props.chatAgent}>
                        <p>{message.text}</p>
                    </Message>
                </Row>
            </div>
        ))}
    </Container>
}