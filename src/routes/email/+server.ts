import { EmailClient } from "@azure/communication-email";
import {env} from '$env/dynamic/private';

export const POST = async () => {
    const emailMessage = {
        senderAddress: "DoNotReply@eca319ed-422d-437b-87f8-eb63c42c0bd2.azurecomm.net",
        content: {
            subject: "Test Email 2",
            plainText: "Hello world",
        },
        recipients: {
            to: [{ address: "sanyam.gandhi@research.iiit.ac.in" }],
        },
    };
    if (!env.EMAIL_STRING) {
        throw new Error("EMAIL environment variable is not set");
    }
    const connectionString = env.EMAIL_STRING;
    const client = new EmailClient(connectionString);
    const poller = await client.beginSend(emailMessage);
    const result = await poller.pollUntilDone();
    return new Response(JSON.stringify(result), { status: 200 });
}