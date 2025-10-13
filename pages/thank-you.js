import Image from 'next/image'
import { useRouter } from 'next/router'
import Button from '../components/Button'
import MainHeader from '../components/MainHeader'

export default function ThankYou() {
    const router = useRouter()

    return (
        <>
            <MainHeader active="christmas" />
            <div className="pt-32 justify-center">
                <div className="row-span-3 self-center px-16">
                    <h1 className="text-default-900 text-6xl font-bold text-center">
                        Thank you for ordering!
                    </h1>

                    <div className="flex flex-wrap justify-center gap-5 text-center my-8">
                        <p className="text-default-900 text-3xl ">
                            {router.query.hasAdditionalInformation == 'true'
                                ? 'I will email you shortly with your order and total!'
                                : 'Your order has been sent to your email'}
                        </p>
                        <div className="flex h-10 w-20">
                            <Image
                                src="/images/icons/mail.png"
                                width="80"
                                height="25"
                            />
                        </div>
                    </div>
                </div>
                <div className="pt-10 w-full h-full flex justify-center">
                    <div className="w-60">
                        <Button
                            type="primary"
                            link={true}
                            path="/products"
                            as="/products"
                            img="/images/icons/new_order.png"
                        >
                            NEW ORDER
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
