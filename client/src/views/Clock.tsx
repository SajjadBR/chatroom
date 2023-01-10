import React, { useEffect, useState } from "react";

export default function Clock() {
    const [date, setDate] = useState(() => new Date())

    useEffect(() => {
        const timerId = setInterval(() => {
            setDate(new Date());
        }, 1000)

        return () => clearInterval(timerId);
    }, [])

    return(
    <span className="Clock">
        {date.toLocaleTimeString()}
    </span>
    )
}