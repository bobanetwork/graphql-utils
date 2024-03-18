import {EGraphQLService, MinimalNetworkService} from "../types";
import {
    GQL2ToL1MessagePassedEvent, GQLDepositFinalizedEvent,
    GQLWithdrawalFinalizedEvent,
    GQLWithdrawalProvenEvent,
    GQPWithdrawalInitiatedEvent, IHandleProveWithdrawalConfig, IReenterWithdrawConfig,
    WithdrawProcessStep,
    WithdrawState
} from "./types";
import {MinimalNetworkConfig} from "../types";
import {GraphQLService} from "../graphql.service";
import {gql} from "@apollo/client";
import { JsonRpcProvider } from '@ethersproject/providers'
import {ethers} from "ethers";
import {defaultAbiCoder, keccak256} from "ethers/lib/utils";

export class AnchorageGraphQLService extends GraphQLService {
    async findWithdrawalsProven(
        withdrawalHashes: string[]
    ): Promise<GQLWithdrawalProvenEvent[]> {
        try {
            const qry = gql`
        query getWithdrawalProven($withdrawalHash: [String!]!) {
          withdrawalProvens(where: { withdrawalHash_in: $withdrawalHash }) {
            id
            block_number
            timestamp_
            transactionHash_
            contractId_
            from
            to
            withdrawalHash
          }
        }
      `
            return (
                await this.conductQuery(
                    qry,
                    { withdrawalHash: withdrawalHashes },
                    11155111, // @todo make sure chain driven from connection
                    EGraphQLService.AnchorageBridge
                )
            )?.data.withdrawalProvens
        } catch (e) {
            console.log('Error while fetching: PROVEN')
            return []
        }
    }

    async findWithdrawalsFinalized(
        withdrawalHashes: string[]
    ): Promise<GQLWithdrawalFinalizedEvent[]> {
        try {
            const graphqlQuery = gql`
        query getWithdrawalsFinalized($withdrawalHash: [String!]!) {
          withdrawalFinalizeds(where: { withdrawalHash_in: $withdrawalHash }) {
            id
            block_number
            timestamp_
            transactionHash_
            contractId_
            withdrawalHash
            success
          }
        }
      `
            return (
                await this.conductQuery(
                    graphqlQuery,
                    { withdrawalHash: withdrawalHashes },
                    11155111, // @todo make sure chain driven from connection
                    EGraphQLService.AnchorageBridge
                )
            )?.data.withdrawalFinalizeds
        } catch (e) {
            return []
        }
    }

    async findWithdrawalsInitiated(
        address: string
    ): Promise<GQPWithdrawalInitiatedEvent[]> {
        try {
            const qry = gql`
        query GetWithdrawalInitiateds($address: String!) {
          withdrawalInitiateds(where: { from: $address }) {
            id
            to
            from
            contractId_
            timestamp_
            transactionHash_
            block_number
            l1Token
            l2Token
            amount
            extraData
          }
        }
      `
            return (
                await this.conductQuery(
                    qry,
                    { address: address.toLowerCase() },
                    28882,
                    EGraphQLService.AnchorageBridge
                )
            )?.data.withdrawalInitiateds
        } catch (e) {
            return []
        }
    }

    async findWithdrawalMessagedPassed(
        withdrawalHash: string
    ): Promise<GQL2ToL1MessagePassedEvent[]> {
        try {
            const qry = gql`
        query GetWithdrawalInitiateds($withdrawalHash: String!) {
          messagePasseds(where: { withdrawalHash: $withdrawalHash }) {
            id
            block_number
            timestamp_
            transactionHash_
            contractId_
            nonce
            sender
            target
            value
            gasLimit
            data
            withdrawalHash
          }
        }
      `
            return (
                await this.conductQuery(
                    qry,
                    {
                        withdrawalHash,
                    },
                    28882,
                    EGraphQLService.AnchorageBridge
                )
            )?.data.messagePasseds
        } catch (e) {
            return []
        }
    }

