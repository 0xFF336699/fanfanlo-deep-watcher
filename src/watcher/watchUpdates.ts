import _ from "lodash"
import { listenAnyWildcard, multiUpdatedDispatchWildcard } from "../dispatcher"
import { getProxyObject } from "./proxyWatch"

export type IWatchUpdatesKeys<T extends object> = typeof listenAnyWildcard | typeof multiUpdatedDispatchWildcard | (keyof T)[]

export interface IWatchUpdatesConfig<T extends object>{
    keys?:IWatchUpdatesKeys<T>
    properties?:{
        [K in keyof T]?:IP<T[K]>
    }
}

export type IP <T> = T extends (infer U)[] ? IP<U> : T extends object ? IWatchUpdatesConfig<T>:never

export interface IWatchUpdatePropertyInfo<T extends object>{
    target:T
    key:any
    oldValue:any
    newValue:any
    // 侦听的链，a.b.c.d，当d变化时，watchChain是[b,c,d]
    watchChain:string[]
}

type UnsubscriptMap = Map<any, ()=>void>

export type OnUpdate = (info:IWatchUpdatePropertyInfo<object>)=>void

export function watchUpdates<T extends object, U>(target: T, onUpdate:OnUpdate, conf?:IWatchUpdatesConfig<T>,watchChain?:string[]):()=>void{
    watchChain = watchChain || []
    const unsubMap:UnsubscriptMap = new Map()
    const {dispatcher} = getProxyObject(target)
    const unsub = dispatcher.addListener(listenAnyWildcard, createOnUpdateFn(target, onUpdate, unsubMap, [...watchChain], conf))
    unsubMap.set(target, unsub);
    for(const key in target){
        const value = target[key]
        if(!_.isObject(value) || !checkIsInWatch(key, target, conf))continue
        const subConf = _.isArray(target) ? conf : conf?.properties?.[key]
        listenSubKey(target, key, unsubMap, onUpdate, [...watchChain, key], subConf as IWatchUpdatesConfig<any>)
    }
    return ()=>{
        unsubMap.forEach((unsub, target)=>unsub())
    }
}

function createOnUpdateFn<T extends object>(target:T, onUpdate:OnUpdate, unsubMap:UnsubscriptMap, watchChain:string[], conf?:IWatchUpdatesConfig<T>){
    return (prop:any, now:T[keyof T], old:T[keyof T])=>{
        // console.log('ttttttttttttt arget=', target, 'prop=', prop, 'now=', now, 'old=', old)
        if(!checkIsInWatch(prop, target, conf))return
        if(_.isObject(old)){
            unsubMap.get(old)?.()
            unsubMap.delete(old)
        }
        onUpdate({target, key:prop, oldValue:old, newValue:now, watchChain:[...watchChain, prop]})
        const subConf = _.isArray(target) ? conf : conf?.properties?.[prop as keyof T]
        listenSubKey(target, prop, unsubMap, onUpdate, [prop, ...watchChain], subConf as IWatchUpdatesConfig<any>)
    }
}

function checkIsInWatch(prop:any, target:any, conf?:IWatchUpdatesConfig<any>){
    return !conf || conf.keys === listenAnyWildcard || (_.isArray(conf.keys) && conf.keys.includes(prop)) || (conf.properties && (prop in conf.properties)) || _.isArray(target)
}

function listenSubKey<T extends object, U extends object>(target:T, key:any, unsubMap:UnsubscriptMap, onUpdate:OnUpdate, watchChain:string[], property?:IWatchUpdatesConfig<U>){
    const u = (target as any)[key] as U
    if(!u)return;
    if(!_.isObject(u))return
    const unsub = watchUpdates(u, onUpdate, property, [...watchChain])
    unsubMap.set(u, unsub)

}