import { useEffect, useState } from "react";
import { IDispatcher } from "../dispatcher/IDispatcher";

type DispatcherUnsubscribe = () => void;
type IDispatcherProperties<T> = keyof T;

export function useWatch<T extends IDispatcher, V>(dispatcher:T, property:IDispatcherProperties<T>|any, defaultValue?:V, updateName?:any) :[V, ()=>void]  {
    console.log('useWatch', dispatcher, property, defaultValue, updateName)
    let unsubscribe:DispatcherUnsubscribe|undefined
    const [value, setValue] = useState<V>(((dispatcher as any)?.[property] || defaultValue) as V)
    useEffect(()=>{
        unsubscribe = dispatcher?.addListener(updateName || property, (now, old)=>{
            setValue(now)
        })
        return unwatch
    }, [dispatcher, property, updateName])

    function unwatch(){
        unsubscribe?.()
        unsubscribe = undefined
    }
    return [value, unwatch]
}