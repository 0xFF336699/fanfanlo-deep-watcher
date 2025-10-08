import _ from 'lodash';
import { createThrottle, Dispatcher, DispatcherUnsubscribe, IDispatcher, listenAnyWildcard } from '../dispatcher';
// import { Log } from '../log';
// import { objectCountUtils } from '../utils';
import { proxyUtils } from './proxyUtils';

// 设计目的是通过代理能够进行拦截的特性，利用这个特性来派发事件，从而实现对对象的监听。

// 它还有个附加功能，就是可以深度侦听还未创建的属性


// console.trace('proxywatch initialize')

const proxyWatchSymbolKey = Symbol('proxyWatch');
const proxyWatchOriginTargetKey = Symbol('proxyWatchOriginTarget');
// 用于生成数组索引的类型
type ArrayIndices = 'length'| '0' | '1' | '2';


// 递归构建属性链
// export type PropertiesChain<T> = T extends (infer U)[]
//   ? ArrayIndices | `${ArrayIndices}.${PropertiesChain<U>}`
//   : T extends object
//     ? {
//         [K in keyof T]: K extends string ? `${K}` | `${K}.${PropertiesChain<T[K]>}` : never;
//       }[keyof T]
//     : never;
export type PropertiesChainBase<T> = T extends (infer U)[]
  ? ArrayIndices | `${ArrayIndices}.${PropertiesChainBase<U>}`
  : T extends object
    ? {
        [K in keyof T]: K extends string ? `${K}` | `${K}.${PropertiesChainBase<T[K]>}` : never;
      }[keyof T]
    : never;
export type PropertiesChain<T> = PropertiesChainBase<T> | string[];
// 监听属性更新
type OnUpdate<V> = (now: V, old?: V) => void;

// 代理对象
export interface IProxyObject<T> {
  // 原始对象
  target: T;
  // 代理对象
  proxy: T;
  // 事件派发器
  dispatcher: IDispatcher;
  throttleUnsubscribe: DispatcherUnsubscribe;
  targetId: number;
  proxyId: number;
}
export type UnWatch = () => void;
interface IWatchResult<T, U> {
  unwatch: UnWatch;
  value?: U;
}

interface IOnUndefinedInfo {
  prop: string;
  propertyChain: string| string[];
  nextChain: string | string[];
  //key可能存在也可能不存在，但是值为undefined
  noChildNode: boolean;
  // key不存在，可能是动态添加的key，或者是class对象没有初始化key
  noPropertyKey: boolean;
  // 值为undefined。可能key不存在，或者上级节点不存在，或者该属性被赋值为undefined。
  // 注意，null被视为赋值了，所以不会触发执行OnUndefined函数
  noValue: boolean;
}

type OnUndefined = (info: IOnUndefinedInfo) => void;

export const proxyArrayUpdateEvent = 'proxyArrayUpdate';
const objectMap = new WeakMap<object, IProxyObject<any>>();
const proxyMap = new WeakMap<object, IProxyObject<any>>();
export const ProxyArrayStringTag = 'ProxyArray';
/**
 * 数组代理对象
 * forEach等方法不会调用get来循环数组，所以遇到这种循环时需要在循环体中用toProxy(arr)[index]来访问被访问的元素才能在更改时触发array响应变更的事件。
 * 关于为什么forEach等方法不会调用get来循环数组还不知道
 * @param target
 * @param dispatcher
 * @returns
 */

