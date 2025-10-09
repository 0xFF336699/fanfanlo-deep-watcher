import { ReactNode } from "react";

export function Code({code}:{code:string}){
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