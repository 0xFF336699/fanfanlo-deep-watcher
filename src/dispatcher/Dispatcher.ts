import _ from 'lodash';
import { DispatcherUnsubscribe, DomainType, EventType, IDispatcher, IDispatcherListenType, IHandler, dipspatcherPreventDefault, dipspatcherStopPropagation } from './IDispatcher';

interface IHandlerData{
    type?:EventType
    handler?:IHandler
    weak?:WeakRef<IHandler>
    once?:boolean
    domain?:any
}

interface IHandlerDataFindResult{
    type:EventType
    handlers?:IHandlerData[]
    index:number
    handlerData?:IHandlerData
}
type IHandlerDataMap = Map<EventType, IHandlerData[]>

let count = 0
export class Dispatcher implements IDispatcher {
    // private ____dispatcher_index = count++
  private handlerMap: IHandlerDataMap = new Map()

  private findHandlersByDomain(type:EventType, domain?:DomainType):IHandlerData[]{
    const handlers = this.handlerMap.get(type)
    if(!handlers) return []
    return handlers.filter(h=>h.domain === domain)
  }
  private getHandler(type:EventType, handler:IHandler):IHandlerDataFindResult{
    const res:IHandlerDataFindResult = {type,index:-1}
    const handlers = this.handlerMap.get(type)
    if(!handlers) return res
    res.handlers = handlers
    res.index = handlers.findIndex(h=>h.handler === handler || h.weak?.deref() === handler)
    if(res.index > -1){
        res.handlerData = handlers[res.index]
    }
    return res
  }
  private addHandler(type:EventType, handler:IHandler, once:boolean, index?:number, weak?:boolean, domain?:DomainType){
    const findResult = this.getHandler(type, handler)
    if(findResult.index > -1){
        if(findResult.handlerData){
            findResult.handlerData.once = once
            findResult.handlerData.domain = domain
            if(weak && !findResult.handlerData.weak?.deref()){
                findResult.handlerData.weak = new WeakRef(handler)
            }else{
                findResult.handlerData.handler = handler
            }
            if(index !== undefined){
                findResult.handlers?.splice(findResult.index, 1)
                findResult.handlers?.splice(index, 0, findResult.handlerData)
            }
            return
        }
    } 
    const handlerData:IHandlerData = {handler,once,domain,type}
    if(weak){
        handlerData.weak = new WeakRef(handler)
    }else{
        handlerData.handler = handler
    }
    let handlers = this.handlerMap.get(type)
    if(!handlers) {
        handlers = []
        this.handlerMap.set(type, handlers)
    }
    const i = _.isNumber(index) ? index : handlers.length
    handlers.splice(i, 0, handlerData)
  }

  private removeHandler(type:EventType, handler:IHandler):boolean{
    const findResult = this.getHandler(type, handler)
    if(findResult.index === -1) return false
    findResult.handlers?.splice(findResult.index, 1)
    return true
  }

  removeAllListeners(): void {
    this.handlerMap.clear();
  }
  addDomainListener<T>(domain: unknown, type: IDispatcherListenType<T>, handler: IHandler, index?: number, weak?:boolean): DispatcherUnsubscribe {
    this.addHandler(type, handler, false, index, !!weak, domain)
    return ()=>{
        this.removeListener(type, handler)
    }
  }

  addDomainOnceListener<T>(domain: any, type: IDispatcherListenType<T>, handler: IHandler, index?: number, weak?:boolean): DispatcherUnsubscribe {
    this.addHandler(type, handler, true, index, !!weak, domain)
    return ()=>{
        this.removeListener(type, handler)
    }
  }

  addListener<T>(type: IDispatcherListenType<T>, handler: IHandler, index?: number, weak?:boolean): DispatcherUnsubscribe {
    if (type === '') {
      try {
        throw new Error('addDomainEventListener error no type');
      } catch (e) {
        console.log('EventDispatcher2', 'addDomainEventListener', 'err', type, e);
      }
    }
    if (typeof handler != 'function') {
      try {
        throw new Error('addDomainEventListener error no cb');
      } catch (e) {
        console.log('EventDispatcher2', 'addDomainEventListener', 'err', handler, e);
      }
    }
    this.addHandler(type, handler, false, index, !!weak, undefined)
    return () => {
      this.removeListener(type, handler);
    };
  }
  on<T>(type: IDispatcherListenType<T>, handler: IHandler, index?: number, weak?:boolean): DispatcherUnsubscribe{
    return this.addListener(type, handler, index, weak)
  }
  addOnceListener<T>(type: IDispatcherListenType<T>, handler: IHandler, index?: number, weak?:boolean): DispatcherUnsubscribe {
    this.addHandler(type, handler, true, index, weak, undefined)
    return () => {
        this.removeListener(type, handler)
    }
  }

  dispatch<T>(type: IDispatcherListenType<T>, ...rest: any[]): boolean|any {
    const handlers = this.handlerMap.get(type)
    if(!handlers) return false
    const unloads:IHandlerData[] = []
    let blockPreventDefault = false
    for(const handler of handlers){
        const h = handler.handler || handler.weak?.deref()
        if(h){
            // const res = h(...rest);
            const res = h.apply(null, rest);
            if(handler.once){
                unloads.push(handler)
            }
            if(res === dipspatcherPreventDefault){
                blockPreventDefault = true
            }
            if(res === dipspatcherStopPropagation){
                break
            }
        }else{
            unloads.push(handler)
        }
    }
    for(const handlerData of unloads){
        const index = handlers.indexOf(handlerData)
        if(index > -1){
            handlers.splice(index, 1)
        }
    }
    return blockPreventDefault ? dipspatcherPreventDefault : true
  }

  emit<T>(type: IDispatcherListenType<T>, ...rest: any[]): boolean|any {
    return this.dispatch(type, ...rest)
  }

  removeDomain(domain: any): boolean {
    const handlers = this.findHandlersByDomain(domain)
    if(handlers.length === 0) return false
    
    for(const handler of handlers){
        if(handler.handler){
            this.removeHandler(handler.type, handler.handler)
        }
    }
    return true
  }

  removeListener<T>(type: IDispatcherListenType<T>, handler: IHandler): boolean {
    return this.removeHandler(type, handler)
  }
  off<T>(type: IDispatcherListenType<T>, handler: IHandler): boolean {
    return this.removeListener(type, handler)
  }
  willTrigger<T>(type: IDispatcherListenType<T>): boolean {
    return this.handlerMap.has(type)
  }
}