function arrayHandler<T extends Array<any>>(target: T, dispatcher: IDispatcher) {
  // const originalTarget = getProxyTarget(target)
  // (target as any)[Symbol.toStringTag] = ProxyArrayStringTag
  const t = target as Array<any>;
  // 检查处理可能变更的数据
  function dispatchChange(start: number, end: number, oldTarget: Array<any>) {
    const updated: Array<{ now: any; old: any; index: number }> = [];
    for (let i = start; i < end; i++) {
      const now = t[i];
      const old = oldTarget[i];
      if (now === old) continue;
      updated.push({ now, old, index: i });
      dispatcher.dispatch(i.toString(), now, old, i, target, oldTarget);
      dispatcher.dispatch(listenAnyWildcard, i, now, old, target, oldTarget);
    }
    dispatcher.dispatch(proxyArrayUpdateEvent, updated, target, oldTarget);
  }

  const handler: ProxyHandler<T> = {
    deleteProperty(target, prop) {
      if (!(prop in target)) return false;
      const old = (target as any)[prop];
      const bl = Reflect.deleteProperty(target, prop);
      if (bl && old !== undefined) {
        // delete后派发事件
        dispatcher.dispatch(prop.toString(), undefined, old);
      }
      return bl;
    },
    get(target, prop, receiver) {
      if (prop === proxyWatchOriginTargetKey) {
        console.log('get proxyWatchOriginTargetKey array called', target);
        return target;
      }
      switch (prop) {
        case 'push':
        case 'unshift':
        case 'fill':
        case 'copyWithin':
        case 'pop':
        case 'shift':
        case 'splice':
        case 'sort':
        case 'reverse':
          return function (...args: any[]) {
            const as = unshellProxies(args)
            const oldTarget = [...(target as Array<any>)];
            const res = (target as any)[prop](...as);
            const len = Math.max(oldTarget.length, t.length);
            dispatchChange(0, len, oldTarget);
            if(oldTarget.length != target.length){
              dispatcher.dispatch('length', target.length, oldTarget.length);
            }
            return res;
          };
        default:
          let v = Reflect.get(target, prop, receiver);

          if (typeof v === 'function') {
            // v = (v as any).bind(proxyUtils.isPauseProxy ? toProxy(target) : target);
            // const isProxied = !!isProxy(this)
            // console.log('call function', isProxied, v)
            return v;
          }
          if (_.isObject(v) && !proxyUtils.isPauseProxy) return getProxyObject(v).proxy;
          return v;
      }
    },
    // ownKeys(target){
    //     return [...Reflect.ownKeys(target), proxyWatchSymbolKey]
    // },
    set(target, prop, v, receiver) {
      // console.log('ssssssssssset look look id', objectCountUtils.getObjectCount(t), prop, v)
      const as = unshellProxies([v])
      const value = as[0]
      let oldLength: number = 0;
      let oldTarget = [] as Array<any>;
      if (prop === 'length') {
        oldLength = t.length;
        oldTarget = [...(target as Array<any>)];
      }
      const old = Reflect.get(target, prop, receiver);
      const bl = Reflect.set(target, prop, value, receiver);
      if (!bl) {
        // 对象不可写 还有哪些情况？
        return bl;
      }
      //派发属性变更事件，事件type为属性名
      dispatcher.dispatch(prop, value, old);

      dispatcher.dispatch(listenAnyWildcard, prop, value, old, target, target);
      // 如果长度发生变化，则派发长度变化事件
      if (prop === 'length' && oldLength !== t.length) {
        const nowLength = t.length;
        // const oldTarget = [...target as Array<any>]
        dispatchChange(Math.min(oldLength, nowLength), Math.max(oldLength, nowLength), oldTarget);
      }
      return bl;
    },
  };
  return handler;
}
export type UpdateObjectEventMap<T> = {
  [K in keyof T]: string;
};

export const ProxyObjectStringTag = 'ProxyObject';
// 判断是否是已经代理过的对象
export function isProxyObject(target: any) {
  return proxyMap.has(target) && !_.isObject(proxyMap.get(target)?.target);
}
export function isProxyArray(target: any) {
  return proxyMap.has(target) && _.isArray(proxyMap.get(target)?.target);
}
export function isProxy(target: any) {
  return proxyMap.get(target);
}
function objectHandler<T extends object>(target: T, dispatcher: IDispatcher, eventMap?: UpdateObjectEventMap<T>) {
  // (target as any)[Symbol.toStringTag] = ProxyObjectStringTag
  function checkDispatchEventMap(prop: string | Symbol, now: T[keyof T] | undefined, old: T[keyof T] | undefined) {
    if (eventMap && eventMap[prop as keyof T]) {
      // console.log('ddddddddddddddispatch from eventmap', prop, now, old, target)
      dispatcher.dispatch((eventMap as any)[prop as any], now, old, target);
    } else {
      // console.log('ddddddddddddddispatch from prop', prop, now, old, target)
      dispatcher.dispatch(prop, now, old, target);
    }
    // console.log('ddddddddddddddispatch listenAnyWildcard', prop, now, old, target)
    dispatcher.dispatch(listenAnyWildcard, prop, now, old, target);
  }
  const handler: ProxyHandler<T> = {
    deleteProperty(target, prop) {
      if (!(prop in target)) return false;
      const old = (target as any)[prop];
      const bl = Reflect.deleteProperty(target, prop);
      if (bl && old !== undefined) checkDispatchEventMap(prop, undefined, old);
      return bl;
    },
    get(target, prop, receiver) {
      if (prop === proxyWatchOriginTargetKey) {
        console.log('get proxyWatchOriginTargetKey object called', target);
        return target;
      }
      let v = Reflect.get(target, prop, receiver);
      if (typeof v === 'function') {
        // if (prop === 'toString') {
        //   v = function () {
        //     return 'i proxy watch object';
        //   } as any;
        // }
        // v = (v as any).bind(target);
        return v;
      }
      if (_.isObject(v) && !proxyUtils.isPauseProxy) return getProxyObject(v).proxy;
      return v;
    },
    set(target, prop, v, receiver) {
      const as = unshellProxies([v])
      const value = as[0]
      const old = Reflect.get(target, prop, receiver);
      const bl = Reflect.set(target, prop, value, receiver);
      if (!bl) return bl;
      checkDispatchEventMap(prop, value, old);
      return bl;
    },
  };
  return handler;
}
// const testProxyKeyMap = new Map<any, any>()
// const testTargetKeyMap = new Map<any, any>()
/**
 * 获取或生成代理对象，它能够在属性变更时派发事件通知侦听函数该属性已经变更。
 * @param target 要被代理的对象
 * @returns IProxyObject
 */
