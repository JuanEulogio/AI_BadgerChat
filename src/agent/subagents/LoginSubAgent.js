import { isLoggedIn, ofRandom, getLoggedInUsername, logout,  } from "../Util"
//NOTE: special coding structure to keep AIEmoteType "ViewModel"(?) architecture clear to look up. 
// WE have to import this object "AIEmoteType" that doing .___ return a string which
// we will use to classify in "AIMessage.jsx" to classify what img of our AI to show
import AIEmoteType from "../../components/chat/messages/AIEmoteType";


const createLoginSubAgent = (end) => {

    //our AI propt exchange step/stage
    //starts with ""
    let stage;

    let password, username

    const handleInitialize = async (promptData) => {
        //check if the user is currently logged in. 
        //If the user is currently logged in, 
            // the agent should inform them that need to be logged out before logging in. 
        // Otherwise, the agent should follow up to collect: the user's username and password.

        if (await isLoggedIn()) {
            //NOTE: ofRandom to randomize a pool of possible outputs
            return end(ofRandom([
                "You are already logged in, try logging out first.",
                "You are already signed in, try signing out first."
            ]))
        } else {
            stage = "FOLLOWUP_USERNAME";
            return ofRandom([
                "Sure, what is your username?",
                "Alright, what is your username?"
            ])
        } 
    }

    //this was called from chatDelegators "beginDelegation" 
    const handleReceive = async (prompt) => {
        switch(stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
        }
        //Upon a successful login, the user should be informed: that they were successfully logged in, 
        //otherwise that their username and password combination was incorrect.
    }

    const handleFollowupUsername = async (prompt) => {
        username = prompt;
        stage = "FOLLOWUP_PASSWORD";
        let secretOutput= {
            msg: "Great, and what is your password?",
            nextIsSensitive: true,
        }
        return secretOutput
        // return ofRandom([
        //     "Great, and what is your password?",
        //     "Thanks, and what is your password?"
        // ])
    }
    const handleFollowupPassword = async (prompt) => {
        password = prompt;
        const resp = await fetch("https://cs571.org/api/s24/hw11/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CS571-ID": CS571.getBadgerId(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        
        let apiData = await resp.json()
        let emotedOutput= {
            msg: undefined,
            emote: undefined
        }
        if (resp.status === 200) {
            //NOTE: for all ends(), it ends our deligation function that we're doing right now.
            // Let chatDeligator know before the called subAgent is finishes
            //NOTE: asyn functions need await for the retrival point
            emotedOutput.msg= `Success! Your account has been logged in. Welcome ${ await getLoggedInUsername()}`
            emotedOutput.emote= AIEmoteType.SUCCESS

        }else{
            emotedOutput.msg= apiData.msg
            emotedOutput.emote= AIEmoteType.ERROR
        }
        console.log(emotedOutput)
        return end(emotedOutput)
    }


    return {
        handleInitialize,
        handleReceive
    }
}

export default createLoginSubAgent;