    async findWithdrawalMessagesPassed(
        blockNumbers: string[]
    ): Promise<GQL2ToL1MessagePassedEvent[]> {
        try {
            const qry = gql`
        query getMessagePasseds($blockNumbers: [String!]!) {
          messagePasseds(where: { block_number_in: $blockNumbers }) {
            id
            block_number
            timestamp_
            transactionHash_
            contractId_
            nonce
            sender
            target
            value
            gasLimit
            data
            withdrawalHash
          }
        }
      `
            return (
                await this.conductQuery(
                    qry,
                    { blockNumbers },
                    28882,
                    EGraphQLService.AnchorageBridge
                )
            )?.data.messagePasseds
        } catch (e) {
            return []
        }
    }

    async queryDepositTransactions(
        provider: JsonRpcProvider | undefined,
        address: string,
        networkConfig: MinimalNetworkConfig
    ) {
        try {
            const graphqlQuery = gql`
        query GetDepositsFinalized($address: String!) {
          depositFinalizeds(where: { from: $address }) {
            id
            to
            from
            contractId_
            timestamp_
            transactionHash_
            block_number
            l1Token
            l2Token
            amount
            extraData
          }
        }
      `
            const depositsFinalized: GQLDepositFinalizedEvent[] = (
                await this.conductQuery(
                    graphqlQuery,
                    {
                        address: address.toLowerCase(),
                    },
                    28882,
                    EGraphQLService.AnchorageBridge
                )
            )?.data.depositFinalizeds

            return Promise.all(
                depositsFinalized.map((event) => {
                    return this.mapDepositToTransaction(
                        provider,
                        networkConfig,
                        event,
                        'status'
                    )
                })
            )
        } catch (e) {
            return []
        }
    }

    async mapDepositToTransaction(
        provider,
        networkConfig: MinimalNetworkConfig,
        event: GQLDepositFinalizedEvent,
        status: any
    ) {
        const isTokenDeposit = (token) => {
            return token !== '0x0000000000000000000000000000000000000000'
        }
        const transaction = await provider!.getTransaction(event.transactionHash_)
        const block = await provider!.getBlock(transaction.blockHash)

        return {
            timeStamp: block.timestamp,
            layer: 'l2',
            chainName: networkConfig.L1.name,
            originChainId: networkConfig.L1.chainId,
            destinationChainId: networkConfig.L2.chainId,
            UserFacingStatus: status,
            contractAddress: event.contractId_,
            hash: event.transactionHash_,
            crossDomainMessage: {
                crossDomainMessage: 1,
                crossDomainMessageEstimateFinalizedTime: 180,
                crossDomainMessageFinalize: 1,
                crossDomainMessageSendTime: 100,
                fromHash: '0x0',
                toHash: undefined,
                fast: 1,
            },
            contractName: '-',
            from: event.from,
            to: event.to,
            action: {
                amount: event.amount,
                sender: event.from,
                status: 'succeeded',
                to: event.to,
                token: isTokenDeposit(event.l1Token) ? event.l1Token : null,
            },
            isTeleportation: false,
        }
    }

