import { EmailClient } from '@azure/communication-email'
import { env } from '$env/dynamic/private'
import type { User } from '$lib/server/db/schema'

export const sendEmail = async (user: User, content: { subject: string, plainText: string, html: string }, important: boolean = false) => {    
    if (!important && user.emailPreference === 'important') {
        console.log('Skipping email to', user.email, 'due to preference for important emails only')
        return false
    }

    const emailMessage = {
        senderAddress: 'DoNotReply@eca319ed-422d-437b-87f8-eb63c42c0bd2.azurecomm.net',
        content: {
            ...content,
            headers: {
                'reply-to': 'admins@cos.iiit.ac.in, stallcomm@students.iiit.ac.in'
            }
        },
        recipients: {
            to: [{ address: user.email }],
        },
    }
    if (!env.EMAIL_STRING) {
        throw new Error('EMAIL environment variable is not set')
    }
    const connectionString = env.EMAIL_STRING
    const client = new EmailClient(connectionString)
    const poller = await client.beginSend(emailMessage)
    const result = await poller.pollUntilDone()
    return result
}
