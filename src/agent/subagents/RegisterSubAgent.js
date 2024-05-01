import { isLoggedIn, ofRandom, getLoggedInUsername, logout} from "../Util"
import AIEmoteType from "../../components/chat/messages/AIEmoteType";


const createRegisterSubAgent = (end) => {

    let stage;

    let passwordConfirmation, password, username


    const handleInitialize = async (promptData) => {
        //the agent should first check if the user is currently logged in.
        //If the user is currently logged in, the agent should inform them that need 
        //to be logged out before registering. Otherwise, the agent should 
        //follow up to collect the user's username, password, and confirm their password. 
        
        if (await isLoggedIn()) {
            return end(ofRandom([
                "You are already logged in, try logging out first.",
                "You are already signed in, try signing out first."
            ]))
        } else {
            stage = "FOLLOWUP_USERNAME";
            return ofRandom([
                "Sure, what is your desired username?",
                "Alright, what username would you prefer?"
            ])
        } 
    }

    const handleReceive = async (prompt) => {
        //If the repeated password does not match the original password, 
        //the registration process should be cancelled. 
        //Furthermore, upon registration, if the username has already been taken, 
        //the user should be informed as such. 
        //Otherwise, 
        //the user should be informed that they were successfully registered and logged in.
        switch(stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
            case "FOLLOWUP_PASSWORD_CONFIRMATION": return await handleFollowupPasswordConfirmation(prompt);
        }
    }

    const handleFollowupUsername = async (prompt) => {
        username = prompt;
        stage = "FOLLOWUP_PASSWORD";
        let secretOutput= {
            msg: "Great, and what should your password be?",
            nextIsSensitive: true
        }
        return secretOutput
    }
    const handleFollowupPassword = async (prompt) => {
        password = prompt;
        stage = "FOLLOWUP_PASSWORD_CONFIRMATION";
        let secretOutput= {
            msg: "Got it. Please confirm your password again",
            nextIsSensitive: true
        }
        return secretOutput
    }
    const handleFollowupPasswordConfirmation = async (prompt) => {
        let emotedOutput= {
            msg: undefined,
            emote: undefined
        }

        passwordConfirmation = prompt;

        if(passwordConfirmation !== password){
            stage= undefined
            emotedOutput.msg="passwords didnt match"
            emotedOutput.emote= AIEmoteType.ERROR
            return end(emotedOutput)
        }

        const resp = await fetch("https://cs571.org/api/s24/hw11/register", {
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
        
        if (resp.status === 200) {
            emotedOutput.msg= `Success! Your account has been registered. Welcome ${ await getLoggedInUsername()}`
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

export default createRegisterSubAgent;