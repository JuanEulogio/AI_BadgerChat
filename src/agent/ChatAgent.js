import createChatDelegator from "./ChatDelegator";
import { logout, ofRandom, isLoggedIn, getLoggedInUsername } from "./Util";

const createChatAgent = () => {
    const CS571_WITAI_ACCESS_TOKEN = "YV5AFFM6MIYMHMKXM6MSIUIB6CBXT42Q"; // Put your CLIENT access token here.

    const delegator = createChatDelegator();

    let chatrooms = [];

    const handleInitialize = async () => {
        //Get all chatrooms
        const resp = await fetch("https://cs571.org/api/s24/hw11/chatrooms", {
            headers: {
                "X-CS571-ID": CS571.getBadgerId()
            }
        });
        const data = await resp.json();
        chatrooms = data;

        return "Welcome to BadgerChat! My name is Bucki, how can I help you?";
    }


    //this gets called in TextApp.jsx file after chat input
    const handleReceive = async (prompt) => {
        //?? The deligator was initialized in this files handle functions but here is where the handleDeligation runs in a subAgent function (?)
        if (delegator.hasDelegate()) { return delegator.handleDelegation(prompt); }


        //NOTE: have to encode URI if passing long sentence
        //this end points Gets latest NUM messages for specified chatroom.
        const resp = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const data = await resp.json();
        if (data.intents.length > 0) {
            switch (data.intents[0].name) {
                case "get_help": return handleGetHelp();
                case "get_chatrooms": return handleGetChatrooms();
                case "get_messages": return handleGetMessages(data);
                case "login": return handleLogin();
                case "register": return handleRegister();
                case "create_message": return handleCreateMessage(data);
                case "logout": return handleLogout();
                case "whoami": return handleWhoAmI();
            }
        }
        return "Sorry, I didn't get that. Type 'help' to see what you can do!";
    }

    const handleTranscription = async (rawSound, contentType) => {
        const resp = await fetch(`https://api.wit.ai/dictation`, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            },
            body: rawSound
        })
        const data = await resp.text();
        const transcription = data
            .split(/\r?\n{/g)
            .map((t, i) => i === 0 ? t : `{${t}`)  // Turn the response text into nice JS objects
            .map(s => JSON.parse(s))
            .filter(chunk => chunk.is_final)       // Only keep the final transcriptions
            .map(chunk => chunk.text)
            .join(" ");                            // And conjoin them!
        return transcription;
    }

    const handleSynthesis = async (txt) => {
        if (txt.length > 280) {
            return undefined;
        } else {
            const resp = await fetch(`https://api.wit.ai/synthesize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "audio/wav",
                    "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    q: txt,
                    voice: "Rebecca",
                    style: "soft"
                })
            })
            const audioBlob = await resp.blob()
            return URL.createObjectURL(audioBlob);
        }
    }

    const handleGetHelp = async () => {
        return ofRandom([
            "Try asking 'give me a list of chatrooms, or ask for more help!",
            "Try asking 'register for an account', or ask for more help!"
        ])
    }

    const handleGetChatrooms = async () => {
        return `There are ${chatrooms.length} chatrooms: ${chatrooms.toString()}`
    }

    const handleGetMessages = async (data) => {
        console.log(data)
        let amount= 1
        let chatroom= ""
        if(data.entities["chatroom_name:chatroom_name"] !== undefined) chatroom= data.entities["chatroom_name:chatroom_name"][0].value
        if(data.entities["wit$number:number"] !== undefined) amount= data.entities["wit$number:number"][0].value

        console.log(amount)
        console.log(chatroom)
        const response= await fetch(`https://cs571.org/api/s24/hw11/messages?chatroom=${chatroom}&num=${amount}`, {
            headers: {
                "X-CS571-ID": CS571.getBadgerId()
            }
        })
        const apiData = await response.json();
        if(response.status=== 400){
            return apiData
        } else if(response.status=== 404){
            return apiData
        } 

        console.log(apiData)
        return apiData.messages.map(m => {
            return `In ${m.chatroom}, ${m.poster} created a post titled '${m.title}' saying '${m.content}'`
        })
    }

    const handleLogin = async () => {
        return await delegator.beginDelegation("LOGIN");
    }

    const handleRegister = async () => {
        return await delegator.beginDelegation("REGISTER");
    }

    const handleCreateMessage = async (data) => {
        return await delegator.beginDelegation("CREATE");
    }

    const handleLogout = async () => {
        if (await isLoggedIn()) {
            //NOTE: ofRandom to randomize a pool of possible outputs
            logout()
            return "You have been logged out"
            
        } else {
            return ofRandom([
                "You have not logged in yet",
                "You are not signed in yet"
            ])
        } 
    }

    const handleWhoAmI = async () => {
        if (await isLoggedIn()) {
            //NOTE: ofRandom to randomize a pool of possible outputs
            return `You are currently logged in as ${await getLoggedInUsername()}`
            
        } else {
            return ofRandom([
                "You have not logged in yet",
                "You are not signed in yet"
            ])
        }
    }

    return {
        handleInitialize,
        handleReceive,
        handleTranscription,
        handleSynthesis
    }
}

export default createChatAgent;