export function getProxyObject<T extends object>(
  t: T,
  dispatcher?: IDispatcher,
  eventMap?: UpdateObjectEventMap<T>,
): IProxyObject<T> {
  if (!t) {
    console.trace('getProxyObject no target', t);
    throw new Error('getProxyObject no target');
  }
  if (!_.isObject(t)) {
    console.trace('getProxyObject target is not object', t);
    throw new Error('getProxyObject target is not object');
  }
  if (_.isFunction(t)) {
    // console.log('getProxyObject_fn target is a function', t);
    // console.trace('getProxyObject target is function', t);
    // throw new Error('getProxyObject target is function');
  }
  const target = getProxyWatchRealTarget(t);
  if (proxyMap.has(target)) {
    console.log('poroxy map has target', proxyMap.get(target));
    throw new Error('poroxy map has target');
  }
  const ts = ('toString' in target)?target.toString() :'';
  if (ts.indexOf('i proxy watch') > -1) {
    console.log('eerror proxy watch ts, target', typeof target, ts, target);
        // console.log('eerror proxy watch proxymap', objectCountUtils.getObjectCount(target), proxyMap.get(target));
    console.log('eerror proxy watch objectmap', objectMap.get(target));
    // console.log('try to get real proxy', testProxyKeyMap.get(target));
    // console.log('try to get real target2', testTargetKeyMap.get(target));
    console.log('try to get symbol target', (target as any)[proxyWatchSymbolKey]);
    console.log('try to get symbol target2', (t as any)[proxyWatchSymbolKey]);
    console.trace('eerror proxy watch target');
    throw new Error('eerror proxy watch');
  }
  let proxyObject = (objectMap.get(target) || proxyMap.get(target)) as IProxyObject<T>;
  if (proxyObject) return proxyObject;
  // target[Symbol.toStringTag] = _.isArray(target) ? ProxyArrayStringTag : ProxyObjectStringTag
  dispatcher = dispatcher || new Dispatcher();

  const handler = _.isArray(target) ? arrayHandler(target, dispatcher) : objectHandler(target, dispatcher, eventMap);
  const throttleUnsubscribe = createThrottle(dispatcher);

  const proxy = new Proxy(target, handler);
    const targetId = 0 // objectCountUtils.getObjectCount(target)
  const proxyId = 0 // objectCountUtils.setObjectCount(proxy, `proxy-${targetId}`, 'proxy-id')
  // testProxyKeyMap.set(proxy, target)
  // testTargetKeyMap.set(target, proxy)
  proxyObject = {
    target,
    proxy,
    dispatcher,
    throttleUnsubscribe,
    targetId,
    proxyId,
  };

    // console.log('create new porxy33333', proxyObject.targetId, proxyObject.proxyId, proxyObject);
  //   console.log('ts =', ts)
  objectMap.set(target, proxyObject);
  proxyMap.set(proxy, proxyObject);
  return proxyObject;
}

