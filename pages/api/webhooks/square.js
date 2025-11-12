// pages/api/webhooks/square.js
import { SquareClient, SquareEnvironment, WebhooksHelper } from 'square'
import { updateEmailSentStatus, updatePaymentStatus } from '../database.js'

// Generate a signature from the notification url, signature key,
// and request body and compare it to the Square signature header.
async function isFromSquare(signature, body) {
    return await WebhooksHelper.verifySignature({
        requestBody: body,
        signatureHeader: signature,
        signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
        notificationUrl: NOTIFICATION_URL,
    })
}

const client = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment:
        process.env.NODE_ENV === 'production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
})

// Disable body parsing, we need the raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
}

// Helper function to get raw body
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = ''
        req.on('data', (chunk) => {
            data += chunk
        })
        req.on('end', () => {
            resolve(data)
        })
        req.on('error', reject)
    })
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        console.log('Invalid request method', req.method)
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const rawBody = await getRawBody(req)
        const signature = req.headers['x-square-hmacsha256-signature']
        const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
        const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL

        // Verify required components are present
        if (!signature) {
            console.error('Missing x-square-hmacsha256-signature header')
            return res.status(401).json({ error: 'Missing signature header' })
        }

        if (!signatureKey) {
            console.error(
                'Missing SQUARE_WEBHOOK_SIGNATURE_KEY environment variable'
            )
            return res.status(500).json({ error: 'Server configuration error' })
        }

        if (!notificationUrl) {
            console.error(
                'Missing SQUARE_WEBHOOK_NOTIFICATION_URL environment variable'
            )
            return res.status(500).json({ error: 'Server configuration error' })
        }

        // Verify the webhook signature
        if (!(await isFromSquare(signature, rawBody))) {
            console.error('Invalid webhook signature')
            return res.status(401).json({ error: 'Invalid signature' })
        }

        const event = JSON.parse(rawBody)

        console.log('Webhook received:', event.type)

        // Handle different event types
        switch (event.type) {
            case 'payment.created':
                await handlePaymentCreated(event.data)
                break

            case 'payment.updated':
                await handlePaymentUpdated(event.data)
                break

            case 'order.created':
                await handleOrderCreated(event.data)
                break

            case 'order.updated':
                await handleOrderUpdated(event.data)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        // Always return 200 to acknowledge receipt
        return res.status(200).json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return res.status(500).json({ error: 'Webhook processing failed' })
    }
}

async function handlePaymentCreated(data) {
    const payment = data.object.payment
    console.log('Payment created:', payment.id)

    // Update your database
    // await updatePaymentStatus({
    //   paymentId: payment.id,
    //   orderId: payment.orderId,
    //   status: payment.status,
    //   amount: payment.amountMoney.amount / 100,
    //   currency: payment.amountMoney.currency
    // });
}

async function handlePaymentUpdated(data) {
    const payment = data.object.payment
    console.log('Payment updated:', payment.id, 'Status:', payment.status)

    if (payment.status === 'COMPLETED' && payment.orderId) {
        console.log('Payment completed for order:', payment.orderId)

        try {
            // Get the Square order to retrieve our reference_id (order_uid)
            const orderResponse = await client.orders.get({
                orderId: payment.orderId,
            })
            const squareOrder = orderResponse.order
            const order_uid = squareOrder.referenceId

            if (order_uid) {
                // Update payment status in our database
                const success = await updatePaymentStatus(order_uid, true)

                if (success) {
                    console.log('Payment status updated for order:', order_uid)
                } else {
                    console.error(
                        'Failed to update payment status for order:',
                        order_uid
                    )
                }

                const emailSuccess = await updateEmailSentStatus(
                    order_uid,
                    true
                )

                if (emailSuccess) {
                    console.log(
                        'Email sent status updated for order:',
                        order_uid
                    )
                } else {
                    console.error(
                        'Failed to update email sent status for order:',
                        order_uid
                    )
                }
            } else {
                console.error(
                    'No reference_id found in Square order:',
                    payment.orderId
                )
            }
        } catch (error) {
            console.error('Failed to process payment completion:', error)
        }
    }
}

async function handleOrderCreated(data) {
    const order = data.object.order
    console.log('Order created:', order.id)

    // Store order in your database
}

async function handleOrderUpdated(data) {
    const order = data.object.order
    console.log('Order updated:', order.id, 'State:', order.state)

    // Update order status in your database
}
