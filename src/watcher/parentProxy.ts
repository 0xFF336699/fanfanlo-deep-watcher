import _ from "lodash"
import { listenAnyWildcard } from "../dispatcher"
import { proxyUtils } from "./proxyUtils"
import { getProxyObject, IProxyObject, toProxy, getProxyWatchRealTarget } from "./proxyWatch"
interface IParentProxyInfo<T>{
    parent?:any
    target:T
    watchProxy:IProxyObject<T>
    unwatch?:()=>void
}
interface IParentProxyOptions{

}
const objectMap = new WeakMap<object, IParentProxyInfo<any>>()

function getParentProxyObject(parent:object, options?:IParentProxyOptions){
    proxyUtils.pauseProxy()
    const target = getProxyWatchRealTarget(parent)
    // 是否需要脱壳得持续观察一下需求
    let proxyObject = (objectMap.get(target)) as IParentProxyInfo<any>
    if(!proxyObject){
        const watchProxy = getProxyObject(parent)
        proxyObject = {target, watchProxy:watchProxy} as IParentProxyInfo<any>
        const unsub = watchProxy.dispatcher.addListener(listenAnyWildcard, (prop, value, old, target)=>{
            if(_.isObject(old)){
                const oldProxyObject = objectMap.get(old)
                if(oldProxyObject){
                    oldProxyObject.parent = undefined
                    oldProxyObject.unwatch?.()
                    oldProxyObject.unwatch = undefined
                }
            }
            if(_.isObject(value)){
                const newProxyObject = getParentProxyObject(value, options)
                newProxyObject.parent = target
            }
        })
        proxyObject.unwatch = unsub
        objectMap.set(target, proxyObject)
    }
    loopChildren(target, options)
    proxyUtils.resumeProxy()
    return proxyObject
}

function loopChildren(parent:object, options?:IParentProxyOptions){
    for(const key in parent){
        const child = (parent as any)[key]
        if(!_.isObject(child))continue;
        const info = getParentProxyObject(child, options)
        info.parent = parent
    }
}
export function destroyParentProxy(parent:object){
    if(!_.isObject(parent))throw new Error('target must be an object')
    const info = getParentProxyObject(parent)
    info.parent = undefined
    objectMap.delete(parent)
    for(const key in parent){
        const child = (parent as any)[key]
        if(!_.isObject(child))continue;
        destroyParentProxy(child)
    }
}
export function isParent(parent:object){
    return objectMap.get(parent)
}
export function toParent(target:object){
    return getParentProxyObject(target).watchProxy.proxy
}

export function getParentProxyInfo(target:object){
    return getParentProxyObject(target)
}

export function getParentProxyTarget(target:object){
    return getParentProxyObject(target).target
}

export function getParent<T>(target:object):T | undefined{
    return getParentProxyObject(target).parent as T | undefined
}
export function getParentWatchProxy<T>(target:object):T{
    const parent = getParentProxyObject(target).parent
    if(!parent)throw new Error('parent is undefined')
    return toProxy(parent) as T
}
