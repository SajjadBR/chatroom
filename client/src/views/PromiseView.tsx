import { useState } from "react"

type PromiseViewProps = {
    promise:Promise<any>,
    children?:React.ReactNode,
    Result:((props:{data:any}) => JSX.Element),
}


export default function PromiseView({promise,children,Result}:PromiseViewProps) {
    const [error,setError] = useState<any>();
    const [data,setData] = useState<any>();
    promise.then(res => {
        setData(res);
    }).catch(reason => {
        setError(reason);
    });
    return (
        <>
        {!data && !error && children }
        {data && <Result data={data} /> }
        {error && <h2>{error.message}</h2>}
        </>
    )
}
