import { useEffect, useState } from 'react';
import { getProxyObject, PropertiesChain, proxyWatch, UnWatch } from '../watcher/proxyWatch';

let count = 0;
/**
 * 注意，如果target不是proxy对象，那么更改target的属性不会触发更新，这种情况可以使用返回的proxy对象。
 * @param target 监听的对象
 * @param propertyChain 监听的属性链
 * @param defaultValue 默认值
 * @returns [value, proxy, unsub] value: 监听的属性值, proxy: 监听的对象, unsub: 取消监听
 */
export function useProxyWatch<T extends object, U>(
  target: T,
  propertyChain: PropertiesChain<T>,
  defaultValue: U,
): [U, T, UnWatch] {
  if(!propertyChain){
    console.error('propertyChain is undefined',defaultValue, target)
  }
  const [value, setValue] = useState(defaultValue);
  const [proxy] = useState(getProxyObject(target).proxy);

  let isFirstUpdate = true;
  const onUpdate = (now: U, old?: U) => {
    if(!now){
      if(isFirstUpdate){
        now = defaultValue;
      }
    }
    if(isFirstUpdate){
      isFirstUpdate = false;
    }
    setValue(now);
  };

  const onUndefined = (info: any) => {
    if (value === defaultValue) return;
    if(!isFirstUpdate)return;
    isFirstUpdate = false;
    setValue(defaultValue);
  };

  let unwatch: UnWatch | null = null;
  function unsub() {
    unwatch?.();
    unwatch = null;
  }

  useEffect(() => {
    if(propertyChain){
        unwatch = proxyWatch(target, propertyChain, onUpdate, onUndefined).unwatch;
    }
    return () => {
      unwatch?.();
    };
  }, []);
  return [value, proxy, unsub];
}
