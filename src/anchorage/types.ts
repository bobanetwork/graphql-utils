//#region general_types
export enum DepositState {
    deposited = 'TransactionDeposited',
    finalized = 'DepositFinalized',
}
export enum WithdrawProcessStep {
    'Initialized' = 3,
    'Proven' = 5,
}

export enum WithdrawState {
    initialized = 'initialized',
    proven = 'proven',
    finalized = 'finalized',
}

export interface IReenterWithdrawConfig {
    state: WithdrawState
    step: WithdrawProcessStep
    withdrawalHash: `${'0x'}${string}`
    blockHash: `${'0x'}${string}`
    blockNumber: number
}

export interface IHandleProveWithdrawalConfig {
    blockNumber: number
    withdrawalHash?: string
    blockHash?: string
    timeStamp?: number
}
//#endregion

//#region events
export type GQPWithdrawalInitiatedEvent = {
    __typename: "WithdrawalInitiated"
    id: string
    to: string
    from: string
    contractId_: string
    timestamp_: string
    block_number: string
    transactionHash_: string
    l1Token: string
    l2Token: string
    amount: string
    extraData: string
}

export type GQL2ToL1MessagePassedEvent = {
    __typename: "MessagePassed"
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    nonce: string
    sender: string
    target: string
    value: string
    gasLimit: string
    data: string
    withdrawalHash: string
}

export type GQLWithdrawalFinalizedEvent = {
    __typename: "WithdrawalFinalized"
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    withdrawalHash: string
    success: string
}

export type GQLWithdrawalProvenEvent = {
    __typename: 'WithdrawalProven'
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    withdrawalHash: string
    contractId_: string
    from: string
    to: string
}

export type GQLDepositFinalizedEvent = {
    id: string
    block_number: string
    timestamp_: number
    transactionHash_: string
    contractId_: string
    l1Token: string
    l2Token: string
    from: string
    to: string
    amount: string
    extraData: string
    __typename: DepositState
}
//#endregion