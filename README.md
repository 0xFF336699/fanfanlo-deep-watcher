# Deep Watcher

A utility library for deep watching objects and properties, with first-class React support.

## Features

- 🔍 Deep object property watching
- ⚡ React hooks integration
- 🚀 Lightweight and performant
- 🔄 Automatic dependency tracking
- 🛠️ TypeScript support

## Installation

Install with npm or yarn:

```bash
npm install fanfanlo-deep-watcher
# or
yarn add fanfanlo-deep-watcher
```

## Basic Usage

### code
```js

import { IWatchUpdatePropertyInfo, proxyWatch, toProxy, watchUpdates } from "fanfanlo-deep-watcher"

interface IPet{
    name?:string
}

interface IFriend{
    name?:string
}

interface IUser{
    name?: string;
    age?: number;
    pet?: IPet
    friends?: IFriend[]
    [key:string]: any
}
function watchProperty(){
    const tag = "[watchProperty]"
    const user = toProxy({name:"Joy"} as IUser)
    function onChange(now:string, old?:string){
        console.log(tag, `user.name changed from ${old} to ${now}`)
    }
    const {unwatch} = proxyWatch(user, 'name', onChange)
    user.name = 'Elly';
    unwatch();
    user.name = 'Lucy';

    const {unwatch:petNameUnwatch} = proxyWatch(user, 'pet.name', (now:string, old?:string)=>{
        console.log(tag, `user.pet.name changed from ${old} to ${now}`)
    })
    user.pet = {name:'dog'};
    user.pet.name = 'cat';
    petNameUnwatch();
    user.pet.name = 'pig';
}

function watchProperties(){
    const tag = "[watchProperties]";
    const user = toProxy({age:18} as IUser)
    function onUpdate(info:IWatchUpdatePropertyInfo<IUser>){
        console.log(tag, `update key =`, info.key, `update now value =`, info.newValue, `update old value =`, info.oldValue, `target = `, info.target,  `info=`, info);
    }
    const unwatch = watchUpdates(user, onUpdate);
    user.age = 20;
    unwatch();
    // Since the listener has been removed, the callback will not be triggered
    user.age = 22;
}

function watchArray(){
    const tag = "[watchArray]";
    const user = toProxy({friends:[]} as IUser);
    function onUpdate(info:IWatchUpdatePropertyInfo<object>){
        console.log(tag, `update key =`, info.key, `update now value =`, info.newValue, `update old value =`, info.oldValue, `target = `, info.target,  `info=`, info);
    }
    const unWatchArray = watchUpdates(user.friends!, onUpdate);
    user.friends!.push({name:'Alice'});
    user.friends![0].name = 'Alice-modified';
    user.friends!.splice(0, 1);
    unWatchArray();

    function onFriend0NameChange(now:string, old?:string){
        console.log(tag, `user.friends[0].name changed from ${old} to ${now}`);
    }
    const {unwatch: unWatchFriend0Name} = proxyWatch(user, 'friends.0.name', onFriend0NameChange);
    user.friends!.push({name:'Bob'});
    user.friends![0].name = 'Bob-modified';
    unWatchFriend0Name();
    user.friends![0].name = 'Bob-modified-again';
}

function watchSpecialKey(){
    const tag = "[watchSpecialKey]";
    const user = toProxy({} as IUser);
    function onSpecialKeyValueChange(now:any, old?:any){
        console.log(tag, `user["special.key"] changed from ${old} to ${now}`);
    }
    const {unwatch} = proxyWatch(user, ['special.key'], onSpecialKeyValueChange);
    user["special.key"] = 123;
    unwatch();
    user["special.key"] = 456;
}
export  function runExamples(){
    watchProperty();
    watchProperties();
    watchArray();
    watchSpecialKey();
}
```

```js

function Code(){
    return <details style={{ margin: '10px 0', cursor: 'pointer' }}>
    <summary>code</summary>
    <pre style={{
      background: '#f5f5f5',
      padding: '10px',
      borderRadius: '4px',
      overflowX: 'auto',
      marginTop: '10px'
    }}>
      <code>{code}</code>
    </pre>
  </details>
}
interface User {
    pet?:{
        name:string
    }
}
const user = toProxy<User>({
    // pet:{name:"Bella"}
});

function Name(){
    const [name] = useProxyWatch(user,'pet.name',user.pet?.name || "")
    return <div>{name}</div>
}

function Rename(){
    return(
        <div>
            <input type="text" defaultValue={user.pet?.name || ""} onChange={(e)=>user.pet = {name: e.target.value}}/>
            <span> Input pet's name</span>
        </div>
    )
}

function Demo(){
    return <div>
        <Name/>
        <Rename/>
    </div>
}

```

```js


interface IFriend{
    name:string
}

interface IUser{
    friends:IFriend[]
}

const user = toProxy<IUser>({
    friends:[
        {name:"Bella"}
    ]
})

function AddFriend(){
    return (
        <div>
            <input 
            id="addFriendInput"
                type="text" 
                placeholder="Enter friend's name"
            />
            <button onClick={() => {
                const input = document.getElementById("addFriendInput") as HTMLInputElement;
                user.friends.push({name:input.value});
                input.value = "";
            }}>
                add
            </button>
        </div>
    )
}

function Friend({ index }: {index:number}) {
  const [name] = useProxyWatch(user, `friends.${index}.name` as PropertiesChain<typeof user>, user.friends[index].name);
  return <div key={index}>
    <button onClick={()=>user.friends.splice(index,1)}>del</button>
    <input type="text" value={name} onChange={(e)=>user.friends[index].name = e.target.value}/>
  </div>;
}
function Friends(){
    const [friends] = useProxyWatchUpdates(user,'friends',user.friends)
    return <div>
        {friends.map((_,index)=>(
            <Friend key={index} index={index}/>
        ))}
        <div>
        {friends.map((friend,index)=>(
                    <span key={index}> {friend.name} </span>
                ))}
        </div>
    </div>
}

function Demo(){
    return(
        <div>
            <AddFriend/>
            <Friends/>
        </div>
    )
}
```
## Examples

Check out the complete examples in the `examples/react-ts` directory.

see [https://fanfanlo-deep-watcher.cloudflare.shangwoa.top/](https://fanfanlo-deep-watcher.cloudflare.shangwoa.top/)

## License

MIT
