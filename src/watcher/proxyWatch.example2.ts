import { Dispatcher } from ".."
import {proxyWatch } from "./proxyWatch"

interface A {
    name: string
}

interface B {
    age: number
    a?: A
    aa?: A[]
}

export interface C {
    height: Number
    b: B
}

const c: C = { height: 138, b: { age: 10, a: { name: 'john' }, aa: [{ name: 'john' }] } }

function createOnUpdate(name: string){
    return (now: any, old: any)=>{
        console.log(name, 'watch name now=',now, 'old=', old)
    }
}
function createOnUndefined(name: string){
    return (info: any)=>{
        console.log(name, 'watch name undefined info=', info)
    }
}
export function testPropxyWatch(){
    testArrayUnsetMember();
    testDeleteMember();
    testUpdateMember();
}

interface TestFunction extends Function {
  runed?: boolean;
}

const testArrayUnsetMember: TestFunction = function(){
    if(testArrayUnsetMember.runed) return;
    testArrayUnsetMember.runed = true;
    const c: C = { height: 138, b: { age: 10, a: { name: 'John' }, aa: [{ name: 'john' }] } }
    // 此时aa的length为1，索引1并不存在
    const {proxy, unwatch} = proxyWatch(c, 'b.aa.1.name', createOnUpdate('testArrayUnsetMember'), createOnUndefined('testArrayUnsetMember'))
    // 此时proxy.b.aa.length为2，索引1存在， onUpdate应该能响应
    proxy.b!.aa![1] = {name:'Elly'}
    delete proxy.b.aa![1]
    // console.log(proxy.b.aa)
    // proxy.b!.aa!.pop()
    console.log(proxy.b.aa)
    proxy.b!.aa![1].name = 'Rose'
}

const testDeleteMember: TestFunction = function(){
    if(testDeleteMember.runed) return;
    testDeleteMember.runed = true;
    const c: C = { height: 138, b: { age: 10,
          aa: [{ name: 'john' }] } }
    const {proxy, unwatch} = proxyWatch(c, 'b.a.name', createOnUpdate('testDeleteMember'), createOnUndefined('testDeleteMember'))
    proxy.b.a = { name: 'John' }
    proxy.b.a = undefined
    delete proxy.b.a
    console.log('proxy.b.a=', proxy.b.a)
}

const testUpdateMember: TestFunction = function(){
    if(testUpdateMember.runed) return;
    testUpdateMember.runed = true;
    const c: C = { height: 138, b: { age: 10, a: { name: 'John' }} }
    const {proxy, unwatch} = proxyWatch(c, 'b.a.name', createOnUpdate('testUpdateMember'), createOnUndefined('testUpdateMember'))
    proxy.b.a!.name = 'Elly'
    proxy.b.a!.name = 'Joy'
    unwatch()
    proxy.b.a!.name = 'Musk'
}

const testExcludeFunctionProperty = function(){
    class A{
        name!:string
        age!:number
        sayHello!:()=>void
        log(){
            console.log('log')
        }
    }

    const a = new A()
    a.name = 'John'
    // const {proxy} = proxyWatch(a, 'n')
}
