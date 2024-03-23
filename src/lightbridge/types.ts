//#region events
import {BigNumber} from "ethers";

export type LightBridgeDisbursementEvents =
    | LightBridgeDisbursementSuccessEvent
    | LightBridgeDisbursementFailedEvent
    | LightBridgeDisbursementRetrySuccessEvent
export type LightBridgeAssetReceivedEvent = {
    __typename: 'AssetReceived'
    token: string
    sourceChainId: BigNumber
    toChainId: BigNumber
    depositId: BigNumber
    emitter: string
    amount: BigNumber
    transactionHash_: string
    block_number: BigNumber
    timestamp_: BigNumber
}

export type LightBridgeDisbursementSuccessEvent = {
    __typename: 'DisbursementSuccess'
    depositId: BigNumber
    to: string
    token: string
    amount: BigNumber
    sourceChainId: BigNumber
    transactionHash_: string
    block_number: BigNumber
    timestamp_: BigNumber
}

export type LightBridgeDisbursementFailedEvent = {
    __typename: 'DisbursementFailed'
    depositId: BigNumber
    to: string
    amount: BigNumber
    sourceChainId: BigNumber
    transactionHash_: string
    block_number: BigNumber
    timestamp_: BigNumber
}

export type LightBridgeDisbursementRetrySuccessEvent = {
    __typename: 'DisbursementRetrySuccess'
    depositId: BigNumber
    to: string
    amount: BigNumber
    sourceChainId: BigNumber
    transactionHash_: string
    block_number: BigNumber
    timestamp_: BigNumber
}
//#endregion