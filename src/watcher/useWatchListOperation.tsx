import { useEffect, useState } from "react"
import { getProxyDispatcher } from "."
import { listenAnyWildcard } from "../dispatcher/throttle"

export function useWatchListOperation<T>(target:T[]):[T[], ()=>void]{
    const [list, setList] = useState<T[]>([...target])
    const unsub = getProxyDispatcher(target).addListener(listenAnyWildcard, ()=>{
        setList([...target])
    })
    useEffect(()=>{
        return ()=>{
            unsub()
        }
    }, [])
    return [list, unsub]
}
