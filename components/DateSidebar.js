import { DATE_RANGES } from '../utils/constants'

export default function DateSidebar(props) {
    const dates = ['All', ...Object.keys(DATE_RANGES), 'Corporate']

    return (
        <div className="absolute top-0 left-0 px-3 w-full h-20 md:px-0 md:h-full md:w-28 flex flex-row justify-center md:flex-col">
            <div className="flex flex-row items-center justify-around w-full h-full my-20 rounded-tr-md rounded-br-md bg-default-100 shadow-3xl md:flex-col md:my-36">
                {dates.map((date) => {
                    return (
                        <a
                            key={date}
                            className="cursor-pointer py-6 w-full flex justify-center md:flex-col md:items-center relative"
                            onClick={() => {
                                props.changeDate(date)
                            }}
                        >
                            <h3
                                className={`${
                                    props.activeDate == date
                                        ? 'text-default-100'
                                        : 'text-default-900'
                                } font-bold text-sm text-center pb-1 z-10 ${date === 'Corporate' ? 'sm:text-xl' : 'sm:text-3xl '}`}
                            >
                                {date}
                            </h3>
                            {props.activeDate == date ? (
                                <div className="bg-default-900 w-full h-12 absolute bottom-3 sm:bottom-5 rounded-md left-0 md:rounded-l-none"></div>
                            ) : (
                                <div className="bg-slate-300 w-10 md:w-20 h-px absolute bottom-3"></div>
                            )}
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
