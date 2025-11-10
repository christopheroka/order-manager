export default async function sendCustomerEmail(req, res) {
    const { body } = req
    const { customer_data } = body
    let { email_body } = body

    email_body = email_body.replace(/(?:\r\n|\r|\n)/g, '<br>')

    const messageVersions = [
        {
            to: [{ email: 'marthamrave@gmail.com', name: 'Martha Rave' }],
            subject: `You sent an email to ${customer_data.customer_name}!`,
        },
        {
            to: [{ email: customer_data.email, name: customer_data.customer_name }],
        },
    ]

    let messageBody = `
    <!DOCTYPE html>
    <html>
    <body>
        <div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);width: 100%; height: 8rem; margin-top: 3rem">
            <div style="width: fit-content; margin: auto;">
                <img style="height: 8rem; width: 8rem;" src="https://wefopjbwswtxrkbsmzvn.supabase.co/storage/v1/object/public/public/mrave_logo.png"/>
            </div>
        </div>`

    if (email_body) {
        messageBody += `<div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22); width: fit-content;border-radius: 5px; border: 2px solid rgb(230, 230, 230); margin: 1rem auto;">
                                <div style="padding: 1.6rem;">
                                    <p style="margin: 0;font-size: 1.3rem">${email_body}</p>
                                </div>
                            </div>`
    }

    messageBody += `
        <div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);margin: auto; width: fit-content;border-radius: 5px; border: 2px solid rgb(230, 230, 230); margin-top: 1rem; margin-bottom: 3rem;">
            <div style="padding: 1.6rem;">
                <p style="margin: 0;font-size: 1.3rem">Thank you for being a valued customer! Please feel free to email me if you have any questions at <a href="mailto:martharave@yahoo.com">martharave@yahoo.com</a><br><br>I look forward to continuing to bake delicious treats for you!<br><br>Sincerely,<br>Martha</p>
            </div>
        </div>
    </body>
    </html>`

    let reqHeaders = new Headers()
    reqHeaders.append('api-key', process.env.SENDINBLUE_API_KEY)
    reqHeaders.append('content-type', 'application/json')
    reqHeaders.append('accept', 'application/json')

    let reqBody = JSON.stringify({
        sender: {
            email: 'marthamrave@gmail.com',
            name: 'Martha Rave Cookies',
        },
        subject: 'Message from Martha Rave Cookies',
        htmlContent: messageBody,
        messageVersions,
    })

    const options = {
        method: 'POST',
        headers: reqHeaders,
        body: reqBody,
    }

    await fetch('https://api.sendinblue.com/v3/smtp/email?&', options)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => {
            res.status(500).json({ error })
            return
        })

    res.status(200).json({ message: 'Email sent' })
}
