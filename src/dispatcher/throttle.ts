import { IDispatcher } from "."

interface IPropertyChangeData{
    prop:any
    now:any
    old:any
}
export const listenAnyWildcard = "*"
export const multiUpdatedDispatchWildcard = "**"
/**
 * 创建一个节流器，它能够在属性变更时创建一个用Promise包装后能够在本次事件循环的末尾执行的节流器
 * @param dispatcher 事件派发器
 * @param listenWildcard 监听通配符，当对象的属性变更时，会派发事件通知侦听函数该属性已经变更。
 * @param dispatchWildcard 派发通配符，如被侦听对象有1-n个属性变更，则本次事件循环的末尾会派发事件通知侦听函数本次变更的属性。
 * @returns 
 */



export function createThrottle(dispatcher:IDispatcher, listenWildcard:string = listenAnyWildcard, dispatchWildcard:string = multiUpdatedDispatchWildcard){
    let isUpdating = false
    let changeList:IPropertyChangeData[] = []
    let p:Promise<any>|null = null
    function handler(prop:any, now:any, old:any){
        if(isUpdating){
            console.warn("throttle handler is updating, skip", `prop=${prop}, now=${now}, old=${old}`)
            console.dir(dispatcher, {depth:10})
            return;
        }
        changeList.push({prop, now, old})
        trottle()
    }


    function trottle(){
        if(p)return;
        p = Promise.resolve().then(()=>{
            dispatch()
        })
    }
    function dispatch(){
        isUpdating = true
        dispatcher.dispatch(dispatchWildcard, changeList)
        changeList = []
        isUpdating = false
        p = null
    }
    return dispatcher.addListener(listenWildcard, handler)
}