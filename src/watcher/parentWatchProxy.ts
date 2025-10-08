
import { getParentProxyTarget, isParent, toParent } from "./parentProxy"
import { proxyUtils } from "./proxyUtils"
import { getProxyObject, isProxy, toProxy } from "./proxyWatch"
export function toParentWatchProxy(target:object){
    return toParent(toProxy(target))
}

export function getProxyTarget<T extends object>(target:T):T{
    let parentObject = isParent(target) ? getParentProxyTarget(target) : target
    // console.log('parent object 1111', parentObject)
    const proxyObject = getProxyObject(parentObject).target
    // console.log('proxy object 0000', proxyObject)
    parentObject = isParent(proxyObject) ? getParentProxyTarget(proxyObject) : proxyObject
    // console.log('parent object 2222', parentObject)
    return parentObject
}

export function getTarget<T extends object>(target:T){
    proxyUtils.pauseProxy()
    let t = target
    let c = 0
    while(t && isProxy(t)){
        c++
        if(c > 5)break;
        // console.log('is parent', objectCountUtils.getObjectCount(t), !!isParent(t))
        // console.log('is proxy object', objectCountUtils.getObjectCount(t), !!isProxy(t))
        // if(isParent(t))t = isParent(t)?.target
        if(isProxy(t))t = isProxy(t)?.target
        // console.log('t', objectCountUtils.getObjectCount(t), Object.keys(t), t)
    }
    // console.log('ttttttttttttt', objectCountUtils.getObjectCount(t), t)
    proxyUtils.resumeProxy()
    return t
}
