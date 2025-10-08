
import { getUpdateVersion, IUpdateVersion } from "./updateVersion";
import { useProxyWatch } from "./useProxyWatch";
export function 
useUpdateVersion<T extends object>(data:T):[string, IUpdateVersion] {
    const version = getUpdateVersion(data)
    const [v] = useProxyWatch(version, 'version', version.key)
    return [v, version]
}