// export function getProxyWatchRealTarget<T>(target: T): T {
//   proxyUtils.pauseProxy();
export function getProxyWatchRealTarget<T>(target: T): T {
  proxyUtils.pauseProxy();
  // console.log('getProxyWatchRealTarget isProxy(target)', objectCountUtils.getObjectCount(target), isProxy(target));
  let t = isProxy(target)?.target || target;
  // console.log('getProxyWatchRealTarget t', objectCountUtils.getObjectCount(t), t, isProxy(t));
  // console.log('getProxyWatchRealTarget isProxy(t)', isProxy(t));
  let c = 0;
  while (t && isProxy(t)) {
    // console.log('unshell getRealTarget a', c, t);
    c++;
    if (c > 5) break;
    if (c > 2) {
      // console.log('unshell getRealTarget b', c, t);
    }
    t = isProxy(t)?.target;
  }
  proxyUtils.resumeProxy();
  return t;
}
// 销毁代理对象，可以用来手动销毁确认用不到的对象。
export function destroyProxyObject<T extends object>(target: T, destroyChildren: boolean = false) {
  const proxyObject = objectMap.get(target);
  if (!proxyObject) return;
  objectMap.delete(target);
  proxyObject.dispatcher.removeAllListeners();
  if (!destroyChildren) return;
  for (const key in proxyObject.target) {
    destroyProxyObject(proxyObject.target[key], destroyChildren);
  }
}
/**
 * 通过proxy监听对象属性变更，此方法可以监听一个属性链当中任意属性的变更。
 * 譬如const a = {b:{name:"John"},d:[{age:3}]}
 * const onUpdate = (now, old)=>{console.log("now value=",now, "old value=",old)}
 * const onUndefined = (info)=>{console.log("value is undefined, info=", info)}
 * const {proxy, unwatch} = proxyWatch(a, 'a.d.name' onUpdate, onUndefined)
 *
 * 通过proxy来更改a的属性或其子级属性，此时侦听函数onUpdate应该能响应
 * proxy.b.name = "Joy"
 *
 * 通过原始数据修改方式
 * a.b.name = "Elly"
 * 手动触发proxy更新，触发后onUpdate应该能响应
 * proxyUpdateObject(a.b, "name", "Elly")
 *
 * @param target
 * @param propertyChain
 * @param onUpdate
 * @param onUndefined
 * @returns
 */
export function proxyWatch<T extends object, U>(
  target: T,
  propertyChain: PropertiesChain<T>| string[],
  onUpdate: OnUpdate<U>,
  onUndefined?: OnUndefined,
): IWatchPropertyResult<T> {
  if (!target) {
    throw new Error('watch no target');
  }
  if (!propertyChain) {
    throw new Error('watch no propertyChain');
  }
  function _onUpdate(now: U, old?: U){
    const proxiedNow = _.get(target, propertyChain) as U;
    // console.log('proxiedNow=', propertyChain, proxiedNow);
    // if(_.isObject(proxiedNow)){
    //     console.log('proxynow id=', objectCountUtils.getObjectCount(proxiedNow))
    // }
    onUpdate(proxiedNow, old);
  }
  const propertyWatchResult = watchProperty(target, propertyChain, _onUpdate, onUndefined);
  return propertyWatchResult;
}

