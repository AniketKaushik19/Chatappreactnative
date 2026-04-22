import {Router} from 'express'
import {requireAuth} from '../../lib/require-auth.js'
import { router } from 'better-auth/api'
import { listConversations, listMessage, markRead, send } from './chat.controller.js';

export const chatRouter=Router();

chatRouter.post("/send",send)
chatRouter.post("/mark-read",markRead)
chatRouter.get("/messages/:otherUserId",listMessage)
chatRouter.get('/conversations',listConversations)