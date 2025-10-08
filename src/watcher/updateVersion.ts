import { listenAnyWildcard } from "../dispatcher"
import { getProxyDispatcher, toProxy } from "./proxyWatch"
let count = 0
export interface IUpdateVersion{
    // 它来自于全局count，所以这个数值最终是全局唯一的
    version:number
    // 这是当前这个对象更新过的次数
    count:number
    // 最终组合的key，用于唯一标识
    key:string
}
const map = new WeakMap<object, IUpdateVersion>()
/**
 * @prefix 如果有用于调试等的需求，可以用prefix作为识别，但是一般来说用不上.
 */
export function getUpdateVersion<T extends object>(data:T, prefix:string = ''):IUpdateVersion{
    let version = map.get(data) || toProxy({
        version:++count,
        count:0,
        key:`${prefix}${count}-0`
    })
    if(!map.has(data)){
        map.set(data, version)
        const dispatcher = getProxyDispatcher(data)
        dispatcher.addListener(listenAnyWildcard, (now, old)=>{
            version.count++
            version.version = ++count
            // 特定前缀+全局唯一数值+该对象更新次数
            version.key = `${prefix}${version.version}-${version.count}`
        })
    }
    return version
}

export function getUpdateVersionKey<T extends object>(data:T):string{
    return getUpdateVersion(data).key
}


