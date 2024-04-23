const createPostSubAgent = (end) => {

    let stage;

    const handleInitialize = async (promptData) => {
        return end("I should try to create a post...")
    }

    const handleReceive = async (prompt) => {
        
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createPostSubAgent;