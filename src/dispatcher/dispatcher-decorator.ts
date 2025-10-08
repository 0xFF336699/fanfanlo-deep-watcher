import { Dispatcher } from "./Dispatcher";



export function dispatchPropertyUpdate(updateType?:string){
    return function dispatch(target: any, propertyKey: string) {
        let v = target[propertyKey];
        // console.log('propertyKey', propertyKey)
        Object.defineProperty(target, propertyKey, {
          get() {
            return v
          },
          set(value: any) {
            const old = v;
            v = value; 
            // console.log('dispatchPropertyUpdate', 'updateType', updateType, 'propertyKey', propertyKey, 'value', value, 'old', old)
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
// function findProperties(obj,...arg){
  
//     function getProperty(new_obj){
   
//       if(new_obj.__proto__ === null){ //说明该对象已经是最顶层的对象
//           return [];
//       }
   
//       let properties = Object.getOwnPropertyNames(new_obj);
   
//       let arr = [];  
    
//       arg.forEach((v)=>{
    
//         const newValue = properties.filter((property)=>{
//             return property.startsWith(v);
//         })
    
//         if(newValue.length>0){
//             arr = arr.concat(newValue as []);
//         }
    
//       })
   
//       return [...arr,...getProperty(new_obj.__proto__)];
   
//     }
   
//     return getProperty(obj);   
   
   
//   }

export function dispatchClazzProperties(exclude:string[] = []){
    return function(klass:any){
        // const keys = findProperties(klass)
        // console.log('keys is', keys, klass)
        // console.log('Object.keys(klass) is', Object.keys(klass))
  const descs = getOwnPropertyDescriptors(klass.prototype);
  const keys = getOwnKeys(descs);
  console.log('keys is', keys)
//   for (let i = 0, l = keys.length; i < l; i++) {
//     const key = keys[i];
//     console.log('key is', key)
//     const desc = descs[key];
//     console.log('desc is', desc)
//     console.log('desc.value is', desc.value)

//     if (typeof desc.value !== 'function' || key === 'constructor') {
//       continue;
//     }

//     dispatchPropertyUpdate()(klass.prototype, key)
//     // defineProperty(klass.prototype, key, autobindMethod(klass.prototype, key, desc));
//   }

        // for(const key in target){
        //     console.log('key is', key)
        //     if(exclude.includes(key)) continue
        //     console.log('target[key] is', target[key])
        //     dispatchPropertyUpdate()(target, key)
        // }
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
 
// const data = findProperties(three, 'name', 'validate');
 
// console.log('1111111111111111111111111111111111',data)
 
 