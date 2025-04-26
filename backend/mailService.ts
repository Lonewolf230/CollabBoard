import nodemailer from 'nodemailer';
import { configDotenv } from 'dotenv';
configDotenv()
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_ID,
        pass:process.env.PASSWORD
    }
})

const sendInviteEmail=async(fromName:string,toEmail:string,inviteLink:string,boardName:string,accessType:string)=>{
    try {
        await transporter.sendMail({
            from:process.env.EMAIL_ID,
            to:toEmail,
            subject:`Invite to ${boardName}`,
            text:`You have been invited to collaborate on the board ${boardName} by ${fromName}. 
            
                Click the link below to join:\n\n
                ${inviteLink}
                
                You have been given ${accessType} access to the board.

                Best Regards,
                CollabBoard`,
            html:`<p>You have been invited to collaborate on the board <strong>${boardName}</strong>.</p>
                  <p>You have been given ${accessType} access to the board.</p>
                  <p>Invited by: <strong>${fromName}</strong></p>
                  <p>Click the link below to join:</p>
                  <button style="background-color:blue;border:none;border-radius:'5px';padding:'10px'"><a style="text-decoration:none;color:white" href="${inviteLink}">Join Board</a></button>`

        })

        return {success:true,message:'Email sent successfully'}
    } catch (error) {
        return {success:false,message:'Failed to send email'}
    }
}

export {sendInviteEmail}