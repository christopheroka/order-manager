import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Button from '../components/Button'
import EmailModal from '../components/EmailModal'
import Navbar from '../components/Navbar'
import * as db from './api/database'
import { allowedEmails } from './login'

export async function getServerSideProps(context) {
    const customersData = await db.getCustomersData()

    return {
        props: {
            customersData: customersData || [],
        },
    }
}

export default function Customers({ customersData }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalBody, setModalBody] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState(null)

    if (status === 'loading') {
        return <div>Loading...</div>
    }

    if (
        process.env.NODE_ENV !== 'development' &&
        (!session || !allowedEmails.includes(session.user.email))
    ) {
        router.push('/login')
        return null
    }

    const processCustomersData = (customers) => {
        // Group customers by email (case-insensitive)
        const groupedByEmail = customers.reduce((acc, customer) => {
            const emailKey = customer.email.toLowerCase()

            if (!acc[emailKey]) {
                acc[emailKey] = {
                    customer_name: customer.customer_name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    city: customer.city,
                    orders: [],
                }
            }

            // Add all orders from this customer record to the grouped email
            acc[emailKey].orders = acc[emailKey].orders.concat(customer.orders)

            return acc
        }, {})

        // Process the grouped data
        return Object.values(groupedByEmail)
            .map((customer) => {
                const totalSpent = customer.orders.reduce(
                    (total, order) =>
                        total +
                        parseFloat(order.order_cost || 0) +
                        parseFloat(order.misc_fees || 0),
                    0
                )
                const totalOrders = customer.orders.length

                const orderDates = customer.orders.map(
                    (order) => new Date(order.creation_timestamp)
                )
                const latestOrderDate = orderDates.reduce(
                    (latest, date) => (date > latest ? date : latest),
                    new Date(0)
                )
                const earliestOrderDate = orderDates.reduce(
                    (earliest, date) => (date < earliest ? date : earliest),
                    new Date()
                )

                return {
                    ...customer,
                    totalSpent,
                    totalOrders,
                    latestOrderDate,
                    earliestOrderDate,
                }
            })
            .sort((a, b) => a.customer_name.localeCompare(b.customer_name))
    }

    const processedCustomers = processCustomersData(customersData)

    const openEmailModal = (customer) => {
        setModalBody(
            `<p style="margin:0; padding-bottom: 1rem">Send To: ${customer.customer_name} (${customer.email})</p> Email Message: <br><textarea id="email-body-textarea" rows="4" style="border: 1px solid black; border-radius: 5px; padding: 0.5rem; width: 100%;"></textarea>`
        )
        setSelectedCustomer(customer)
        setModalIsOpen(true)
    }

    const closeEmailModal = () => {
        setModalBody('')
        setSelectedCustomer(null)
        setModalIsOpen(false)
    }

    const sendEmailCallback = async () => {
        const email_body = document.getElementById('email-body-textarea').value

        const response = await fetch('/api/sendCustomerEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_data: selectedCustomer,
                email_body,
            }),
        })

        if (response.status === 200) {
            console.log('Email sent successfully')
        } else {
            console.error('Failed to send email')
        }

        closeEmailModal()
    }

    return (
        <div className="overflow-hidden">
            <div className={`${modalIsOpen ? '' : 'hidden'}`}>
                <EmailModal
                    header={'SEND EMAIL'}
                    body={modalBody}
                    closeCallback={closeEmailModal}
                    sendEmailCallback={sendEmailCallback}
                />
            </div>
            <h1 className="absolute flex pl-5 md:pl-0 md:justify-center items-center text-2xl sm:text-4xl font-bold py-6 bg-default-100 w-full">
                CUSTOMERS
            </h1>
            <div className="absolute z-10 top-0 right-0 ml-auto flex items-center justify-end sm:my-5 sm:pr-2">
                <Button
                    type="primary-md"
                    img="/images/icons/logout.svg"
                    clickHandler={() => {
                        signOut()
                        return true
                    }}
                ></Button>
            </div>
            <div className="absolute z-[100] top-0 left-0 w-62 items-center justify-start hidden sm:flex my-2 pl-2 md:pr-5">
                <div className="hidden rounded-md px-3 py-3 bg-default-900 md:flex w-[60px] sm:w-[60px] md:w-[80px]">
                    <Image
                        src="/images/misc/logo.png"
                        width="100"
                        height="100"
                    />
                </div>
            </div>
            <div className="flex h-screen sm:items-center justify-center">
                <div className="overflow-auto pb-32 px-8 pt-2 max-h-[65vh] sm:max-h-full sm:pl-5 sm:pr-5 mt-44 sm:mt-0 sm:pt-20 md:pt-20 md:pb-32 md:mb-20 md:mt-0 w-full max-w-7xl">
                    <div className="bg-default-100 rounded-md shadow-box overflow-x-auto mt-8">
                        <table className="w-full">
                            <thead className="bg-default-900 text-black">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Customer Name
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Phone
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Total Orders
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Total Spent
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Latest Order
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Earliest Order
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        City
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedCustomers.map((customer, index) => (
                                    <tr
                                        key={customer.customer_uid}
                                        className={`${
                                            index % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-gray-50'
                                        } hover:bg-gray-100 transition-colors`}
                                    >
                                        <td className="px-4 py-3 font-semibold text-default-900">
                                            {customer.customer_name}
                                        </td>
                                        <td className="px-4 py-3 text-default-700">
                                            {customer.email}
                                        </td>
                                        <td className="px-4 py-3 text-default-700">
                                            {customer.phone}
                                        </td>
                                        <td className="px-4 py-3 text-default-700">
                                            {customer.totalOrders}
                                        </td>
                                        <td className="px-4 py-3 text-default-700">
                                            ${customer.totalSpent.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-default-700">
                                            {customer.latestOrderDate.toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-default-700">
                                            {customer.earliestOrderDate.toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-default-700">
                                            {customer.city}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                className="bg-default-100 rounded-md shadow-box px-2 py-1 hover:bg-gray-200 transition-colors"
                                                onClick={() =>
                                                    openEmailModal(customer)
                                                }
                                            >
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 32 32"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M28 6H4C3.46957 6 2.96086 6.21071 2.58579 6.58579C2.21071 6.96086 2 7.46957 2 8V24C2 24.5304 2.21071 25.0391 2.58579 25.4142C2.96086 25.7893 3.46957 26 4 26H28C28.5304 26 29.0391 25.7893 29.4142 25.4142C29.7893 25.0391 30 24.5304 30 24V8C30 7.46957 29.7893 6.96086 29.4142 6.58579C29.0391 6.21071 28.5304 6 28 6V6ZM25.8 8L16 14.78L6.2 8H25.8ZM4 24V8.91L15.43 16.82C15.5974 16.9361 15.7963 16.9984 16 16.9984C16.2037 16.9984 16.4026 16.9361 16.57 16.82L28 8.91V24H4Z"
                                                        fill="#161616"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div>
                <Navbar activeTab="customers" />
            </div>
        </div>
    )
}

