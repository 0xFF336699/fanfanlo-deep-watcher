import _ from "lodash"
import { useEffect, useState } from "react"
import { PropertiesChain } from "./proxyWatch"
import { useProxyWatch } from "./useProxyWatch"
import { IWatchUpdatesConfig, watchUpdates } from "./watchUpdates"

/**
 * 
 * 注意，返回的无论是object还是array，都无法监听，因为它们不是proxy，而是原始对象的副本
 * @param target 要监听的对象
 * @param conf 监听配置
 * @returns 监听的对象
 */
export function useWatchUpdates<T extends object>(target: T, conf?: IWatchUpdatesConfig<T>): [T] {
    const [value, setValue] = useState<T>(target)
    useEffect(() => {
        watchUpdates(target, (info) => {
            setValue((_.isArray(target) ? [...target] : { ...target }) as T)
        }, conf)
    }, [])
    return [value as T]
}

/**
 * useProxyWatch + useWatchUpdates 结合体
 * 因为react的刷新机制，所以第二个state必须得用setState才会生效。
 * 不然其实这是两行代码，第一行是useProxyWatch，第二行是useWatchUpdates就可以了。
 * @param target 要监听的对象
 * @param propertyChain 要监听的属性链
 * @param defaultValue 默认值
 * @param conf 监听配置
 * @returns 监听的对象 返回的第一个参数是重新拼装的{...arr} or {...obj}，第二个参数是原始的target or defaultValue
 */
export function useProxyWatchUpdates<T extends object, U extends object>(target: T,
    propertyChain: PropertiesChain<T>,
    defaultValue: U,
    conf?: IWatchUpdatesConfig<U>): [U, U] {
    const [v] = useProxyWatch(target, propertyChain, defaultValue)
    const [value, setValue] = useState<U>(v);
    useEffect(() => {
        const newValue = _.isArray(v)
            ? [...v]
            : Object.assign({}, v);

        setValue(newValue as U);
        if(!v){
            return;
        }
        return watchUpdates(v, (info) => {
            const newValue = _.isArray(v)
                ? [...v]
                : Object.assign({}, v);

            setValue(newValue as U);
        }, conf)
    }, [v])
    return [value, v]
}