    async mapWithdrawalToTransaction(
        l1Provider,
        l2Provider,
        networkConfig: MinimalNetworkConfig,
        event: any,
        status: WithdrawState
    ) {
        const provider =
            status !== WithdrawState.initialized ? l1Provider : l2Provider

        const transaction = await provider!.getTransaction(event.transactionHash_)
        const block = await provider!.getBlock(transaction.blockNumber)

        return {
            timeStamp: block.timestamp,
            layer: 'l2',
            chainName: networkConfig.L2.name,
            originChainId: networkConfig.L2.chainId,
            destinationChainId: networkConfig.L1?.chainId,
            UserFacingStatus: status,
            contractAddress: event.contractId_,
            hash: transaction.hash,
            crossDomainMessage: {
                crossDomainMessage: 1,
                crossDomainMessageEstimateFinalizedTime: 180,
                crossDomainMessageFinalize: 1,
                crossDomainMessageSendTime: 100,
                fromHash: '0x0',
                toHash: undefined,
                fast: 1,
            },
            contractName: '-',
            from: event.sender,
            to: event.target,
            action: {
                amount: event.amount || event.value,
                sender: event.sender,
                status: status === WithdrawState.finalized ? 'succeeded' : status,
                to: event.target,
                token: event.l2Token,
            },
            isTeleportation: false,
            actionRequired:
                status === WithdrawState.finalized
                    ? null
                    : {
                        type: 'reenterWithdraw',
                        state: status,
                        step:
                            status === WithdrawState.initialized
                                ? WithdrawProcessStep.Initialized
                                : WithdrawProcessStep.Proven,
                        withdrawalHash: event.withdrawalHash,
                        blockNumber: transaction.blockNumber,
                        blockHash: block.hash,
                        amount: event.amount || event.value,
                        token: event.l2Token,
                        originChainId: networkConfig.L2.chainId,
                    },
        }
    }

    async queryWithdrawalTransactionsHistory(
        l1Provider,
        l2Provider,
        address,
        networkConfig: MinimalNetworkConfig
    ) {
        const withdrawalsInitiated = await this.findWithdrawalsInitiated(address)
        const messagesPassed = await this.findWithdrawalMessagesPassed(
            withdrawalsInitiated.map((wI) => wI.block_number)
        )
        const withdrawalHashes = messagesPassed.map((mP) => mP.withdrawalHash)
        const provenWithdrawals = await this.findWithdrawalsProven(withdrawalHashes)
        const finalizedWithdrawals =
            await this.findWithdrawalsFinalized(withdrawalHashes)

        const withdrawalTransactions: any[] = []
        for (const withdrawalHashCandidate of withdrawalHashes) {
            const provenEvent = provenWithdrawals.find(
                (e) => e!.withdrawalHash === withdrawalHashCandidate
            )

            const messagePayload = messagesPassed.find(
                (m) => m.withdrawalHash === withdrawalHashCandidate
            )
            const withdrawPayload = withdrawalsInitiated.find(
                (w) => w.block_number === messagePayload?.block_number
            )

            const eventPayload = {
                ...messagePayload,
                ...withdrawPayload,
            }
            if (!!provenEvent) {
                const finalizedEvent = finalizedWithdrawals.find(
                    (e) => e!.withdrawalHash === withdrawalHashCandidate
                )
                if (finalizedEvent) {
                    withdrawalTransactions.push(
                        await this.mapWithdrawalToTransaction(
                            l1Provider,
                            l2Provider,
                            networkConfig,
                            { ...eventPayload, ...finalizedEvent },
                            WithdrawState.finalized
                        )
                    )
                } else {
                    withdrawalTransactions.push(
                        await this.mapWithdrawalToTransaction(
                            l1Provider,
                            l2Provider,
                            networkConfig,
                            { ...eventPayload, ...provenEvent },
                            WithdrawState.proven
                        )
                    )
                }
            } else {
                withdrawalTransactions.push(
                    await this.mapWithdrawalToTransaction(
                        l1Provider,
                        l2Provider,
                        networkConfig,
                        eventPayload,
                        WithdrawState.initialized
                    )
                )
            }
        }

        return withdrawalTransactions
    }

    findWithdrawHashesFromLogs(
        bridgeLogsArr: GQPWithdrawalInitiatedEvent[],
        l2tol1Logs: GQL2ToL1MessagePassedEvent[]
    ) {
        const transactionHashSet = new Set(
            bridgeLogsArr.map((obj) => obj.transactionHash_)
        )
        return l2tol1Logs.filter((obj) =>
            transactionHashSet.has(obj.transactionHash_)
        )
    }
}

export const anchorageGraphQLService = new AnchorageGraphQLService()