interface IWatchPropertyResult<T> extends IProxyObject<T> {
  unwatch: UnWatch;
}
function watchProperty<T extends object, U, K extends keyof T>(
  target: T,
  propertyChain: PropertiesChain<T>| string[],
  onUpdate: OnUpdate<U>,
  onUndefined?: OnUndefined,
): IWatchPropertyResult<T> {
    const logger = { pause: false, log: (...args: any[]) => {} };
  logger.pause = true;
  const { prop, nextChain } = getChainProperty(propertyChain);
  logger.log('propertyChain=', propertyChain, 'prop=', prop, 'nextChain=', nextChain);
  const proxyObject = getProxyObject(target);
  let subWatch: IWatchResult<T, any> | null = null;
  let unsubscribe: DispatcherUnsubscribe | null = null;
  const v = (target as any)[prop as keyof T];

  logger.log( 'nextChain=', nextChain, 'v=', v);
  if (v) {
    if (nextChain) {
      subWatch = proxyWatch(v, nextChain, onUpdate, onUndefined);
    }
  }
  // 如果属性不存在，且有下级属性链，则需要触发onUndefined
  if ((!v && nextChain)) {
    const noPropertyKey = !(prop in target);
    const noChildNode = !!nextChain && !v;
    if (noPropertyKey || noChildNode) {
      const noValue = noChildNode || v === undefined;
      const info: IOnUndefinedInfo = {
        prop: prop,
        propertyChain: propertyChain,
        nextChain: nextChain,
        noChildNode,
        noPropertyKey,
        noValue,
      };
      logger.log('onUndefined=', info);
      onUndefined?.(info);
    }
  }
  // 如果属性存在，且没有下级属性链，则直接触发onUpdate
  if (!nextChain) {
    // 这样设计的目的是为了允许属性的值是undefined或null
    logger.log('no nextChain onUpdate=', onUpdate, 'v=', v);
    onUpdate(v);
  }
  const onUpdateHandler = nextChain
    ? (now: T[K], old: T[K]) => {
        logger.log('onUpdateHandler_fn=', onUpdate, 'v=', v);
        subWatch?.unwatch();
        subWatch = null;
        if (now) {
          if (_.isArray(now)) {
          } else if (_.isObject(now)) {
            //为属性的新值重新侦听下级变更。
            subWatch = proxyWatch(now, nextChain as PropertiesChain<NonNullable<T[K]>>, onUpdate, onUndefined);
          } else {
            // 应该是非预期的属性，得观察一下是否应该抛错。
            // js允许类型变化，所以不能确定这个值是否是基元值还是对象
          }
        }
      }
    : onUpdate;
  listenProp(prop);
  function listenProp(prop: string) {
    unsubscribe?.();
    unsubscribe = null;
    if (!prop) return;
    unsubscribe = proxyObject.dispatcher.addListener(prop, onUpdateHandler);
  }
  function unwatch() {
    unsubscribe?.();
    unsubscribe = null;
    subWatch?.unwatch();
    subWatch = null;
  }
  return { unwatch, ...proxyObject };
}
function unshellProxies(list:any[]){
  const res = list.map(p=>{
    const t = getProxyWatchRealTarget(p)
    if(!_.isObject(t))return t;
    for(const key in t){
      const v = (t as any)[key];
      if(_.isObject(v)){
        if(isProxy(v)){
          (t as any)[key] = getProxyWatchRealTarget(v);
        }
      }
      // 原先是这样修改的，但是会对只读属性抛错。现在修改为上面代码了但是不知道是否有隐藏问题。
      // (t as any)[key] = unshellProxies([(t as any)[key]])[0];
    }
    return t
  })
  return res
}

function getChainProperty(chain: string| string[]) {
  if(typeof chain === 'string'){
    let index = chain.indexOf('.');
    const prop = index > -1 ? chain.slice(0, index) : chain;
    return { prop, nextChain: chain.replace(`${prop}${index > -1 ? '.' : ''}`, '') };
  }
  const newChain = chain.slice();
  const prop = newChain.shift();
  if(!prop){
    throw new Error('getChainProperty no prop');
  }
  return { prop, nextChain: newChain.length > 0 ? newChain : undefined };
}


export function proxyUpdateObject<T extends object, K extends keyof T>(target: T, key: K, oldValue?: T[K]): boolean {
  const proxyObject = getProxyObject(target);
  if (!proxyObject) return false;
  const now = proxyObject.target[key];
  proxyObject.dispatcher.dispatch(key, now, oldValue);
  return true;
}

export function proxyUpdateObjectProperties<T extends object>(
  target: T,
  fresh: Partial<T>,
  prev?: Partial<T>,
): boolean {
  const proxyObject = getProxyObject(target);
  if (!proxyObject) return false;
  for (const key in fresh) {
    const now = proxyObject.target[key];
    const old = prev?.[key];
    proxyObject.dispatcher.dispatch(key as any, now, old);
  }
  return true;
}

export function proxyUpdateAllProperties<T extends object>(target: T) {
  const proxyObject = getProxyObject(target);
  if (!proxyObject) return;
  for (const key in proxyObject.target) {
    proxyUpdateObject(proxyObject.target, key);
  }
}

export function toProxy<T extends object>(target: T): T {
  return getProxyObject(target).proxy;
}
export function getProxyDispatcher<T extends object>(target: T): IDispatcher {
  return getProxyObject(target).dispatcher;
}

export function getUnshellProxyTarget<T extends object>(target: T): T {
  const proxy = proxyMap.get(target)?.proxy;
  let t = target;
  if (proxy) {
    t = proxy[proxyWatchOriginTargetKey];
  }
  return t;
}
