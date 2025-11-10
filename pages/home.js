import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router.js'
import { useEffect, useState } from 'react'
import AtAGlanceRow from '../components/AtAGlanceRow'
import Button from '../components/Button'
import DateSidebar from '../components/DateSidebar'
import Navbar from '../components/Navbar'
import OrderSummaryTable from '../components/OrderSummaryTable'
import { CURRENT_SEASON, DATE_RANGES } from '../utils/constants.js'
import debounce from '../utils/globals'
import * as db from './api/database.js'
import { allowedEmails } from './login'

export async function getServerSideProps(context) {
    // const session = await getSession(context)

    // if (
    //     process.env.NODE_ENV !== 'development' &&
    //     (!session || !allowedEmails.includes(session.user.email))
    // ) {
    //     console.log({ session })
    //     console.error('NOT LOGGED IN')
    //     context.res.writeHead(302, { Location: '/login' })
    //     context.res.end()
    //     return {}
    // }

    const currentSeason = new Date(`${CURRENT_SEASON}-09-01 00:00:00`)
    const oneYearFromNow = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
    )
    const dates = {
        start_date: currentSeason,
        end_date: oneYearFromNow,
    }
    const [products, initialOrderCounts, productsData] = await Promise.all([
        db.getTotalProductQtyByDate(dates),
        db.getOrderCounts(dates),
        db.getAllProductsData(),
    ])
    console.log(products, initialOrderCounts, productsData)
    const productsWithQty = processProducts(products, productsData)

    return {
        props: {
            productsWithQty,
            initialOrderCounts,
            productsData,
            // user: session?.user || "",
        },
    }
}

const processProducts = (products, productsData) => {
    let productsWithQty = []

    products.forEach((product) => {
        // product_dozens is product_quantity if measured_per is 12
        // product_total is product_quantity multiplied by measured_per
        productsWithQty.push({
            product_id: product.product_id,
            product_name: product.product_name,
            total_dozens:
                parseInt(product.measured_per) == 12
                    ? parseFloat(product.quantity)
                    : 0,
            total_quantity:
                parseFloat(product.quantity) * parseInt(product.measured_per),
            measured_per: product.measured_per,
            cost: productsData.find((p) => p.product_id == product.product_id)
                .product_price,
        })
        // if there are associated products, loop through the associated products
        // attempt to find the product in the productsWithQty array with matching product_id
        // if it exists, increment previous dozens by quantity of assiated product
        // increment total by quantity of associated product multiplied by measured_per
        if (product.associated_products) {
            for (const [product_id, quantity] of Object.entries(
                product.associated_products
            )) {
                const associated_product = productsWithQty.find(
                    (assoc_product) => assoc_product.product_id == product_id
                )
                if (associated_product) {
                    associated_product.additional_total_dozens
                        ? (associated_product.additional_total_dozens +=
                              parseFloat(quantity) *
                              parseFloat(product.quantity))
                        : (associated_product.additional_total_dozens =
                              parseFloat(quantity) *
                              parseFloat(product.quantity))
                    associated_product.additional_total_quantity
                        ? (associated_product.additional_total_quantity +=
                              parseFloat(quantity) *
                              parseFloat(product.quantity) *
                              parseInt(associated_product.measured_per))
                        : (associated_product.additional_total_quantity =
                              parseFloat(quantity) *
                              parseFloat(product.quantity) *
                              parseInt(associated_product.measured_per))
                }
            }
        }
    })
    return productsWithQty
}

