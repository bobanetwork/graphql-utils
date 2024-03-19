//#region events
import {BigNumberish} from "ethers";

export type LightBridgeDisbursementEvents =
    | LightBridgeDisbursementSuccessEvent
    | LightBridgeDisbursementFailedEvent
    | LightBridgeDisbursementRetrySuccessEvent
export type LightBridgeAssetReceivedEvent = {
    __typename: 'AssetReceived'
    token: string
    sourceChainId: BigNumberish
    toChainId: BigNumberish
    depositId: BigNumberish
    emitter: string
    amount: BigNumberish
    transactionHash_: string
    block_number: BigNumberish
    timestamp_: BigNumberish
}

export type LightBridgeDisbursementSuccessEvent = {
    __typename: 'DisbursementSuccess'
    depositId: BigNumberish
    to: string
    token: string
    amount: BigNumberish
    sourceChainId: BigNumberish
    transactionHash_: string
    block_number: BigNumberish
    timestamp_: BigNumberish
}

export type LightBridgeDisbursementFailedEvent = {
    __typename: 'DisbursementFailed'
    depositId: BigNumberish
    to: string
    amount: BigNumberish
    sourceChainId: BigNumberish
    transactionHash_: string
    block_number: BigNumberish
    timestamp_: BigNumberish
}

export type LightBridgeDisbursementRetrySuccessEvent = {
    __typename: 'DisbursementRetrySuccess'
    depositId: BigNumberish
    to: string
    amount: BigNumberish
    sourceChainId: BigNumberish
    transactionHash_: string
    block_number: BigNumberish
    timestamp_: BigNumberish
}
//#endregion