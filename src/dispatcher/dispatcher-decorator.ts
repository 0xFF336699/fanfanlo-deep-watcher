import { Dispatcher } from "./Dispatcher";



export function dispatchPropertyUpdate(updateType?:string){
    return function dispatch(target: any, propertyKey: string) {
        let v = target[propertyKey];
        Object.defineProperty(target, propertyKey, {
          get() {
            return v
          },
          set(value: any) {
            const old = v;
            v = value; 
            this.dispatch(updateType || propertyKey, value, old)
          },
        });
      }
}


const { defineProperty, getOwnPropertyDescriptor,
    getOwnPropertyNames, getOwnPropertySymbols } = Object;

export const getOwnKeys = getOwnPropertySymbols
    ? function (object:any) {
        const v1 = getOwnPropertySymbols(object)
        return getOwnPropertyNames(object)
          .concat(v1 as []);
      }
    : getOwnPropertyNames;


export function getOwnPropertyDescriptors(obj:any) {
  const descs = {};

  getOwnKeys(obj).forEach(
    // @ts-ignore
    key => (descs[key] = getOwnPropertyDescriptor(obj, key))
  );

  return descs;
}


export function dispatchClazzProperties(exclude:string[] = []){
    return function(klass:any){
  const descs = getOwnPropertyDescriptors(klass.prototype);
  const keys = getOwnKeys(descs);
    }
}

export function dispatchPropertyUpdateTest1(){
    class User extends Dispatcher{
        @dispatchPropertyUpdate()
        name:string = 'testabc'
        constructor(){
            super()
        }
    }
    const user = new User()
    user.addListener('name', (now, old)=>{
        console.log('name changed', now, old)
    })
    console.log('user.name1111111111', user.name)
    user.name = 'helloworld'
    console.log('user.name2222222222222', user.name)
}


class One {
    nameOne!:string
    constructor() {
        this.nameOne = 'One'
    }
    validateOne() {
        console.log("one")
    }
}
 
class Two extends One {
    nameTwo!:string
    constructor() {
        super()
        // this.nameTwo = 'Two'
    }
 
    validateTwo() {
        console.log("two")
    }
}
 
class Three extends Two {
    nameThree!:string
    constructor() {
        super()
        // this.nameThree = 'three'
    }
 
    validateThree() {
        console.log("three")
    }
}
 
 
 
 
let three = new Three()
 
 