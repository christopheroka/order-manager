// pages/api/create-checkout.js
import { randomUUID } from 'crypto'

import { SquareClient, SquareEnvironment } from 'square'

const client = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment:
        process.env.NODE_ENV === 'production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
})

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { items, customerEmail, orderId } = req.body

        // Debug logging
        console.log('Environment check:', {
            hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
            hasLocationId: !!process.env.SQUARE_LOCATION_ID,
            nodeEnv: process.env.NODE_ENV,
        })

        // Validate input
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' })
        }

        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required' })
        }

        if (!process.env.SQUARE_ACCESS_TOKEN) {
            return res
                .status(500)
                .json({ error: 'Square access token not configured' })
        }

        if (!process.env.SQUARE_LOCATION_ID) {
            return res
                .status(500)
                .json({ error: 'Square location ID not configured' })
        }

        // Create the checkout session
        const response = await client.checkout.paymentLinks.create({
            idempotencyKey: randomUUID(),
            order: {
                locationId: process.env.SQUARE_LOCATION_ID,
                referenceId: orderId || randomUUID(), // Your internal order ID
                lineItems: items.map((item) => ({
                    name: item.name,
                    quantity: item.quantity.toString(),
                    basePriceMoney: {
                        amount: BigInt(Math.round(item.price * 100)), // Convert dollars to cents and to bigint
                        currency: 'CAD',
                    },
                    note: item.description || '',
                })),
            },
            checkoutOptions: {
                redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
                askForShippingAddress: false,
                merchantSupportEmail:
                    process.env.SUPPORT_EMAIL || customerEmail,
                acceptedPaymentMethods: {
                    applePay: true,
                    googlePay: true,
                    cashAppPay: true,
                    afterpayClearpay: true,
                },
            },
            prePopulatedData: customerEmail
                ? {
                      buyerEmail: customerEmail,
                  }
                : undefined,
        })

        console.log(response)
        const paymentLink = response.paymentLink

        // Optionally save to your database here
        // await saveCheckoutSession({
        //   orderId,
        //   paymentLinkId: paymentLink.id,
        //   checkoutUrl: paymentLink.url
        // });

        return res.status(200).json({
            checkoutUrl: paymentLink.url,
            orderId: paymentLink.orderId,
        })
    } catch (error) {
        console.error('Square checkout error:', error)
        return res.status(500).json({
            error: 'Failed to create checkout session',
            details: error.message,
        })
    }
}
