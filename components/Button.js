import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Button(props) {
    const [disabled, updateDisabled] = useState(false)

    const handleClick = async (e) => {
        e.preventDefault()
        updateDisabled(true)
        if (props.clickHandler) {
            const res = await props.clickHandler(e)
            if (!props.hasRedirect || !res) {
                updateDisabled(false)
            }
        } else {
            updateDisabled(false)
        }
    }

    let buttonStyle
    switch (props.type) {
        case 'primary':
            buttonStyle =
                'bg-default-900 text-default-100 h-12 text-base px-7 sm:h-14 gap-4 sm:text-xl'
            break
        case 'secondary':
            buttonStyle =
                'bg-default-100 text-default-900 shadow-3xl h-12 text-base px-7 sm:h-14 gap-4 sm:text-xl'
            break
        case 'primary-md':
            buttonStyle =
                'bg-default-900 text-xs text-default-100 h-8 px-3 my-2 mx-2 gap-2 float-right sm:px-6 sm:mx-5 sm:h-10 sm:text-base sm:gap-3'
            break
        case 'secondary-md':
            buttonStyle =
                'bg-default-100 text-default-900 text-sm shadow-box h-8 px-3 my-2 mx-2 float-right gap-2 sm:px-6 sm:mx-5 sm:h-10 sm:text-base sm:gap-3'
            break
        case 'tertiary':
            break
        default:
            buttonStyle = ''
    }
    return (
        <>
            {props.link ? (
                <Link
                    href={{
                        pathname: props.path,
                        query: props.query,
                    }}
                    as={props.as}
                >
                    <a
                        className={`tracking-widest rounded-md flex items-center justify-center font-bold ${buttonStyle} ${
                            disabled ? 'opacity-50 cursor-default' : ''
                        }`}
                    >
                        <Image
                            className={
                                ['secondary', 'secondary-md'].includes(
                                    props.type
                                )
                                    ? 'invert'
                                    : null
                            }
                            src={props.img}
                            width={`${
                                ['primary-md', 'secondary-md'].includes(
                                    props.type
                                )
                                    ? '24'
                                    : '28'
                            }`}
                            height={`${
                                ['primary-md', 'secondary-md'].includes(
                                    props.type
                                )
                                    ? '24'
                                    : '28'
                            }`}
                        />
                        {props.children}
                    </a>
                </Link>
            ) : (
                <button
                    className={`tracking-widest rounded-md flex items-center font-bold ${buttonStyle} ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } ${props.className}`}
                    onClick={disabled ? null : handleClick}
                    disabled={disabled}
                >
                    {props.img && (
                        <div
                            className={`flex justify-center ${
                                ['primary-md', 'secondary-md'].includes(
                                    props.type
                                )
                                    ? 'w-[16px] sm:w-[24px]'
                                    : 'w-[28px] sm:w-[28px]'
                            }`}
                        >
                            <Image
                                className={
                                    ['secondary', 'secondary-md'].includes(
                                        props.type
                                    ) && !props.uninvertImg
                                        ? 'invert'
                                        : null
                                }
                                src={props.img}
                                width={`${
                                    ['primary-md', 'secondary-md'].includes(
                                        props.type
                                    )
                                        ? '24'
                                        : '28'
                                }`}
                                height={`${
                                    ['primary-md', 'secondary-md'].includes(
                                        props.type
                                    )
                                        ? '24'
                                        : '28'
                                }`}
                            />
                        </div>
                    )}
                    {props.children}
                </button>
            )}
        </>
    )
}