//#region utils
export const approvalRequired = async (networkService: MinimalNetworkService, L2StandardERC20ABI: any, token, amount) => {
    try {
        if (
            !token ||
            token.address === networkService.addresses.NETWORK_NATIVE_TOKEN
        ) {
            return false
        }
        const tokenContract = new ethers.Contract(
            token.address,
            L2StandardERC20ABI,
            networkService.provider!.getSigner()
        )
        return (
            (
                await tokenContract.allowance(
                    networkService.account,
                    networkService.addresses.L2StandardBridgeAddress
                )
            ).toString() <= amount
        )
    } catch (error) {
        console.log(`error while approvalRequired`, error)
        return false
    }
}

export const handleInitiateWithdrawal = async (networkService: MinimalNetworkService, L2StandardERC20ABI: any, amount: string, token?: any) => {
    try {
        const signer = networkService.provider?.getSigner()
        if (!signer) {
            return { error: 'No signer' }
        }
        let initWithdraw
        if (!token) {
            initWithdraw = await signer!.sendTransaction({
                to: networkService.addresses.L2StandardBridgeAddress, // L2StandardBridge
                value: amount,
            })
        } else {
            const tokenContract = new ethers.Contract(
                token.address,
                L2StandardERC20ABI,
                networkService.provider!.getSigner()
            )

            const allowance = await tokenContract.allowance(
                signer.getAddress(),
                networkService.addresses.L2StandardBridgeAddress
            )

            if (allowance.toString() < amount) {
                const approveTx = await tokenContract!.approve(
                    networkService.addresses.L2StandardBridgeAddress, // todo L2StandardBridge CHECK AGAIN
                    amount
                )
                await approveTx.wait()
            }

            initWithdraw = await networkService
                .L2StandardBridgeContract!.connect(signer)
                .withdraw(token.address, amount, 30000, '0x')
        }

        const receipt = await initWithdraw.wait()

        return receipt.blockNumber
    } catch (error) {
        console.log(`error handle initiate withdrawal`, error)
        return null
    }
}

export const handleProveWithdrawal = async (
    networkService: MinimalNetworkService,
    txInfo: IHandleProveWithdrawalConfig
) => {
    try {
        if (
            !networkService.OptimismPortal ||
            !networkService.L2ToL1MessagePasser ||
            !networkService.L2OutputOracle
        ) {
            return { error: 'OptimismPortal / L2ToL1MessagePasser not initialized!' }
        }

        let logs = await anchorageGraphQLService.findWithdrawalMessagesPassed([
            txInfo.blockNumber.toString(),
        ])

        if (txInfo.withdrawalHash) {
            logs = logs.filter((b) => b!.withdrawalHash === txInfo.withdrawalHash)
        }

        if (!logs || logs.length !== 1 || !logs[0]) {
            return Promise.reject({ error: 'length not 1' })
        }

        const types = [
            'uint256',
            'address',
            'address',
            'uint256',
            'uint256',
            'bytes',
        ]
        const encoded = defaultAbiCoder.encode(types, [
            logs[0].nonce,
            logs[0].sender,
            logs[0].target,
            logs[0].value,
            logs[0].gasLimit,
            logs[0].data,
        ])

        const slot = keccak256(encoded)
        const withdrawalHash = logs[0].withdrawalHash
        if (withdrawalHash !== slot) {
            return { error: 'Widthdraw hash does not match' }
        }
        const messageSlot = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['bytes32', 'uint256'],
                [slot, ethers.constants.HashZero]
            )
        )

        if (!networkService.provider) {
            return { error: 'Networkservice provider not set' }
        }

        const filter = txInfo.blockHash
            ? { blockHash: txInfo.blockHash }
            : { blockNumber: txInfo.blockNumber }

        console.log('requesting proof...')
        const proof = await networkService.L2Provider!.send('eth_getProof', [
            networkService.addresses.L2ToL1MessagePasser,
            [messageSlot],
            filter,
        ])

        console.log('proof requested!', proof)

        // waiting period before claiming
        let latestBlockOnL1 =
            await networkService.L2OutputOracle.latestBlockNumber()
        while (latestBlockOnL1 < txInfo.blockNumber) {
            await new Promise((resolve) => setTimeout(resolve, 12000))
            latestBlockOnL1 = await networkService.L2OutputOracle.latestBlockNumber()
        }

        const l2OutputIndex =
            await networkService.L2OutputOracle.getL2OutputIndexAfter(
                txInfo.blockNumber
            )
        const proposal =
            await networkService.L2OutputOracle.getL2Output(l2OutputIndex)
        const proposalBlockNumber = proposal.l2BlockNumber
        const proposalBlock = await networkService.L2Provider!.send(
            'eth_getBlockByNumber',
            [proposalBlockNumber.toNumber(), false]
        )

        const signer = await networkService.provider?.getSigner()
        console.log(`sending request with signer!!`, signer)
        const proveTx = await networkService.OptimismPortal.connect(
            signer
        ).proveWithdrawalTransaction(
            [
                logs[0].nonce,
                logs[0].sender,
                logs[0].target,
                logs[0].value,
                logs[0].gasLimit,
                logs[0].data,
            ],
            l2OutputIndex,
            [
                ethers.constants.HashZero,
                proposalBlock.stateRoot,
                proof.storageHash,
                proposalBlock.hash,
            ],
            proof.storageProof[0].proof,
            {
                gasLimit: 7_000_000,
            }
        )
        console.log(`waiting for !!`)
        await proveTx.wait()
        return logs
    } catch (error) {
        console.log(`Err: proveWithdrwal`, error)
        throw new Error('Failed to prove withdrawal!')
    }
}

