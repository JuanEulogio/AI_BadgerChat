import { memo } from "react";
import AIMessage from "./AIMessage";
import ClientMessage from "./ClientMessage";
import MessageType from "./MessageType";

const Message = (props) => {
    if (props.type === MessageType.AI) {
        return <AIMessage {...props} />
    } else if (props.type === MessageType.CLIENT) {
        return <ClientMessage {...props} />
    } else {
        console.error(`Encountered erroneous message type ${props.type}... Ignoring!`)
    }
}

// A message is immutable!
export default memo(Message, () => true);