const createRegisterSubAgent = (end) => {

    let stage;

    const handleInitialize = async (promptData) => {
        return end("I should try to register...")
    }

    const handleReceive = async (prompt) => {
        
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createRegisterSubAgent;