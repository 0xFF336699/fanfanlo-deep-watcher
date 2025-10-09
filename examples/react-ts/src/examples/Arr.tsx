import { PropertiesChain, toProxy, useProxyWatch, useProxyWatchUpdates } from "fanfanlo-deep-watcher"
import { Code } from "src/components/Code"
function Title() {
    return <div><h3>Add and Remove Array Elements</h3></div>;
}

function Explain() {
    return (
        <div>
            <div>
                <div>You can listen for changes in array elements</div>
                <div>You can also modify the properties of array elements</div>
            </div>
        </div>
    );
}


const code = `
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
  const [name] = useProxyWatch(user, \`friends.$\{index}.name\` as PropertiesChain<typeof user>, user.friends[index].name);
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
`


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

export function Arr(){
    return(
        <div>
            <Title />
            <Explain/>
            <Demo/>
            <Code code={code}/>
        </div>
    )

}