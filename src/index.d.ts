/** sugar的配置接口 */
interface SugarOptions{
    port: number,
    confFile: string
}

/** sugar的应用配置 */
interface SugarAppConfig{
    name: string
}

/** sugar 通信接口消息 */
interface SugarIpcMessage{
    /** channel id */
    id: string
    /** channel id */
    type: string
    /** 消息内容 */
    message: Object
}

declare namespace Session{
    interface IpcMessage{

    }
}