import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { hideThrobber, showThrobber } from '../utils/globals.js'

export default function Navbar(props) {
    const router = useRouter()
    const rendered = useRef(false)
    useEffect(() => {
        if (rendered.current) return
        router.prefetch('/')
        router.prefetch('/orders')
        router.prefetch('/order-dashboard')
        router.prefetch('/customers')
        rendered.current = true
    }, [])

    const navigate = (path) => {
        router.events.on('routeChangeStart', showThrobber)
        router.events.on('routeChangeComplete', hideThrobber)
        router.push(path)
    }

    return (
        <div className="w-full fixed bottom-0">
            <div className="mb-5 mx-2 md:mx-4 lg:mx-8 xl:mx-16 2xl:mx-32">
                <div className="overflow-x-auto bg-default-900 rounded md:rounded-full">
                    <div className="flex items-center justify-start md:justify-around text-sm font-bold text-default-100 py-3 px-4 text-center md:text-left md:text-xl min-w-max gap-6 md:gap-4">
                        <div className="relative cursor-pointer">
                            <a
                                className={
                                    props.activeTab == 'home'
                                        ? 'text-pink-300'
                                        : ''
                                }
                                onClick={() => {
                                    navigate('/home')
                                }}
                            >
                                HOME
                            </a>
                            {props.activeTab == 'home' ? (
                                <div className="absolute -bottom-3 left-0 bg-pink-300 w-full h-1"></div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="relative cursor-pointer">
                            <a
                                className={
                                    props.activeTab == 'order-dashboard'
                                        ? 'text-pink-300'
                                        : ''
                                }
                                onClick={() => {
                                    navigate('/order-dashboard')
                                }}
                            >
                                ORDER DASHBOARD
                            </a>
                            {props.activeTab == 'order-dashboard' ? (
                                <div className="absolute -bottom-3 left-0 bg-pink-300 w-full h-1"></div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="relative cursor-pointer">
                            <a
                                className={
                                    props.activeTab == 'orders'
                                        ? 'text-pink-300'
                                        : ''
                                }
                                onClick={() => {
                                    navigate('/orders')
                                }}
                            >
                                ALL ORDERS
                            </a>
                            {props.activeTab == 'orders' ? (
                                <div className="absolute -bottom-3 left-0 bg-pink-300 w-full h-1"></div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="relative cursor-pointer">
                            <a
                                className={
                                    props.activeTab == 'customers'
                                        ? 'text-pink-300'
                                        : ''
                                }
                                onClick={() => {
                                    navigate('/customers')
                                }}
                            >
                                CUSTOMERS
                            </a>
                            {props.activeTab == 'customers' ? (
                                <div className="absolute -bottom-3 left-0 bg-pink-300 w-full h-1"></div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="relative cursor-pointer">
                            <a
                                className={
                                    props.activeTab == 'historical-orders'
                                        ? 'text-pink-300'
                                        : ''
                                }
                                onClick={() => {
                                    navigate('/historical-orders')
                                }}
                            >
                                HISTORICAL ORDERS
                            </a>
                            {props.activeTab == 'historical-orders' ? (
                                <div className="absolute -bottom-3 left-0 bg-pink-300 w-full h-1"></div>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
