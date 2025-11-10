// pages/api/verify-payment.js
import { SquareClient, SquareEnvironment } from 'square'

const client = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment:
        process.env.NODE_ENV === 'production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
})

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { orderId } = req.query

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID required' })
        }

        // Retrieve the order from Square
        const response = await client.orders.get({ orderId })

        const order = response.order

        // Check if payment was completed
        const isPaid = order.state === 'COMPLETED'

        // You can also retrieve payment details if needed
        let paymentDetails = null
        if (order.tenders && order.tenders.length > 0) {
            const tender = order.tenders[0]
            paymentDetails = {
                paymentId: tender.id,
                amount: tender.amountMoney.amount / 100, // Convert cents to dollars
                currency: tender.amountMoney.currency,
                cardBrand: tender.cardDetails?.card?.cardBrand || null,
                lastFourDigits: tender.cardDetails?.card?.last4 || null,
            }
        }

        // Update your database with payment status
        // await updateOrderStatus(orderId, isPaid, paymentDetails);

        return res.status(200).json({
            success: true,
            orderId: order.id,
            isPaid,
            totalAmount: order.totalMoney?.amount / 100,
            currency: order.totalMoney?.currency,
            createdAt: order.createdAt,
            paymentDetails,
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return res.status(500).json({
            error: 'Failed to verify payment',
            details: error.message,
        })
    }
}
