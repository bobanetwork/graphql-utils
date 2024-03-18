import {JsonRpcProvider, Network} from "@ethersproject/providers";
import {Contract} from "ethers";

export enum EGraphQLService {
    AnchorageBridge = 1,
    LightBridge = 2,
    DAO = 3,
}

export type MinimalNetworkConfig = {
    L2: {
        name: string,
        chainId: string,
    },
    L1: {
        name: string,
        chainId: string,
    }
}

export type MinimalNetworkService = {
    account?: string
    L1Provider?: JsonRpcProvider
    L2Provider?: JsonRpcProvider
    provider?: JsonRpcProvider
    chainId?: number
    environment?: string
    L1orL2?: 'L2' | 'L1'
    networkGateway?: Network

    //#region contract_members
    L1_TEST_Contract?: Contract
    L2_TEST_Contract?: Contract
    L2_ETH_Contract?: Contract
    BobaContract?: Contract
    xBobaContract?: Contract
    delegateContract?: Contract
    gasOracleContract?: Contract
    L1StandardBridgeContract?: Contract
    L2StandardBridgeContract?: Contract
    LightBridge?: Contract
    L1LPContract?: Contract
    L2LPContract?: Contract

    //#region Anchorage specific
    L2ToL1MessagePasser?: Contract
    L2OutputOracle?: Contract
    OptimismPortal?: Contract
    //#endregion
    //#endregion

    L1GasLimit: number
    L2GasLimit: number
    gasEstimateAccount?: string
    supportedTokens: string[]
    supportedAltL1Chains: string[]
    addresses
    network?: Network
    networkConfig?: MinimalNetworkConfig

    L1NativeTokenSymbol
    L1NativeTokenName?: string
}