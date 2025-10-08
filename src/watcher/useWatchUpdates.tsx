import _ from "lodash"
import { useEffect, useState } from "react"
import { IWatchUpdatesConfig, watchUpdates } from "./watchUpdates"
import { PropertiesChain, toProxy } from "./proxyWatch"
import { useProxyWatch } from "./useProxyWatch"
// import { objectCountUtils } from '../utils';
import { useWatch } from "./useWatch"
// import { Log } from '../log';

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
                // console.log('use watch updates look look id', objectCountUtils.getObjectCount(target))
        watchUpdates(target, (info) => {
            console.log('uuuuuuuuuupdated', info)
            console.log('tttttttarget=', target);
            const now = _.isArray(info.target) ? [...info.target] : info.target
            // setValue(now as T)
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
                const logger = { pause: false, log: (...args: any[]) => {} };
        logger.pause = true;
    const [v] = useProxyWatch(target, propertyChain, defaultValue)
    const [value, setValue] = useState<U>(v);
    logger.log(`propertyChain=`, propertyChain);
    logger.log(`value=`, value);
    logger.log('v=', v);
    logger.log('defaultValue=', defaultValue)
    useEffect(() => {
        logger.log(`useEffect_fn v=`, v)
        const newValue = _.isArray(v)
            ? [...v]
            : Object.assign({}, v);

        setValue(newValue as U);
        if(!v){
            console.log('target=', target)
            console.log('propertyChain=', propertyChain)
            console.log('defaultValue=', defaultValue)
            console.log('conf=', conf)
            console.trace('v is null')
            return;
        }
        return watchUpdates(v, (info) => {
            logger.log('watchUpdates_fn', 'info=', info)
            // setValue((_.isArray(v) ? [...v ] : {...v}) as U)
            // 使用 Object.assign 来避免循环引用
            const newValue = _.isArray(v)
                ? [...v]
                : Object.assign({}, v);

            setValue(newValue as U);
        }, conf)
    }, [v])
    return [value, v]
}

