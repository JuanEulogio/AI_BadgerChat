import { isLoggedIn, ofRandom, getLoggedInUsername, logout} from "../Util"
import AIEmoteType from "../../components/chat/messages/AIEmoteType";


const createPostSubAgent = (end) => {

    const CS571_WITAI_ACCESS_TOKEN = "YV5AFFM6MIYMHMKXM6MSIUIB6CBXT42Q"; // Put your CLIENT access token here.

    let stage;

    let chatroom, title, content;

    /**the agent should first check if the user is currently logged in. 
     * If the user is not currently logged in, the agent should inform them that need to be logged in before creating a post.
     
     * After collecting the title and content, the agent should do a final confirmation with the user. 
     * If a user confirms that they would like to create the post, 
     * a post should be made in the specified chatroom and the agent should inform the user as such. 
     * Otherwise, if the user fails to confirm the posting, 
     * the agent should not post the message and assure the user that the post has not been made.
    */
const handleInitialize = async (promptData) => {
        if (await isLoggedIn()) {
            stage = "FOLLOWUP_CHATROOM";
            return ofRandom([
                "Got it. Please specify what chatroom you want to post on?",
                "On it. What chatroom would you like to post to?"
            ])
        } else {
            return end(ofRandom([
                "You are currently not logged in. Please sign in to post",
                "Please sign in to post"
            ]))
        }
    }

    const handleReceive = async (prompt) => {
        switch(stage) {
            //NOTE: return AWAIT
            case "FOLLOWUP_CHATROOM": return await handleFollowupChatroom(prompt);
            case "FOLLOWUP_TITLE": return await handleFollowupTitle(prompt);
            case "FOLLOWUP_CONTENT": return await handleFollowupContent(prompt);
            case "FOLLOWUP_CONFIRM": return await handleFollowupConfirm(prompt);


        }
    }
    //Additionally, a chatroom name must be specified. 
    //  If the user fails to specify a chatroom name, inform them that they must specify a chatroom to post in.
    // If the user is logged in and has specified a chatroom name, 
    // the agent should follow up to collect the title and content of the post. 

    const handleFollowupChatroom = async (prompt) => {
        const resp = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const data = await resp.json();

        console.log(data)
        if (data.entities["chatroom_name:chatroom_name"] === undefined){
            stage= undefined;
            let emotedOutput= {
                msg: "This is an invalid chatroom, please try again",
                emote: AIEmoteType.ERROR
            }
            return end(emotedOutput)
        } 

        console.log(data.entities["chatroom_name:chatroom_name"][0].value)

        chatroom = data.entities["chatroom_name:chatroom_name"][0].value;
        stage = "FOLLOWUP_TITLE";
        return ofRandom([
            "Great. What would you like to title this post?",
            "Thanks. What do you want the posts title to be?"
        ])
        
    }

    const handleFollowupTitle= async (prompt) => {
        title = prompt;
        stage = "FOLLOWUP_CONTENT";

        return ofRandom([
            "Great. What content would you like to post?",
            "Thanks. What content would like like to say?"
        ])
    }

    const handleFollowupContent = async (prompt) => {
        content = prompt;
        stage = "FOLLOWUP_CONFIRM";
        
        return `All ready! To confirm, you want to create a post titled ${title} in ${chatroom}?`
    }


    const handleFollowupConfirm = async (prompt) => {
        stage = undefined;

        const confirmResp = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const confirmData = await confirmResp.json();
        if (confirmData.intents.length === 0 || confirmData.intents[0].name !== 'wit$confirmation') return end(ofRandom([
            "No worries, if you want to create a comment in the future, just ask!",
            "That's alright, if you want to create a comment in the future, just ask!"
        ]))

        const resp = await fetch(`https://cs571.org/api/s24/hw11/messages?chatroom=${chatroom}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CS571-ID": CS571.getBadgerId(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        })

        let emotedOutput= {
            msg: undefined,
            emote: undefined
        }
        
        let apiData = await resp.json()
        console.log(apiData)
        
        if (resp.status === 200) {
            emotedOutput.msg= `All set! Your post has been made in ${chatroom}`
            emotedOutput.emote= AIEmoteType.SUCCESS
        }else{
            emotedOutput.msg= apiData.msg
            emotedOutput.emote= AIEmoteType.ERROR
        }

        return end(emotedOutput)

    }
    

    return {
        handleInitialize,
        handleReceive
    }
}

export default createPostSubAgent;