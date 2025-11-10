import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Button from '../components/Button'
import ConfirmDeletionModal from '../components/ConfirmDeletionModal'
import DateSidebar from '../components/DateSidebar'
import Navbar from '../components/Navbar'
import OrderTableData from '../components/OrderTableData'
import { CURRENT_SEASON, DATE_RANGES } from '../utils/constants'
import * as db from './api/database'
import { allowedEmails } from './login'

export async function getServerSideProps(context) {
    // const session = await getSession(context);
    //
    // if (
    //     process.env.NODE_ENV !== "development" &&
    //     (!session || !allowedEmails.includes(session.user.email))
    // ) {
    //     context.res.writeHead(302, { Location: "/login" });
    //     context.res.end();
    //     return {};
    // }
    const currentSeason = new Date(`${CURRENT_SEASON}-09-01 00:00:00`)
    const oneYearFromNow = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
    )
    const dates = {
        start_date: currentSeason,
        end_date: oneYearFromNow,
    }
    const [orderData, products] = await Promise.all([
        db.getAllData(dates),
        db.getProductNames(),
    ])
    return {
        props: {
            initialOrderData: orderData,
            initialProductNames: products,
        },
    }
}

export default function Orders({ initialOrderData, initialProductNames }) {
    const [activeDate, setActiveDate] = useState('All')
    const [orderData, setOrderData] = useState(initialOrderData)
    const [productNames, setProductNames] = useState(initialProductNames)
    const [deletedOrderUid, setDeletedOrderUid] = useState(null)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [modalBody, setModalBody] = useState('')

    const changeDate = async (date) => {
        if (date == 'All') {
            setOrderData(initialOrderData)
        } else {
            const [newOrderData, newProductNames] = await Promise.all([
                db.getAllData(DATE_RANGES[date]),
                db.getProductNames(),
            ])
            setOrderData(newOrderData)
            setProductNames(newProductNames)
        }
        setActiveDate(date)
    }

    const editTableData = (e) => {
        const button = e.currentTarget
        const uid = button.dataset['uid']
        const col_name = button.dataset['col_name']
        const input = document.getElementById(`${uid}-${col_name}-input`)
        const text = document.getElementById(`${uid}-${col_name}-text`)
        const textWell = document.getElementById(`${uid}-${col_name}-text-well`)
        const btns = document.getElementById(`${uid}-${col_name}-btns`)
        const value = text.innerText
        textWell.classList.add('hidden')
        input.setAttribute('size', value.length)
        if (col_name === 'delivery_date') {
            const date = new Date(value)
            value =
                date.getUTCFullYear() +
                '-' +
                ('0' + (date.getUTCMonth() + 1)).slice(-2) +
                '-' +
                ('0' + date.getUTCDate()).slice(-2)
        }
        input.value = value
        input.focus()
        input.classList.remove('hidden')
        if (col_name == 'additional_information') {
            changeTextAreaHeight(null, input)
        }

        button.classList.add('hidden')
        btns.classList.remove('hidden')
    }

    const saveTableEdit = async (e) => {
        const button = e.currentTarget
        const uid = button.dataset['uid']
        const col_name = button.dataset['col_name']
        const input = document.getElementById(`${uid}-${col_name}-input`)
        const value = input.value
        if (!isNaN(col_name)) {
            const productsData = await db.getAllProductsData()
            const order = await db.getOrderByUid(uid)
            if (!order) {
                console.log('Order not found')
                return
            }
            order = order[0]
            const order_items = order.order_items
            order_items[col_name] = parseFloat(value)
            let order_cost = 0
            for (const [id, qty] of Object.entries(order_items)) {
                const currentProduct = productsData.find(
                    (product) => product.product_id == parseInt(id)
                )
                const product_cost =
                    parseFloat(currentProduct.product_price) * parseFloat(qty)
                order_cost += product_cost
            }
            await db.updateTableData(value, uid, col_name, order_cost)
            document.getElementById(`${uid}-order_cost-text`).innerText =
                order_cost
            const misc_fees = document.getElementById(
                `${uid}-misc_fees-text`
            ).innerText
            document.getElementById(`${uid}-total_cost-text`).innerText =
                order_cost + parseFloat(misc_fees)
        } else {
            await db.updateTableData(value, uid, col_name)
        }
        const text = document.getElementById(`${uid}-${col_name}-text`)
        const textWell = document.getElementById(`${uid}-${col_name}-text-well`)
        const btns = document.getElementById(`${uid}-${col_name}-btns`)
        const editBtn = document.getElementById(`${uid}-${col_name}-edit`)
        if (col_name === 'delivery_date') {
            const date = new Date(value + 'T00:00:00')
            value = date.toDateString()
        }
        text.innerText = parseInt('col_name') ? value || 0 : value || '-'
        textWell.classList.remove('hidden')
        input.classList.add('hidden')
        editBtn.classList.remove('hidden')
        btns.classList.add('hidden')
        const orders_columns = [
            'delivery_date',
            'has_paid',
            'is_verified',
            'payment_type',
            'additional_information',
            'order_cost',
            'misc_fees',
            'creation_timestamp',
            'is_corporate',
        ]
        if (orders_columns.includes(col_name) && col_name !== 'is_verified') {
            document.getElementById(`${uid}-is_verified-text`).innerText = 'No'
            if (col_name == 'misc_fees') {
                const order_cost = document.getElementById(
                    `${uid}-order_cost-text`
                ).innerText
                const total_cost = parseInt(order_cost) + parseInt(value)
                document.getElementById(`${uid}-total_cost-text`).innerText =
                    total_cost
            }
        }
    }

    const cancelTableEdit = (e) => {
        const button = e.currentTarget
        const uid = button.dataset['uid']
        const col_name = button.dataset['col_name']
        const input = document.getElementById(`${uid}-${col_name}-input`)
        const textWell = document.getElementById(`${uid}-${col_name}-text-well`)
        const btns = document.getElementById(`${uid}-${col_name}-btns`)
        const editBtn = document.getElementById(`${uid}-${col_name}-edit`)
        textWell.classList.remove('hidden')
        input.classList.add('hidden')
        editBtn.classList.remove('hidden')
        btns.classList.add('hidden')
    }

    const deleteOrder = async (order_uid) => {
        closeDeleteModal()
        await db.deleteOrder(order_uid)
        document.getElementById(`${order_uid}-row`).classList.add('hidden')
    }

    const openDeleteModal = (order_uid, customer_uid) => {
        const customerName = document.getElementById(
            `${customer_uid}-customer_name-text`
        ).innerText
        const deliveryDate = document.getElementById(
            `${order_uid}-delivery_date-text`
        ).innerText
        setModalBody(
            `<b>Name:</b> ${customerName}<br><b>Delivery Date:</b> ${deliveryDate}`
        )
        setModalIsOpen(true)
        setDeletedOrderUid(order_uid)
    }

    const closeDeleteModal = () => {
        setModalBody('')
        setModalIsOpen(false)
        setDeletedOrderUid(null)
    }

    const changeTextAreaHeight = (e, input) => {
        if (e) {
            e.currentTarget.style.height = ''
            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
        } else {
            input.style.height = ''
            input.style.height = input.scrollHeight + 'px'
        }
    }

    const { data: session, status } = useSession()
    const router = useRouter()

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
    return (
        <div className="overflow-hidden h-screen relative">
            <div className={`${modalIsOpen ? '' : 'hidden'}`}>
                <ConfirmDeletionModal
                    header={'DELETE ORDER?'}
                    body={modalBody}
                    deleteCallback={() => {
                        deleteOrder(deletedOrderUid)
                    }}
                    closeCallback={() => {
                        closeDeleteModal()
                    }}
                />
            </div>
            <div className="absolute z-10 top-0 right-0 w-screen flex items-center justify-end my-5 pr-2 print:hidden">
                <Button
                    type="primary-md"
                    img="/images/icons/logout.svg"
                    clickHandler={() => {
                        signOut()
                        return true
                    }}
                >
                    <span className="hidden lg:inline">SIGN OUT</span>
                </Button>
            </div>
            <h1 className="pl-5 md:pl-0 md:text-center text-4xl font-bold py-6">
                ALL ORDERS
            </h1>
            <div>
                <DateSidebar activeDate={activeDate} changeDate={changeDate} />
            </div>
            <div className="flex w-full justify-center absolute top-0 left-0 mt-44 md:my-20 ">
                <div className="overflow-auto h-[58vh] shadow-box w-[95vw] md:mr-10 md:h-[80vh] md:w-[82vw] md:ml-36 xl:w-[88vw]">
                    <table
                        className="bg-default-100 rounded-md w-screen"
                        id="orders-table"
                    >
                        <thead>
                            <tr className="border-b-2 whitespace-nowrap">
                                <th className="bg-default-100 py-3 px-4 sticky top-0 text-left z-10"></th>
                                {[
                                    'Delivery Date',
                                    {
                                        title: 'Customer Name',
                                        props: 'z-20 px-0 pl-4 left-0',
                                    },
                                    'Email',
                                    'Phone',
                                    'Street Address',
                                    'City',
                                    'Payment Received',
                                    'Verified',
                                    'Payment Type',
                                    'Additional Information',
                                    'Order Cost',
                                    'Misc Fees',
                                    'Total Cost',
                                    'Time of Order',
                                    'Corporate',
                                ].map((columnHeader) => {
                                    return (
                                        <th
                                            className={`bg-default-100 py-3 px-4 sticky top-0 text-left ${
                                                columnHeader.props ?? ''
                                            }`}
                                            key={
                                                columnHeader.title ??
                                                columnHeader
                                            }
                                        >
                                            {columnHeader.title ?? columnHeader}
                                        </th>
                                    )
                                })}
                                {productNames.map((product) => {
                                    return (
                                        <th
                                            className="bg-default-100 py-3 px-2 whitespace-normal sticky top-0"
                                            key={product.product_id}
                                        >
                                            {product.product_name}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {orderData.map((order) => {
                                return (
                                    <tr
                                        key={order.order_uid}
                                        id={`${order.order_uid}-row`}
                                    >
                                        <td>
                                            <button
                                                className="flex pl-3 w-10"
                                                onClick={() => {
                                                    openDeleteModal(
                                                        order.order_uid,
                                                        order.customer_uid
                                                    )
                                                }}
                                            >
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 73 73"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M15.2083 60.8332C15.2083 62.4466 15.8493 63.994 16.9901 65.1348C18.1309 66.2757 19.6783 66.9166 21.2917 66.9166H51.7083C53.3217 66.9166 54.8691 66.2757 56.0099 65.1348C57.1507 63.994 57.7917 62.4466 57.7917 60.8332V24.3333H63.875V18.2499H51.7083V12.1666C51.7083 10.5532 51.0674 9.00586 49.9266 7.86502C48.7857 6.72417 47.2384 6.08325 45.625 6.08325H27.375C25.7616 6.08325 24.2143 6.72417 23.0734 7.86502C21.9326 9.00586 21.2917 10.5532 21.2917 12.1666V18.2499H9.125V24.3333H15.2083V60.8332ZM27.375 12.1666H45.625V18.2499H27.375V12.1666ZM24.3333 24.3333H51.7083V60.8332H21.2917V24.3333H24.3333Z"
                                                        fill="#F00101"
                                                    />
                                                    <path
                                                        d="M27.375 30.4167H33.4583V54.7501H27.375V30.4167ZM39.5417 30.4167H45.625V54.7501H39.5417V30.4167Z"
                                                        fill="#F00101"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.order_uid}
                                                col_name="delivery_date"
                                                type="date"
                                            >
                                                {new Date(
                                                    order.delivery_date
                                                ).toDateString()}
                                            </OrderTableData>
                                        </td>
                                        <td className="sticky left-0">
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.customer_uid}
                                                col_name="customer_name"
                                            >
                                                {order.customer_name}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.customer_uid}
                                                col_name="email"
                                            >
                                                {order.email}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.customer_uid}
                                                col_name="phone"
                                            >
                                                {order.phone}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.customer_uid}
                                                col_name="address"
                                            >
                                                {order.address}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.customer_uid}
                                                col_name="city"
                                            >
                                                {order.city}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.order_uid}
                                                col_name="has_paid"
                                            >
                                                {order.has_paid ? 'Yes' : 'No'}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.order_uid}
                                                col_name="is_verified"
                                            >
                                                {order.is_verified
                                                    ? 'Yes'
                                                    : 'No'}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.order_uid}
                                                col_name="payment_type"
                                            >
                                                {order.payment_type}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.order_uid}
                                                col_name="additional_information"
                                                popout={true}
                                                changeTextAreaHeight={
                                                    changeTextAreaHeight
                                                }
                                            >
                                                {order.additional_information}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.order_uid}
                                                col_name="order_cost"
                                                readOnly={true}
                                                prepend="$"
                                            >
                                                {order.order_cost}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                                uid={order.order_uid}
                                                col_name="misc_fees"
                                                prepend="$"
                                            >
                                                {order.misc_fees || 0}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                col_name="total_cost"
                                                uid={order.order_uid}
                                                readOnly={true}
                                                prepend="$"
                                            >
                                                {order.order_cost +
                                                    order.misc_fees}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                readOnly={true}
                                                col_name="creation_timestamp"
                                            >
                                                {new Date(
                                                    order.creation_timestamp
                                                ).toDateString()}
                                            </OrderTableData>
                                        </td>
                                        <td>
                                            <OrderTableData
                                                uid={order.order_uid}
                                                col_name="is_corporate"
                                                editTableData={editTableData}
                                                saveTableEdit={saveTableEdit}
                                                cancelTableEdit={
                                                    cancelTableEdit
                                                }
                                            >
                                                {order.is_corporate
                                                    ? 'Yes'
                                                    : 'No'}
                                            </OrderTableData>
                                        </td>

                                        {productNames.map((product) => {
                                            const productQuantity =
                                                order.order_items?.[
                                                    product.product_id
                                                ]
                                            return (
                                                <td key={product.product_id}>
                                                    <OrderTableData
                                                        editTableData={
                                                            editTableData
                                                        }
                                                        saveTableEdit={
                                                            saveTableEdit
                                                        }
                                                        cancelTableEdit={
                                                            cancelTableEdit
                                                        }
                                                        uid={order.order_uid}
                                                        col_name={
                                                            product.product_id
                                                        }
                                                    >
                                                        {productQuantity
                                                            ? productQuantity
                                                            : 0}
                                                    </OrderTableData>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <Navbar activeTab="orders" />
        </div>
    )
}
