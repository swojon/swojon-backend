import { mailConfig } from "@/config/mail"
import { ChatMessageEntity } from "@/entities/chatMessage.entity"
import { UserEntity } from "@/entities/users.entity"
import { Chat } from "@/interfaces/chat.interface"
import { User } from "@/interfaces/users.interface"
import { Listing } from "@/typedefs/listing.type"
import { createTransport } from "nodemailer"

const transporter = createTransport(mailConfig)


//send mail
const sendMail = async (mailOptions:any) => {
  try {
    const mail = await transporter.sendMail(mailOptions)
    console.log(mail)
  } catch (error) {
    console.log(error)
  }
}

export const sendSignUpMail = async (userData:User) => {
    const mailOptions = {
        from: "Swojon <care@swojon.com>",
        to: userData.email,
        subject: "Welcome to Swojon! Please Verify Your Email",
        text: `
Dear ${userData.username},

Welcome to Swojon! We're thrilled to have you join our community of good people.

To get started and ensure the security of your account, please verify your email address by clicking the link below:

https://www.swojon.com/verify-email/${userData.emailVerificationToken}

This verification link will expire in 1 hour for security purposes.

Once verified, you'll have full access to:
- Buy and sell items securely 
- Connect with trusted community members
- Get personalized recommendations
- Access exclusive deals and offers

If you didn't create a Swojon account, please ignore this email.

Need help? Our support team is always here for you at support@swojon.com

Welcome aboard!

Best regards,
The Swojon Team
www.swojon.com
`,
      } 
      await sendMail(mailOptions);
}

export const sendPasswordResetMail = async (userData:User) => {
  const mailOptions = {
    from: "Swojon <care@swojon.com>",
    to: userData.email,
    subject: "Password Reset Request",
    text: `Dear ${userData.username},

We received a request to reset the password for your Swojon account. To reset your password, please use the following token:

Click on the link below to reset your password:

[ https://www.swojon.com/forgot-password/reset?token=${userData.passwordResetToken} ]

(Note: If the link is not clickable, please copy and paste it into your web browser.)

This token will expire in 1 hour, so be sure to use it promptly. If you did not request a password reset or if you have any concerns about your account security, please contact our support team immediately at [support@swojon.com].

Thank you for choosing Swojon!

Best regards,

The Swojon Team
www.swojon.com`
  } 
  await sendMail(mailOptions);
}

export const sendPasswordResetSuccessMail = async (userData:User) => {
  const mailOptions = {
    from: "Swojon <care@swojon.com>",
    to: userData.email,
    subject: "Your Swojon Password Has Been Successfully Reset",
    text: `Dear ${userData.username},

We hope this email finds you well. We wanted to inform you that the password for your Swojon account has been successfully reset.

If you initiated this password change, you can disregard this email. However, if you did not request a password reset or have any concerns about the security of your account, please contact our support team immediately at [support@swojon.com].

For your security, we recommend updating your password periodically and ensuring it is unique to Swojon.

Thank you for being part of the Swojon community!

Best regards,

The Swojon Team
www.swojon.com`
  }
  await sendMail(mailOptions);
}

export const listingApprovalMail = async (userData:User, listingData: Listing) => {
  const mailOptions = {
    from: "Swojon <care@swojon.com>",
    to: userData.email,
    subject: "Your Listing Has Been Approved",
    text: `Dear ${userData.username},
We are pleased to inform you that your listing has been successfully approved and is now live on Swojon!

You can view your listing by clicking on the following link:
[ https://www.swojon.com/products/${listingData.id} ]

Your listing will now be visible to potential buyers and interested parties on our platform. We encourage you to:
- Keep your listing information up to date
- Respond promptly to any inquiries
- Monitor your dashboard for potential interests and offers

If you need to make any changes to your listing or have any questions, please don't hesitate to visit your dashboard or contact our support team at support@swojon.com.

Thank you for choosing Swojon as your platform. We're excited to help you connect with potential buyers!

Best regards,

The Swojon Team
www.swojon.com
` } 
  await sendMail(mailOptions);
}

export const listingRejectionMail = async (userData:User, listingData: Listing, reason: string) => {
  const mailOptions = {
    from: "Swojon <care@swojon.com>",
    to: userData.email,
    subject: "Your Listing Has Been Rejected",
    text: `Dear ${userData.username},
We regret to inform you that your recent listing submission on Swojon has not been approved at this time.

Our moderation team reviews all listings to ensure they meet our platform's quality standards and guidelines. If you'd like to understand the specific reasons for the rejection or get guidance on how to improve your listing, please contact our support team at support@swojon.com.

We encourage you to:
- Review and update your listing information
- Ensure all details are accurate and complete
- Add high-quality images if applicable
- Verify that your listing complies with our community guidelines

Once you've made the necessary adjustments, you can resubmit your listing for approval through your dashboard:
[ https://www.swojon.com/profile/my-ads/rejected ]

We're here to help you succeed on our platform. If you need any assistance with the resubmission process, don't hesitate to reach out to our support team.

Thank you for your understanding and continued interest in listing with Swojon.

Best regards,

The Swojon Team
www.swojon.com
    
    `
  } 
  await sendMail(mailOptions);
}

export const submitListingAndWaitApprovalMail = async (userData:User, listingData: Listing) => {
  const mailOptions = {
    from: "Swojon <care@swojon.com>",
    to: userData.email,
    subject: "Your Listing Is Under Review",
    text: `Dear ${userData.username},
Thank you for submitting your listing on Swojon. We appreciate you choosing our platform.

Your listing is currently under review by our moderation team. This process helps ensure all listings meet our quality standards and guidelines. The review typically takes 24-48 hours.

You can check the status of your listing at any time through your dashboard:
[ https://www.swojon.com/profile/my-ads/pending ]

We'll notify you via email once the review is complete. If you have any questions in the meantime, please don't hesitate to contact our support team at support@swojon.com.

We look forward to helping you connect with potential buyers on Swojon.

Best regards,

The Swojon Team
www.swojon.com
    `
  } 
  await sendMail(mailOptions);
}


export const sendFirstMessageMail = async (userData:User, messageData:Chat) => {
    const mailOptions = {
      from: "Swojon <care@swojon.com>",
      to: userData.email,
      subject: "New Message on Swojon",
      text: `Dear ${userData.username},
Great news! Someone's interested in connecting with you! A quick and friendly response can spark great conversations and lead to wonderful opportunities. We'd love to see you jump in and keep the momentum going!

We are including the message in this email for your convenience.
"${messageData.content}"

To view and reply to this message, just click here:
[ https://www.swojon.com/chat/${messageData.chatRoom.id} ]

We are sending you this email because engaging with your potential buyers creates a welcoming atmosphere and helps build lasting relationships in our community. Your active participation makes Swojon a better place for everyone!

Happy chatting!

Best wishes,

The Swojon Team
www.swojon.com
        `
    }
    await sendMail(mailOptions);
}

