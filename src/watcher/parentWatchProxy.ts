
import { getParentProxyTarget, isParent, toParent } from "./parentProxy"
import { proxyUtils } from "./proxyUtils"
import { getProxyObject, isProxy, toProxy } from "./proxyWatch"
export function toParentWatchProxy(target:object){
    return toParent(toProxy(target))
}

export function getProxyTarget<T extends object>(target:T):T{
    let parentObject = isParent(target) ? getParentProxyTarget(target) : target
    const proxyObject = getProxyObject(parentObject).target
    parentObject = isParent(proxyObject) ? getParentProxyTarget(proxyObject) : proxyObject
    return parentObject
}

export function getTarget<T extends object>(target:T){
    proxyUtils.pauseProxy()
    let t = target
    let c = 0
    while(t && isProxy(t)){
        c++
        if(c > 5)break;
        if(isProxy(t))t = isProxy(t)?.target
    }
    proxyUtils.resumeProxy()
    return t
}