export const claimWithdrawal = async (networkService: MinimalNetworkService, logs: GQL2ToL1MessagePassedEvent[]) => {
    const gasEstimationFinalSubmit = async () => {
        if (!networkService.OptimismPortal || !logs[0]) {
            return { error: 'OptimismPortal not initialized' }
        }
        const gas =
            await networkService.OptimismPortal.estimateGas.finalizeWithdrawalTransaction(
                [
                    logs[0].nonce,
                    logs[0].sender,
                    logs[0].target,
                    logs[0].value,
                    logs[0].gasLimit,
                    logs[0].data,
                ]
            )
        await new Promise((resolve) =>
            setTimeout(() => {
                resolve(gas)
            }, 2000)
        )
    }

    while (true) {
        try {
            await gasEstimationFinalSubmit()
            break
        } catch (e) {
            await new Promise((resolve) => setTimeout(resolve, 5000))
            console.warn(
                `Failed to get gas estimation for finalizeWithdrawalTransaction`
            )
        }
    }

    const finalSubmitTx = await networkService
        .OptimismPortal!.connect(networkService.provider!.getSigner())
        .finalizeWithdrawalTransaction([
            logs[0].nonce,
            logs[0].sender,
            logs[0].target,
            logs[0].value,
            logs[0].gasLimit,
            logs[0].data,
        ])
    return finalSubmitTx.wait()
}

export const checkBridgeWithdrawalReenter =
    async (networkService: MinimalNetworkService): Promise<IReenterWithdrawConfig | null> => {
        return anchorageGraphQLService
            .queryWithdrawalTransactionsHistory(
                networkService.L1Provider,
                networkService.L2Provider,
                networkService.account,
                networkService.networkConfig!
            )
            .then((events: any) => {
                // we should skip all finalized events and only send the latest on bridge.
                const filterEvents = events.filter(
                    (e: any) => e.UserFacingStatus !== WithdrawState.finalized
                )
                if (filterEvents?.length > 0 && filterEvents[0]?.actionRequired) {
                    return filterEvents[0].actionRequired
                } else {
                    return null
                }
            })
            .catch((error) => {
                console.log(`error while fetching history`, error)
                return null
            })
    }

    //#endregion
