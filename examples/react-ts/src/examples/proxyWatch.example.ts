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
    // 因为已经取消监听，所以不会触发回调
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