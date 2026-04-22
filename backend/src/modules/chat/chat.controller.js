import { sendMessage , getConversation , markMessageAsRead ,getMessage } from "./chat.services";

export async function send(req,res) {
    try {
        const senderId=req.user.id;
        const {receiverId,content}=req.body;
        
        const result=await sendMessage(senderId,receiverId , content)
        //TODO: Websocekt , notification
        return res.json(result)
    } catch (error) {
        return res.status(400).json({message:"Failed to send Message"})
    }
}

export async function listMessage(req,res) {
    try {
        const userId=req.user.id;
        const {otherUserId}=req.params;

        const {limit , cursor}=req.query;
        const result = await getMessage(
            userId,
            otherUserId,
            limit? parseInt(limit):undefined,
            cursor || undefined
        )
        return res.json(result)
    } catch (error) {
        return res.status(400).json({message:"Failed to fetch message"})
    }
}

export async function markRead(req,res) {
    try {
        const userId=req.user.id;
        const {senderId}=req.body;

        await markMessageAsRead(userId ,senderId);

        //TODO websocket
        return res.json({success:true})
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to mark message as read"})
    }
}

export async function listConversations(req,res) {
    try {
        const userId=req.user.id
        const result=await getConversation(userId)

        return res.json(result)
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to fetch conversation"})
    }
}

