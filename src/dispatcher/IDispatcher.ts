
// dispatch事件时可以阻止事件的默认行为
export const dipspatcherPreventDefault:Record<any, any> = {}
export function clearDispatcherPreventDefault(){
 for(const key in dipspatcherPreventDefault){
    delete dipspatcherPreventDefault[key]
 }   
}
// dispatch事件时可以阻止事件循环中之后队列的执行
export const dipspatcherStopPropagation = {}
export interface IDispatchEvent<DATA extends any = any, RESULT extends any = any, EXTRA extends any = any, DISPATCHERPROPERTIES extends any = any>{
    type?:IDispatcerType<DISPATCHERPROPERTIES>
    data?:DATA
    result?:RESULT
    extra?:EXTRA
    stoped?:boolean
}
export type IDispacherHandlerResult = void | any
// return的any如果是dispacherPreventDefault或者dispacherStopPropagation，则表示阻止事件的默认行为或者阻止事件的冒泡，返回其它则不做处理
export type IHandler = ((...args:any[])=>IDispacherHandlerResult) | (()=>IDispacherHandlerResult)

export type IDispatcherProperties<T> = {
    [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

export type IDispatcherFuns<T> = {
    [K in keyof T]: T[K] extends Function ? K : never
}[keyof T];


export type IDispatcerType<T> = IDispatcherProperties<T> | IDispatcherFuns<T> | any
export type IDispatcherEventMap = Map<any, IHandler>

export type DomainType = any
export type EventType = any
export type DispatcherUnsubscribe = ()=>void
// export type IDispatcherListenType<T> = T extends IDispatcher ? IDispatcherProperties<T>:any
export type IDispatcherListenType<T> = T extends IDispatcherEventMap ? IDispatcherFuns<T> : T extends IDispatcher ? IDispatcherProperties<T>:any

class DispatchEvent<DATA extends any, RESULT extends any, EXTRA extends any, DISPATCHERPROPERTIES extends any> implements IDispatchEvent<DATA, RESULT, EXTRA, DISPATCHERPROPERTIES>{
    data?:DATA
    result?:RESULT
    extra?:EXTRA
    type?:IDispatcerType<DISPATCHERPROPERTIES>
    stoped?:boolean = false
    constructor(data?:DATA, result?:RESULT,  extra?:EXTRA, type?:IDispatcerType<DISPATCHERPROPERTIES>){
        this.data = data
        this.result = result
        this.extra = extra
        this.type = type
    }
}
export function createDispatchEvent<DATA extends any, RESULT extends any, EXTRA extends any, DISPATCHERPROPERTIES extends any>(data?:DATA, result?:RESULT, extra?:EXTRA, type?:IDispatcerType<DISPATCHERPROPERTIES>):IDispatchEvent<DATA, RESULT, EXTRA, DISPATCHERPROPERTIES>{
    return new DispatchEvent<DATA, RESULT, EXTRA, DISPATCHERPROPERTIES>(data, result, extra, type)
}
export interface IDispatcher{

    addOnceListener<T>(type:IDispatcherListenType<T>, handler:IHandler, index?:number, weak?:boolean):DispatcherUnsubscribe;

    addListener<T>(type:IDispatcherListenType<T>, handler:IHandler, index?:number, weak?:boolean):DispatcherUnsubscribe;
    on<T>(type:IDispatcherListenType<T>, handler:IHandler, index?:number, weak?:boolean):DispatcherUnsubscribe;

    removeListener<T>(type:IDispatcherListenType<T>, handler:IHandler):boolean;
    off<T>(type:IDispatcherListenType<T>, handler:IHandler):boolean;

    addDomainListener<T>(domain:any, type:IDispatcherListenType<T>, handler:IHandler, index?:number, weak?:boolean):DispatcherUnsubscribe;

    addDomainOnceListener<T>(domain:any, type:IDispatcherListenType<T>, handler:IHandler, index?:number, weak?:boolean):DispatcherUnsubscribe;

    removeDomain(domain:any):boolean;

    // return的any如果是dispacherPreventDefault，则表示阻止事件的默认行为。return true则表示派发事件完成。注意 这个方式跟传统EventDispatcher利用event对象来让各方获知是否阻止默认行为以及冒泡不同，不排除以后会增加event对象到rest里来实现。
    dispatch<T>(type:IDispatcherListenType<T>, ...rest:any[]):boolean|any;
    emit<T>(type:IDispatcherListenType<T>, ...rest:any[]):boolean|any;

    willTrigger<T>(type:IDispatcherListenType<T>):boolean;

    removeAllListeners():void;
}