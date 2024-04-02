//#region events
import {BigNumberish} from "ethers";

export type LightBridgeSupportedRouteEvents = {
    transactionHash_: string
    block_number: string
    timestamp_: string
    contractId_: string
    token: string
    toChainId: string
    supported: boolean
}

export type LightBridgeDisbursementEvents =
    | LightBridgeDisbursementSuccessEvent
    | LightBridgeDisbursementFailedEvent
    | LightBridgeDisbursementRetrySuccessEvent
export type LightBridgeAssetReceivedEvent = {
    __typename: 'AssetReceived'
    token: string
    sourceChainId: string
    toChainId: string
    depositId: string
    emitter: string
    amount: BigNumberish
    transactionHash_: string
    block_number: string
    timestamp_: string
}

export type LightBridgeDisbursementSuccessEvent = {
    __typename: 'DisbursementSuccess'
    depositId: string
    to: string
    token: string
    amount: BigNumberish
    sourceChainId: string
    transactionHash_: string
    block_number: string
    timestamp_: string
}

export type LightBridgeDisbursementFailedEvent = {
    __typename: 'DisbursementFailed'
    depositId: string
    to: string
    amount: BigNumberish
    sourceChainId: string
    transactionHash_: string
    block_number: string
    timestamp_: string
}

export type LightBridgeDisbursementRetrySuccessEvent = {
    __typename: 'DisbursementRetrySuccess'
    depositId: string
    to: string
    amount: BigNumberish
    sourceChainId: string
    transactionHash_: string
    block_number: string
    timestamp_: string
}
//#endregion