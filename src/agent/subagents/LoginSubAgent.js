const createLoginSubAgent = (end) => {

    let stage;

    const handleInitialize = async (promptData) => {
        return end("I should try to login...")
    }

    const handleReceive = async (prompt) => {
        
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createLoginSubAgent;