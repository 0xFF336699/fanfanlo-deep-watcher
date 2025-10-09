import { toProxy, useProxyWatch } from "fanfanlo-deep-watcher"

function Title(){
    return <div><h3>链式属性侦听变化</h3></div>
}
function Explain(){
    return <div>
        <div>
            可以侦听属性的子级，例如侦听 user 的 pet.name 的变化，即使 pet 未定义也可以预先侦听。
            
        </div>
        <div>
            两个功能点
        </div>
        <div>
            1. 可以侦听属性的子级，例如侦听 user 的 pet.name 的变化。
            2. 即使 pet 属性未定义也可以预先侦听。
        </div>
    </div>
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
            <span>请输入宠物名</span>
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
            <span> 请输入宠物名</span>
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