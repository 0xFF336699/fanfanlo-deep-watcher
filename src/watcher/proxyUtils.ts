
export const proxyUtils = {
    isPauseProxy:false,
    pauseProxy(){
        this.isPauseProxy = true
    },
    resumeProxy(){
        this.isPauseProxy = false
    },
    runPauseProxyFn<T>(fn:()=>T):T{
        this.pauseProxy()
        const result = fn()
        this.resumeProxy()
        return result
    }
}
