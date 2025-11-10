import { setEmailedStatus } from './database'

export default async function sendDeferredOrderEmail(req, res) {
    const { body } = req
    const { order_data, products } = body
    let { email_body } = body

    email_body = email_body.replace(/(?:\r\n|\r|\n)/g, '<br>')

    const messageVersions = [
        {
            to: [{ email: 'marthamrave@gmail.com', name: 'Martha Rave' }],
            subject: `You sent an email order to ${order_data.customer_name}!`,
        },
        {
            to: [{ email: order_data.email, name: order_data.customer_name }],
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

    messageBody += `<div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);margin-top: 2rem; margin-bottom: 0.75rem">
            <h1 style="margin: 0;text-align: center; font-size: 2.5rem; font-weight: bold">Your Cookie Order</h1>
        </div>
        <table style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);max-width: 60%; margin: auto;">
        <tbody>
        `
    Object.keys(order_data.order_items).map((item, index) => {
        const product = products.find((product) => product.product_id == item)

        if (index % 3 === 0) {
            messageBody += `<tr>`
        }
        messageBody += `
        <td style="padding-bottom: 1rem; padding: 0 0.5rem;">
            <h3 style="margin: 0;color:rgb(22, 22, 22); line-height: 1.75rem; font-size: 1.125rem; text-align: center; padding-bottom: 0.25rem; white-space: nowrap;">
                ${product.product_name}
            </h3>
            <div style="border: 1.5px solid rgb(230, 230, 230); margin:auto; background-color: rgb(250, 250, 250); border-radius: 0.375rem; overflow: hidden; width: 10rem; height: 10rem; position: relative">
                <div style="border-radius: 0.375rem; height: 100%;">
                    <img style="inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%; object-fit: cover;" src="${
                        product.product_img_api_path
                    }"/>
                </div>
            </div>
            <div style="width: fit-content; margin: auto; padding-top: 0.4rem;">
                <div style="display: inline-block; background-color: rgb(22, 22, 22); border-radius: 0.375rem; height: 2rem; width: 3.5rem; margin-right: 0.2rem;">
                    <p style="margin: 0; color: rgb(250, 250, 250); font-weight: bold; text-align: center; font-size: 1.25rem; line-height: 2rem">
                        ${order_data.order_items[item]}x
                    </p>
                </div>
                <div style="display: inline-block; background-color: rgb(22, 22, 22); border-radius: 0.375rem; height: 2rem; min-width: 3.8rem;">
                    <p style="margin: 0 0.5rem;color: rgb(250, 250, 250); font-weight: bold; text-align: center; font-size: 1.25rem; line-height: 2rem">
                        $${
                            parseFloat(product.product_price) *
                            parseFloat(order_data.order_items[item])
                        }
                    </p>
                </div>
            </div>
        </td>
        `
        if ((index + 1) % 3 === 0 && index !== 0) {
            messageBody += `</tr>`
        }
    })
    messageBody += `</tbody></table>
             <div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);margin: 1rem 0;">
                <p style="margin: 0;text-align: center; font-size: 1.6rem; font-weight: bold;">Order Cost: $${
                    parseFloat(order_data.order_cost) || 0
                }</p>
                <p style="margin: 0;text-align: center; font-size: 1.6rem; font-weight: bold;">Additional Fees: $${
                    parseFloat(order_data.misc_fees) || 0
                }</p>
                <p style="margin: 0;text-align: center; font-size: 1.6rem; font-weight: bold;">Total Cost: $${
                    (parseFloat(order_data.misc_fees) || 0) +
                    (parseFloat(order_data.order_cost) || 0)
                }</p>
             </div>
             <div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);border-radius: 5px; border: 2px solid rgb(230, 230, 230); padding: 2rem;width:fit-content;margin:auto">
                <div>
                    <h2 style="margin: 0;text-align: center; font-size: 1.25rem; font-weight: bold;">Order Details</h2>
                </div>
                <div style="margin-top: 0.3rem;">
                    <p style="margin: 0;text-align: center; font-size: 1.25rem;">Name: ${
                        order_data.customer_name
                    }</p>
                </div>
                <div style="margin-top: 0.1rem;">
                    <p style="margin: 0;text-align: center; font-size: 1.25rem;">Address: ${
                        order_data.address + ', ' + order_data.city
                    }</p>
                </div>
                <div style="margin-top: 0.1rem;">
                    <p style="margin: 0;text-align: center; font-size: 1.25rem;">Phone Number: ${
                        order_data.phone
                    }</p>
                </div>
                <div style="margin-top: 0.1rem;">
                    <p style="margin: 0;text-align: center; font-size: 1.25rem;">Delivery Date: ${new Date(
                        order_data.delivery_date
                    ).toDateString()}</p>
                </div>
                <div style="margin-top: 0.1rem;">
                    <p style="margin: 0;text-align: center; font-size: 1.25rem;">Payment Method: ${
                        order_data.payment_type
                    }</p>
                </div>
                <div style="margin-top: 0.2rem;">
                    <p style="margin: 0;text-align: center; font-size: 1.2rem; font-style: italic">${
                        order_data.payment_type === 'E-Transfer'
                            ? 'Please direct E-Transfer to martharave@yahoo.com'
                            : 'Please pay cash at time of delivery'
                    }</p>
                </div>
             </div>
             `
    if (order_data.additional_information) {
        messageBody += `<div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);margin: auto; width: fit-content;border-radius: 5px; border: 2px solid rgb(230, 230, 230); margin-top: 1rem; margin-bottom: 1rem;">
                            <div style="padding: 1.6rem;">
                                <p style="margin: 0;font-size: 1.3rem"><b>Additional Information: </b>${order_data.additional_information}</p>
                            </div>
                        </div>`
    }
    messageBody += `<div style="font-family: 'Google Sans', Verdana, sans-serif; color: rgb(22, 22, 22);margin: auto; width: fit-content;border-radius: 5px; border: 2px solid rgb(230, 230, 230); margin-top: 1rem; margin-bottom: 3rem;">
                        <div style="padding: 1.6rem;">
                            <p style="margin: 0;font-size: 1.3rem">Please feel free to email me if you have any questions or if your order details are incorrect at <a href="mailto:martharave@yahoo.com">martharave@yahoo.com</a><br><br>I look forward to baking holiday treats for you!<br><br>Sincerely,<br>Martha</p>
                        </div>
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
        subject: 'Your Order from Martha Rave Cookies',
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

    setEmailedStatus(order_data.order_uid)

    res.status(200).json({ message: 'Email sent' })
}
