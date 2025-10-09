import { toProxy, useProxyWatch } from "fanfanlo-deep-watcher"

function Title() {
    return <div><h3>Chained Property Change Listening</h3></div>;
}

function Explain() {
    return (
        <div>
            <div>
                You can listen to changes in sub-properties, for example, listen to changes in <code>user.pet.name</code>, 
                even if <code>pet</code> is not yet defined.
            </div>
            <div>
                Two key features:
            </div>
            <div>
                1. You can listen to sub-properties, such as <code>user.pet.name</code>.<br/>
                2. You can pre-listen even when the <code>pet</code> property is undefined.
            </div>
        </div>
    );
}


const code = `
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
            <span>Input pet's name</span>
        </div>
    )
}

function Demo(){
    return <div>
        <Name/>
        <Rename/>
    </div>
}`

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
export function PetName(){
    return(
        <div>
            <Title />
            <Explain/>
            <Demo/>
            <Code />
        </div>
    )
}