import { useState } from 'react'
import * as db from '../pages/api/database'
import Checkbox from './Checkbox'
import Popover from './Popover'

export default function OrderSummaryCard(props) {
    const [flipped, setFlipped] = useState(false)
    const [verificationStatus, setVerificationStatus] = useState(
        props.order.is_verified
    )
    const [paymentStatus, setPaymentStatus] = useState(props.order.has_paid)
    const [emailSentStatus, setEmailSentStatus] = useState(
        props.order.email_sent
    )

    const deliveryDates = [
        'Thu Dec 11 2025',
        'Thu Dec 18 2025',
        'Mon Dec 22 2025',
    ]

    const isIrregularDeliveryDate = !deliveryDates.includes(
        new Date(props.order.delivery_date).toDateString()
    )

    const flipCard = (flipState) => {
        if (flipState === 'toggle') {
            flipped === 'flipped'
                ? setFlipped('unflipped')
                : setFlipped('flipped')
        } else if (flipState && flipped) {
            setFlipped(flipState)
            return
        }
    }

    const toggleOrderVerification = async (e) => {
        const isChecked = e.target.checked
        setVerificationStatus(isChecked)
        await db.updateVerificationStatus(props.order.order_uid, isChecked)
    }

    const toggleOrderPaymentStatus = async (e) => {
        const isChecked = e.target.checked
        setPaymentStatus(isChecked)
        await db.updatePaymentStatus(props.order.order_uid, isChecked)
    }

    const toggleEmailSentStatus = async (e) => {
        const isChecked = e.target.checked
        setEmailSentStatus(isChecked)
        await db.updateEmailSentStatus(props.order.order_uid, isChecked)
    }

    return (
        <div className="relative print:inline-block print:w-[33vw] [perspective:1500px]">
            <div className="hidden">
                <button
                    className="flip-override"
                    onClick={() => {
                        setFlipped(false)
                    }}
                ></button>
            </div>
            <div
                className={`bg-default-100 px-4 py-3 rounded-md shadow-box w-full sm:w-96 h-64 sm:h-56 md:h-64 group ${
                    flipped == 'flipped'
                        ? 'animate-frontTileFlip print:animate-backTileFlip'
                        : flipped == 'unflipped'
                          ? 'animate-backTileFlip [animation-delay:0.25s]'
                          : null
                } print:border print:rounded-none print:block print:shadow-none print:w-full print:h-full print:border-b-0 `}
            >
                <div className="flex justify-between gap-2">
                    <h2 className="text-default-900 font-bold text-2xl pb-2 truncate print:text-lg print:p-0 ">
                        {props.order.customer_name}
                    </h2>
                    <div className="flex gap-2 min-w-fit print:hidden">
                        <div>
                            <Popover
                                content={`${
                                    verificationStatus
                                        ? 'Order is Verified!'
                                        : 'Needs Verification'
                                }`}
                            >
                                {verificationStatus ? (
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 71 71"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            cx="35.0278"
                                            cy="35.4977"
                                            r="35.0278"
                                            fill="#22DF03"
                                        />
                                        <path
                                            d="M16.9099 36.7056L31.4042 51.1999L55.5613 22.2113"
                                            stroke="#F8F8F8"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 70 70"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M70 35C70 54.33 54.33 70 35 70C15.67 70 0 54.33 0 35C0 15.67 15.67 0 35 0C54.33 0 70 15.67 70 35Z"
                                            fill="#FF3C3C"
                                        />
                                        <path
                                            d="M38.6678 16.8966L38.0455 44.1649H31.9733L31.3699 16.8966H38.6678ZM35.0094 55.9321C33.8654 55.9321 32.8848 55.5298 32.0676 54.7252C31.263 53.9206 30.8607 52.94 30.8607 51.7834C30.8607 50.6519 31.263 49.6839 32.0676 48.8793C32.8848 48.0747 33.8654 47.6724 35.0094 47.6724C36.1283 47.6724 37.0964 48.0747 37.9135 48.8793C38.7433 49.6839 39.1581 50.6519 39.1581 51.7834C39.1581 52.5503 38.9633 53.248 38.5735 53.8766C38.1964 54.5052 37.6935 55.0081 37.0649 55.3852C36.4489 55.7498 35.7637 55.9321 35.0094 55.9321Z"
                                            fill="white"
                                        />
                                    </svg>
                                )}
                            </Popover>
                        </div>
                        <div>
                            <Popover
                                content={`${
                                    paymentStatus
                                        ? 'Order Paid!'
                                        : 'Has Not Paid'
                                } (${props.order.payment_type})`}
                            >
                                {paymentStatus ? (
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 70 70"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M70 35C70 54.33 54.33 70 35 70C15.67 70 0 54.33 0 35C0 15.67 15.67 0 35 0C54.33 0 70 15.67 70 35Z"
                                            fill="#FFBA0A"
                                        />
                                        <path
                                            d="M70 35C70 54.33 54.33 70 35 70C15.67 70 0 54.33 0 35C0 15.67 15.67 0 35 0C54.33 0 70 15.67 70 35Z"
                                            fill="#22DF03"
                                        />
                                        <path
                                            d="M35.5896 32.6207C30.1103 31.1966 28.3483 29.7241 28.3483 27.431C28.3483 24.8 30.7862 22.9655 34.8655 22.9655C39.1621 22.9655 40.7552 25.0172 40.9 28.0345H46.2345C46.0655 23.8828 43.531 20.069 38.4862 18.8379V13.5517H31.2448V18.7655C26.5621 19.7793 22.7965 22.8207 22.7965 27.4793C22.7965 33.0552 27.4069 35.831 34.1414 37.4483C40.1759 38.8966 41.3828 41.0207 41.3828 43.2655C41.3828 44.931 40.2 47.5862 34.8655 47.5862C29.8931 47.5862 27.9379 45.3655 27.6724 42.5172H22.3621C22.6517 47.8035 26.6103 50.7724 31.2448 51.7621V57H38.4862V51.8103C43.1931 50.9172 46.9345 48.1897 46.9345 43.2414C46.9345 36.3862 41.069 34.0448 35.5896 32.6207Z"
                                            fill="#F8F8F8"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 70 70"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M70 35C70 54.33 54.33 70 35 70C15.67 70 0 54.33 0 35C0 15.67 15.67 0 35 0C54.33 0 70 15.67 70 35Z"
                                            fill="#FFBA0A"
                                        />
                                        <path
                                            d="M35 23.8966C39.2966 23.8966 40.8897 25.9483 41.0345 28.9655H46.369C46.2 24.8138 43.6655 21 38.6207 19.769V14.4828H31.3793V19.6966C30.4379 19.8897 29.569 20.2034 28.7241 20.5655L32.369 24.2103C33.1414 24.0172 34.0345 23.8966 35 23.8966ZM18.031 16.7034L14.6276 20.1069L22.931 28.4103C22.931 33.431 26.6966 36.1828 32.369 37.8483L40.8414 46.3207C40.0207 47.5034 38.3069 48.5172 35 48.5172C30.0276 48.5172 28.0724 46.2966 27.8069 43.4483H22.4966C22.7862 48.7345 26.7448 51.7034 31.3793 52.6931V57.931H38.6207V52.7414C40.9379 52.3069 43.0379 51.4138 44.5586 50.0379L49.9172 55.3966L53.3207 51.9931L18.031 16.7034Z"
                                            fill="#F8F8F8"
                                        />
                                        <path
                                            d="M70 35C70 54.33 54.33 70 35 70C15.67 70 0 54.33 0 35C0 15.67 15.67 0 35 0C54.33 0 70 15.67 70 35Z"
                                            fill="#FFBA0A"
                                        />
                                        <path
                                            d="M35 23.8966C39.2966 23.8966 40.8897 25.9483 41.0345 28.9655H46.369C46.2 24.8138 43.6655 21 38.6207 19.769V14.4828H31.3793V19.6966C30.4379 19.8897 29.569 20.2034 28.7241 20.5655L32.369 24.2103C33.1414 24.0172 34.0345 23.8966 35 23.8966ZM18.031 16.7034L14.6276 20.1069L22.931 28.4103C22.931 33.431 26.6966 36.1828 32.369 37.8483L40.8414 46.3207C40.0207 47.5034 38.3069 48.5172 35 48.5172C30.0276 48.5172 28.0724 46.2966 27.8069 43.4483H22.4966C22.7862 48.7345 26.7448 51.7034 31.3793 52.6931V57.931H38.6207V52.7414C40.9379 52.3069 43.0379 51.4138 44.5586 50.0379L49.9172 55.3966L53.3207 51.9931L18.031 16.7034Z"
                                            fill="#F8F8F8"
                                        />
                                    </svg>
                                )}
                            </Popover>
                        </div>
                        <div
                            className={`${
                                isIrregularDeliveryDate ? '' : 'hidden'
                            }`}
                        >
                            <Popover content={`Irregular Delivery Date`}>
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 70 70"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="35"
                                        cy="35"
                                        r="35"
                                        fill="#FFBA0A"
                                    />
                                    <path
                                        d="M16.1429 34.8571H35V38H16.1429V34.8571ZM13 27H28.7143V30.1429H13V27Z"
                                        fill="#F8F8F8"
                                    />
                                    <path
                                        d="M56.8737 35.8716L52.1965 24.7363C52.0765 24.4501 51.8767 24.2061 51.622 24.0347C51.3673 23.8634 51.0688 23.7721 50.7637 23.7723H46.0865V20.5908C46.0865 20.1689 45.9223 19.7642 45.6299 19.4659C45.3375 19.1676 44.941 19 44.5275 19H19.5824V22.1815H42.9684V42.155C42.258 42.5759 41.6363 43.1362 41.1391 43.8035C40.6419 44.4707 40.2791 45.2318 40.0717 46.0428H30.2745C29.895 44.5433 28.9926 43.2364 27.7363 42.3672C26.4801 41.498 24.9562 41.1261 23.4505 41.3213C21.9447 41.5164 20.5604 42.2652 19.557 43.4273C18.5536 44.5893 18 46.0849 18 47.6336C18 49.1823 18.5536 50.6779 19.557 51.8399C20.5604 53.002 21.9447 53.7508 23.4505 53.9459C24.9562 54.141 26.4801 53.7692 27.7363 52.9C28.9926 52.0307 29.895 50.7239 30.2745 49.2244H40.0717C40.4108 50.5896 41.1864 51.8005 42.2758 52.6654C43.3652 53.5304 44.7062 54 46.0865 54C47.4669 54 48.8079 53.5304 49.8972 52.6654C50.9866 51.8005 51.7623 50.5896 52.1014 49.2244H55.4409C55.8544 49.2244 56.251 49.0568 56.5434 48.7584C56.8357 48.4601 57 48.0555 57 47.6336V36.4983C57.0001 36.2828 56.9571 36.0695 56.8737 35.8716V35.8716ZM24.2596 50.8151C23.6429 50.8151 23.0401 50.6285 22.5273 50.2789C22.0145 49.9293 21.6148 49.4325 21.3788 48.8511C21.1428 48.2698 21.0811 47.6301 21.2014 47.0129C21.3217 46.3958 21.6187 45.8289 22.0548 45.3839C22.4908 44.939 23.0464 44.636 23.6513 44.5132C24.2562 44.3905 24.8831 44.4535 25.4529 44.6943C26.0226 44.9351 26.5096 45.3428 26.8523 45.866C27.1949 46.3892 27.3778 47.0044 27.3778 47.6336C27.3769 48.4771 27.0481 49.2859 26.4636 49.8823C25.879 50.4788 25.0863 50.8143 24.2596 50.8151V50.8151ZM46.0865 26.9538H49.7348L53.0774 34.9076H46.0865V26.9538ZM46.0865 50.8151C45.4698 50.8151 44.867 50.6285 44.3542 50.2789C43.8414 49.9293 43.4418 49.4325 43.2058 48.8511C42.9698 48.2698 42.908 47.6301 43.0283 47.0129C43.1486 46.3958 43.4456 45.8289 43.8817 45.3839C44.3178 44.939 44.8734 44.636 45.4782 44.5132C46.0831 44.3905 46.71 44.4535 47.2798 44.6943C47.8496 44.9351 48.3365 45.3428 48.6792 45.866C49.0218 46.3892 49.2047 47.0044 49.2047 47.6336C49.2038 48.4771 48.8751 49.2859 48.2905 49.8823C47.7059 50.4788 46.9133 50.8143 46.0865 50.8151ZM53.8819 46.0428H52.1014C51.758 44.6803 50.9811 43.4725 49.8926 42.6088C48.8041 41.7452 47.4654 41.2745 46.0865 41.2706V38.0891H53.8819V46.0428Z"
                                        fill="#F8F8F8"
                                    />
                                </svg>
                            </Popover>
                        </div>
                        <div
                            className={`${
                                props.order.additional_information
                                    ? ''
                                    : 'hidden'
                            }`}
                        >
                            <Popover content={`Has Additional Information!`}>
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 70 70"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="35"
                                        cy="35"
                                        r="35"
                                        fill="#FFBA0A"
                                    />
                                    <path
                                        d="M20.6513 38.0842V23.0651C20.6513 22.0693 21.0469 21.1142 21.751 20.4101C22.4552 19.7059 23.4102 19.3103 24.4061 19.3103H46.9348C47.9306 19.3103 48.8857 19.7059 49.5898 20.4101C50.294 21.1142 50.6896 22.0693 50.6896 23.0651V47.4712C50.6896 49.3486 49.5631 53.1034 45.0574 53.1034M28.1609 26.8199H43.18M28.1609 34.3295H35.6704M45.0574 53.1034H22.5287C20.6513 53.1034 16.8965 51.977 16.8965 47.4712V43.7164H39.4252V47.4712C39.4252 51.977 43.18 53.1034 45.0574 53.1034Z"
                                        stroke="#FAFAFA"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Popover>
                        </div>
                        <div>
                            <button onClick={() => flipCard('toggle')}>
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 14 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1.15381 22.3076L11.3076 12.1538L1.15381 1.99998"
                                        stroke="black"
                                        strokeWidth="3"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="overflow-y-auto max-h-48 sm:max-h-40 md:max-h-48 pt-2 print:max-h-full print:p-0">
                    {Object.keys(props.order.order_items).map((item) => {
                        if (props.order.order_items[item] > 0) {
                            return (
                                <div
                                    key={item}
                                    className="border-b-2 text-lg pt-2 print:text-sm print:pt-1 flex justify-between"
                                >
                                    {props.order.order_items[item]}x&nbsp;
                                    {
                                        props.productNames.find(
                                            (product) =>
                                                product.product_id == item
                                        ).product_name
                                    }
                                    <span className="hidden print:block">
                                        <Checkbox />
                                    </span>
                                </div>
                            )
                        } else {
                            return <div key={item}></div>
                        }
                    })}
                </div>
            </div>
            <div
                className={`group absolute bg-default-100 px-4 py-3 rounded-md shadow-box w-full h-64 sm:h-56 md:h-64 sm:w-96 top-0 ${
                    flipped == 'flipped'
                        ? 'animate-backTileFlip animation-delay-400'
                        : flipped == 'unflipped'
                          ? 'animate-frontTileFlip'
                          : 'hidden print:relative print:block print:rounded-none print:border print:border-t-0 print:shadow-none print:w-full print:h-full print:py-0'
                }`}
            >
                <div className="flex justify-between gap-2 items-center print:hidden pb-2">
                    <h2 className="text-default-900 font-bold text-2xl truncate">
                        {props.order.customer_name}
                    </h2>

                    <div className="flex gap-2 min-w-fit">
                        <div className="flex justify-right items-center gap-2">
                            <div
                                id={`${props.order.order_uid}-email-sent-message`}
                            >
                                {emailSentStatus ? (
                                    <p className="text-green-500">Sent</p>
                                ) : (
                                    <p className="text-red-500">Not Sent</p>
                                )}
                            </div>

                            <button
                                className="bg-default-100 rounded-md shadow-box px-2"
                                onClick={() => {
                                    props.openEmailModal(
                                        props.order.customer_name,
                                        props.order.order_uid
                                    )
                                }}
                            >
                                <svg
                                    width="32"
                                    height="32"
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
                        </div>
                        <button
                            className="flex"
                            onClick={() => flipCard('toggle')}
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 14 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1.15381 22.3076L11.3076 12.1538L1.15381 1.99998"
                                    stroke="black"
                                    strokeWidth="3"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div>
                    <div className="overflow-y-auto max-h-44 sm:max-h-40 md:max-h-44 pt-2 print:max-h-full print:overflow-hidden print:p-0">
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">VERIFIED:</h3>
                            <Checkbox
                                defaultChecked={props.order.is_verified}
                                handleInputChange={toggleOrderVerification}
                            />
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">ORDER PAID:</h3>
                            <Checkbox
                                defaultChecked={props.order.has_paid}
                                handleInputChange={toggleOrderPaymentStatus}
                            />
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">EMAIL SENT</h3>
                            <Checkbox
                                defaultChecked={props.order.email_sent}
                                handleInputChange={toggleEmailSentStatus}
                            />
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Delivery Date:</h3>
                            <p>
                                {new Date(
                                    props.order.delivery_date
                                ).toDateString()}
                            </p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Address:</h3>
                            <p>{props.order.address}</p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className=" font-bold">City:</h3>
                            <p>{props.order.city}</p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Payment Type:</h3>
                            <p>{props.order.payment_type}</p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Order Cost:</h3>
                            <p>
                                $
                                {(
                                    parseFloat(props.order.order_cost) || 0
                                ).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Misc. Fees:</h3>
                            <p>
                                $
                                {(
                                    parseFloat(props.order.misc_fees) || 0
                                ).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Total Cost:</h3>
                            <p>
                                $
                                {(
                                    parseFloat(props.order.misc_fees || 0) +
                                    parseFloat(props.order.order_cost)
                                ).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Email:</h3>
                            <p>{props.order.email}</p>
                        </div>
                        <div className="flex text-default-900 text-lg gap-2 print:text-sm">
                            <h3 className="font-bold">Phone:</h3>
                            <p>{props.order.phone}</p>
                        </div>
                        <div className="flex flex-col text-default-900 text-lg print:text-sm print:pb-2">
                            <h3 className="font-bold">
                                Additional Information:
                            </h3>
                            <p className="leading-5">
                                {props.order.additional_information || 'None'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
