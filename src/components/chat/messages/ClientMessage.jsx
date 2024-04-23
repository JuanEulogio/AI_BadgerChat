import { Col } from "react-bootstrap";

export default function ClientMessage(props) {
    return <Col
        className="client-message"
        style={{ width: "fit-content" }}
        xs={{ span: 8, offset: 4 }}>
        {props.children}
    </Col>
}