export default function Home({ productsWithQty, initialOrderCounts }) {
    const [startDate, setStartDate] = useState('September 1st, 2025')
    const [endDate, setEndDate] = useState('Present')
    const [activeDate, setActiveDate] = useState('All')
    const [products, setProducts] = useState(productsWithQty)
    const [orderCounts, setOrderCounts] = useState(initialOrderCounts)
    const [innerHeight, updateInnerHeight] = useState(0)
    const [isCorporate, setIsCorporate] = useState(false)

    useEffect(() => {
        function detectInnerHeight() {
            updateInnerHeight(window.innerHeight)
        }
        detectInnerHeight()
        window.addEventListener('resize', debounce(detectInnerHeight, 1000))
    }, [])

    const openPrintLayout = () => {
        window.print()
        return true
    }

    const changeDate = async (date) => {
        if (date == 'All') {
            setStartDate('September 1st, 2024')
            setEndDate('Present')
            setProducts(productsWithQty)
            setOrderCounts(initialOrderCounts)
            setIsCorporate(false)
        } else if (date === 'Corporate') {
            const [products, newOrderCounts, newProductsData] =
                await Promise.all([
                    db.getTotalCorporateProductQty(
                        DATE_RANGES[
                            Object.keys(DATE_RANGES)[0]
                        ].start_date.toDateString()
                    ),
                    db.getCorporateOrderCounts(
                        DATE_RANGES[
                            Object.keys(DATE_RANGES)[0]
                        ].start_date.toDateString()
                    ),
                    db.getAllProductsData(),
                ])
            setProducts(processProducts(products, newProductsData))
            setOrderCounts(newOrderCounts)
            setIsCorporate(true)
        } else {
            const [products, newOrderCounts, newProductsData] =
                await Promise.all([
                    db.getTotalProductQtyByDate(DATE_RANGES[date]),
                    db.getOrderCounts(DATE_RANGES[date]),
                    db.getAllProductsData(),
                ])
            setProducts(processProducts(products, newProductsData))
            setStartDate(DATE_RANGES[date].start_date.toDateString())
            setEndDate(DATE_RANGES[date].end_date.toDateString())
            setOrderCounts(newOrderCounts)
            setIsCorporate(false)
        }
        setActiveDate(date)
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
        <div
            className="w-screen relative"
            style={{ height: `${innerHeight + 'px' || '100vh'}` }}
        >
            <div className="absolute top-0 left-0 w-screen flex items-center justify-start my-5 pl-2 print:hidden">
                <div className="px-3 py-3 bg-default-900 flex w-[60px] md:w-[80px] rounded-md overflow-hidden">
                    <Image
                        src="/images/misc/logo.png"
                        width="100"
                        height="100"
                    />
                </div>
            </div>
            <div className="absolute z-10 top-0 right-0 ml-auto flex items-center justify-end my-5 pr-2 print:hidden">
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
            <div className="print:hidden">
                <DateSidebar
                    activeDate={activeDate}
                    changeDate={changeDate}
                    isCorporate={isCorporate}
                />
            </div>
            <div className="absolute top-0 left-0 h-full w-full flex flex-col justify-center sm:gap-5 lg:gap-4 xl:gap-20 pt-8 pb-24 md:flex-row print:py-0 print:h-[100vh]">
                <div className="md:mr-4 flex flex-col items-center justify-center overflow-hidden md:ml-36 print:mx-0 print:pt-0">
                    <div className="hidden print:flex print:mr-auto text-default-900 text-lg flex-col">
                        <div>Start Date: {startDate}</div>
                        <div>End Date: {endDate}</div>
                    </div>
                    <div className="flex overflow-hidden justify-center items-center pb-6 pt-40 print:mr-auto print:pt-0 md:pt-0">
                        <h2 className="text-default-900 font-bold text-3xl text-center print:text-left">
                            {isCorporate ? (
                                <span>Corporate</span>
                            ) : (
                                <>
                                    <span className="print:hidden">
                                        Week of:{' '}
                                        {endDate == 'Present' ? 'All' : endDate}
                                    </span>
                                    <span className="hidden print:block">
                                        DELIVERY DATE:{' '}
                                        {endDate == 'Present' ? 'All' : endDate}
                                    </span>
                                </>
                            )}
                        </h2>
                        <div className="print:hidden">
                            <Button
                                img="/images/icons/printer.png"
                                type="secondary-md"
                                clickHandler={openPrintLayout}
                            ></Button>
                        </div>
                    </div>
                    <OrderSummaryTable products={products} />
                </div>
                <div className="hidden items-center mr-10 xl:mr-28 2xl:mr-72 lg:flex print:hidden">
                    <div className="bg-default-100 shadow-box flex flex-col rounded-md">
                        <h2 className="text-default-900 font-bold text-xl lg:text-3xl px-2 py-2 lg:py-4 lg:px-6">
                            AT A GLANCE
                        </h2>
                        <div className="text-default-900 px-3 py-5 pt-0 lg:text-2xl lg:px-6 ">
                            <AtAGlanceRow
                                text="Unverified:"
                                src="/images/icons/red_exclamation.svg"
                                number={orderCounts?.[0].unverified_orders}
                            />
                            <AtAGlanceRow
                                text="Total:"
                                src="/images/icons/edit_icon.svg"
                                number={orderCounts?.[0].total_orders}
                            />
                            <AtAGlanceRow
                                text="Unpaid:"
                                src="/images/icons/yellow_unpaid.svg"
                                number={orderCounts?.[0].unpaid_orders}
                            />
                            <AtAGlanceRow
                                text="Verified:"
                                src="/images/icons/green_checkmark.svg"
                                number={orderCounts?.[0].verified_orders}
                            />
                            <div className="pb-6">
                                <AtAGlanceRow
                                    text="Paid:"
                                    src="/images/icons/green_money.svg"
                                    number={orderCounts?.[0].paid_orders}
                                />
                            </div>
                            <AtAGlanceRow
                                text="Dozens:"
                                src="/images/icons/multiple_cookies.png"
                                number={products.reduce((total, product) => {
                                    return total + product.total_dozens
                                }, 0)}
                            />
                            <AtAGlanceRow
                                text="Items:"
                                src="/images/icons/black_box.png"
                                number={products.reduce((total, product) => {
                                    return total + product.total_quantity
                                }, 0)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="print:hidden">
                <Navbar activeTab="home" />
            </div>
        </div>
    )
}
