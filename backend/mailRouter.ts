

import express, { Request, Response } from 'express';
import { sendInviteEmail } from './mailService';

// Create a router instance
const router = express.Router();

// Define routes on the router
router.post('/send-invite', async (req:Request, res:Response):Promise<any> => {
    const { fromName, toEmail, inviteLink, boardName,accessType } = req.body;

    if (!fromName || !toEmail || !inviteLink || !boardName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const result = await sendInviteEmail(fromName, toEmail, inviteLink, boardName,accessType);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

export default router;