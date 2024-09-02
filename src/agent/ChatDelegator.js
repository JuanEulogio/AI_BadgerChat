import createPostSubAgent from "./subagents/CreatePostSubAgent";
import createLoginSubAgent from "./subagents/LoginSubAgent";
import createRegisterSubAgent from "./subagents/RegisterSubAgent";

const createChatDelegator = () => {

    let delegate;
    let delegateName;


    const DELEGATE_MAP = {
        "LOGIN": createLoginSubAgent,
        "REGISTER": createRegisterSubAgent,
        "CREATE": createPostSubAgent
    }

    //called from chatAgent functions that activate delegator.beginDeligation( "the FUNCTION string call NAME")
    const beginDelegation = async (candidate, data) => {
        //Checks if the beginDelegation candidate is a valid input to call its specific function
        if (Object.keys(DELEGATE_MAP).includes(candidate)) {
            //gets the function mapped to teh candidate
            const initiator = DELEGATE_MAP[candidate]
            if (typeof(initiator) === 'function') {
                delegateName = candidate;
                //initiator is basically the same function we copied. So if we said "LOGIN", initiator= createLoginSubAgent const/file,
                //so making delegate = initiator(endDelegation) it is the same as making createLoginSubAgent constructor with its parameter set
                // to end deligation
                delegate = initiator(endDelegation);
                
                //Q: Whats handleInitialize?? 
                //A: Its the same handleInitialize of whatever the delegate is
                if (typeof(delegate.handleInitialize) === 'function') {
                    if (data) {
                        //runs the sub agents functions
                        return await (async () => delegate.handleInitialize(data))();
                    } else {
                        return await (async () => delegate.handleInitialize())();
                    }
                } else {
                    console.warn(`Delegate '${candidate}' has no handleInitialize function! Did you define it?`)
                }
            } else {
                console.log(`Cannot create delegate '${candidate}' as it is not defined as a function in DELEGATE_MAP. Did you accidentally use a function call rather than a function callback?`)
            }
        } else {
            if (DELEGATE_MAP) {
                console.error(`Attempting to create delegate '${candidate}', but no delegates exist! Have you defined your DELEGATE_MAP?`)
            } else {
                console.error(`Attempting to create delegate '${candidate}', but no such delegate exists! Valid delegates include ${Object.keys(DELEGATE_MAP).join(",")}`)
            }
        }
    }

    const getDelegate = () => {
        if (!delegate) {
            console.warn("Attempting to get delegate, but no delegate has been set!");
        }
        return delegate;
    }

    const getDelegateName = () => {
        if (!delegateName) {
            console.warn("Attempting to get delegateName, but no delegateName has been set!");
        }
        return delegateName;
    }

    const hasDelegate = () => {
        return delegate ? true : false;
    }

    const handleDelegation = async (prompt) => {
        if (delegate) {
            if (typeof(delegate.handleReceive) === 'function') {
                return await (() => delegate.handleReceive(prompt))();
            } else {
                console.error(`Attempted to handle delegation for the prompt '${prompt}'. While the '${delegateName}' delegate was found, it does not have a handleReceive function. Did you define it?`);
            }
        } else {
            console.error(`Attempted to handle delegation for the prompt '${prompt}', but no delegate has been set! Did you beginDelegation?`);
        }
    }

    //the parameter "end" that subAgents use it this, and data is some functions return
    //its structured like this so we can execute that function and its return is passed on as a parameter
    // which will be returned here, to the user, BUT ALSO EXTENDING the function of ending our deligation at the same time
    const endDelegation = (data) => {
        if (!delegate) {
            console.warn("Attempting to end delegation, but no delegate has been set! Ignoring...");
        }
        delegate = undefined;
        delegateName = undefined;
        return data;
    }

    return {
        beginDelegation,
        getDelegate,
        getDelegateName,
        hasDelegate,
        handleDelegation,
        endDelegation
    }
}

export default createChatDelegator;