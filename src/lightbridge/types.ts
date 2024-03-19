//#region events
export type LightBridgeDisbursementEvents =
    | LightBridgeDisbursementSuccessEvent
    | LightBridgeDisbursementFailedEvent
    | LightBridgeDisbursementRetrySuccessEvent
export type LightBridgeAssetReceivedEvent = {
    __typename: 'AssetReceived'
    token: string
    sourceChainId: BigInt
    toChainId: BigInt
    depositId: BigInt
    emitter: string
    amount: BigInt
    transactionHash_: string
    block_number: BigInt
    timestamp_: BigInt
}

export type LightBridgeDisbursementSuccessEvent = {
    __typename: 'DisbursementSuccess'
    depositId: BigInt
    to: string
    token: string
    amount: BigInt
    sourceChainId: BigInt
    transactionHash_: string
    block_number: BigInt
    timestamp_: BigInt
}

export type LightBridgeDisbursementFailedEvent = {
    __typename: 'DisbursementFailed'
    depositId: BigInt
    to: string
    amount: BigInt
    sourceChainId: BigInt
    transactionHash_: string
    block_number: BigInt
    timestamp_: BigInt
}

export type LightBridgeDisbursementRetrySuccessEvent = {
    __typename: 'DisbursementRetrySuccess'
    depositId: BigInt
    to: string
    amount: BigInt
    sourceChainId: BigInt
    transactionHash_: string
    block_number: BigInt
    timestamp_: BigInt
}
//#endregion