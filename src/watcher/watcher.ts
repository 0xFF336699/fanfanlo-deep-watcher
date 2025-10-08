import { DispatcherUnsubscribe, IDispatcher, IDispatcherProperties } from "../dispatcher";

export interface IWatchResult<V>{
    unsubscribe:DispatcherUnsubscribe
    value:V
}
export function watchProperty<T extends IDispatcher, K extends IDispatcherProperties<T>>(dispatcher:T, property:K|any, f:(v:T[K], old:T[K])=>void, immediately:boolean = true){
    return watchPropertyByUpdateType(dispatcher, property, f, property, immediately)
}

// 监听属性变化
// 注意，这里的V类型应该允许undefined null等
export function watchPropertyByUpdateType<T extends IDispatcher, V>(dispatcher:T, property:any, f:(v:V, old:V)=>void, updateName:any, immediately:boolean = true):IWatchResult<V>{
    if(immediately){
        f((dispatcher as any)[property], undefined as V)
    }
    return {unsubscribe:dispatcher.addListener(updateName, f), value:(dispatcher as any)[property]}
}




