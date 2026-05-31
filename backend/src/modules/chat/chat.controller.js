import { sendMessage , getConversation , markMessageAsRead ,getMessage } from "./chat.services.js";
import { io } from "../../index.js";
import { prisma } from "../../lib/db.js";
import { sendNewMessageNotification } from "../../lib/push-notification.js";

export async function send(req,res) {
    try {
        const senderId=req.user.id;
        const {receiverId,content}=req.body;
        
        const result=await sendMessage(senderId,receiverId , content)
        
        // Emit to conversation room
        const conversationId = [senderId, receiverId].sort().join("-");
        io.to(conversationId).emit("new_message", result);
        
        // Also emit to receiver's personal room for global notifications
        io.to(receiverId).emit("notification:new_message", {
            ...result,
            conversationId
        });

        // Send Push Notification
        try {
            const [sender, receiverTokens] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: senderId },
                    select: { name: true, image: true }
                }),
                prisma.pushToken.findMany({
                    where: { userId: receiverId },
                    select: { token: true }
                })
            ]);

            if (sender && receiverTokens.length > 0) {
                console.log(`Sending message push notifications to receiverId: ${receiverId} (${receiverTokens.length} devices)`);
                await Promise.all(
                    receiverTokens.map(t => 
                        sendNewMessageNotification(t.token, sender.name, content, sender.image, senderId)
                    )
                );
            }
        } catch (pushErr) {
            console.error("Failed to send message push notification:", pushErr);
        }
        
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


