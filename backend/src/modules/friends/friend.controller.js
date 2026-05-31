import { acceptFriendRequest, cancelFriendRequest, discoverUsers, getFriendsDetailed, rejectFriendRequest, sendFriendRequest } from "./friend.service.js"
import { io } from "../../index.js";
import { prisma } from "../../lib/db.js";
import { sendFriendRequestNotification } from "../../lib/push-notification.js";

export async function sendRequest(req, res) {
    try {
        const senderId=req.user.id
        const {receiverId}=req.body
        
        const result=await sendFriendRequest(senderId, receiverId)
        
        // Emit friend request notification to receiver
        io.to(receiverId).emit("friend_request_received", {
            requestId: result.id,
            from: senderId
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
                console.log(`Sending friend request push notifications to receiverId: ${receiverId} (${receiverTokens.length} devices)`);
                await Promise.all(
                    receiverTokens.map(t => 
                        sendFriendRequestNotification(t.token, sender.name, sender.image, result.id)
                    )
                );
            }
        } catch (pushErr) {
            console.error("Failed to send friend request push notification:", pushErr);
        }
        
        return res.json(result)
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to send request"})
    }
}

export async function listFriends(req,res) {
    try {
        const userId=req.user.id;
        const data=await getFriendsDetailed(userId)
        return res.json(data)
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to list friends"})
    }
}

export async function discover(req,res) {
    try {
        const userId=req.user.id;
        const search=req.query.search
        const data = await discoverUsers(userId,search)   
        return res.json(data)
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to discover users"})        
    }
}

export async function acceptRequest(req, res) {
    try {
        const userId=req.user.id;
        const {requestId}=req.params;

        const result =await acceptFriendRequest(requestId,userId)

        // Notify the request sender that their request was accepted
        if (result?.senderId) {
            io.to(result.senderId).emit("friend_request_accepted", {
                userId: userId
            });
        }

        return res.json(result)
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to accept request"})
    }
}
export async function rejectRequest(req, res) {
    try {
        const userId=req.user.id;
        const {requestId}=req.params;

        const result =await rejectFriendRequest(requestId,userId)

        return res.json(result)
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to reject request"})
    }
}
export async function cancelRequest(req, res) {
    try {
        const userId=req.user.id;
        const {requestId}=req.params;

        const result =await cancelFriendRequest(requestId,userId)

        return res.json(result)
    } catch (error) {
        return res.status(400).json({message:error.message || "Failed to cancel request"})
    }
}