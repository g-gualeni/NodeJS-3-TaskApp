const { SocketLabsClient } = require('@socketlabs/email')
const serverId = 36512
const injectionApiKey = process.env.SOCKETLAB_API_KEY

const client = new SocketLabsClient(serverId, injectionApiKey)
const from  = 'gianbattista@gianbattistagualeni.it'

const sendWelcomeEmail = (email, name) => {
    client.send({
        to: email,
        from,
        subject: 'Thanks for joining in!',
        textBody: `Wellcome to the app, ${name}. Let me know how you get along`,
        messageType: 'basic'
    }).then((res) => {
        console.log(res)
    }, (err) => {
        console.log(err)
    })
}

const sendCancellationEmail = (email, name) => {
    client.send({
        to: email, 
        from,
        subject: 'Goodbye mail',
        textBody: `Sorry to see you are leaving, ${name}. I hope to see you back`,
        messageType: 'basic'
    }).then((res) => {
        console.log(res)
    }, (err) => {
        console.log(err)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}

// client.send({
//     to: "g.gualeni@gmail.com",
//     from: "gianbattista@gianbattistagualeni.it",
//     subject: "Hello from Node.js",
//     textBody: "This message was sent using the SocketLabs Node.js library!",
//     htmlBody: "<html>This message was sent using the SocketLabs Node.js library!</html>",
//     messageType: 'basic'
// }).then((res) => {
//         //Handle successful API call
//         console.log(res);
//     }, (err) => {
//         //Handle error making API call
//         console.log(err);
//     });