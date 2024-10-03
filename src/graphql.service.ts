import {
    ApolloClient,
    DocumentNode,
    gql,
    HttpLink,
    InMemoryCache,
} from '@apollo/client/core'
import {BigNumberish} from 'ethers'
import {EGraphQLService} from "./types";
// import { config } from 'dotenv';

// config();

let fetchLib = fetch
if (!fetchLib) {
    fetchLib = require('node-fetch');
}

export class GraphQLService {
    private readonly apikey = process.env.REACT_APP_THE_GRAPH_API_KEY

    private readonly uri = `https://gateway.thegraph.com/api/${this.apikey}/subgraphs/id`

    private withSubgraphId(subgraphId: string) {
        return `${this.uri}/${subgraphId}`
    }

    GRAPHQL_ENDPOINTS = {
        // ETH Mainnet
        1: {
            [EGraphQLService.AnchorageBridge]: {
                gql: this.withSubgraphId('5t1nkHHxvmfUvPjwCzDVeP1SMgTAc814HscCXeE9AAeG')
            },
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('R3R96j3nVT8oWKfS9zBzrPkFfMC283jiQoEitQ2SFvy'),
                local: '',
            },
        },
        // Arbitrum One
        42161: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('48MG6smPELHeemANcRvssCWj8rLpBXKisRzRgmW7Pg7o'),
                local: '',
            },
        },
        // Optimism Mainnet
        10: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('xUD6iaJk38vmWfEkYm5LwkxeTUADCcEtuujfLCJsHac'),
                local: '',
            },
        },
        // Boba ETH
        288: {
            [EGraphQLService.AnchorageBridge]: {
                gql: this.withSubgraphId("BkDvK8QHM8HRHCQtM6CSBjF4ipH1rW4uLBnMGN28JzwM"),
            },
            [EGraphQLService.DAO]: {
                gql: this.withSubgraphId('2p7KCVnBeNSnTVwMfJC9NENtEKwZn6hv45CU4Cf6PczW'),
                local: '',
            },
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('34UUDYdzZFX7afhysqX7JodzKngJmjsFKJDtWsTxi9UA'),
                local: '',
            },
        },
        // Boba BNB
        56288: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('C3ShFVy1GV81GUb9u3Zw1rSQ7oJjegSF3LswvvYa3XgD'),
            },
            [EGraphQLService.AnchorageBridge]: {
                gql: this.withSubgraphId('BmJU8RagxZSKoxwYFVScC7TaJZj9PHGvukXiJhES882a'),
            },
        },
        // BSC
        56: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('4Eoi62aX8V1DCebNX4mzPi7rfceFaRAeZ3xt7AYVowpy'),
                local: '',
            },
        },
        // BNB testnet
        97: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('B8nR7fCE2KFV3oMJcLTDd56p7WQsoPH7wvBRRoqmocP8'),
                local: '',
            },
            [EGraphQLService.AnchorageBridge]: {
                gql: this.withSubgraphId('7bHCzdBfrkEHegRUwKJEkNG5moo6Yv6NmYdA9rQBCufy'),
            },
        },
        // Boba BNB testnet
        9728: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('HnbxKbpVhKeAWQ6jGUZ64wsjcsnEtyyVqU6QMiAsyPR7'),
                local: 'http://127.0.0.1:8002/subgraphs/name/boba/Bridges',
            },
            [EGraphQLService.AnchorageBridge]: {
                gql: this.withSubgraphId('46zszHi762PDutPntNcsLSDvms4eufEugwb26DkVCyzW'),
            },
        },
        // Arbitrum Sepolia
        421614: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('YXCHfzTAzcy5ibTXjwmMkLj5uTEsaGiJvy9cP3YDaAp'),
                local: '',
            },
        },
        // Optimism Sepolia
        11155420: {
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('GANXEysDoWzxiRRVYG9tPch6K6DLRAYAnw7qJ7ph7B2P'),
                local: '',
            },
        },
        // Sepolia
        11155111: {
            [EGraphQLService.AnchorageBridge]: {
                gql: this.withSubgraphId('EYTKAV3BfXULmm8aH2k31zqLgAy3FrTCXW93sFzz4vc4'),
            },
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('BmRWu64ZZQc7m6cBGqwfuZ4QBoBBZ2ijTbziR8PZ2tCv'),
                local: '',
            },
            [EGraphQLService.DisputeGameFactory]: {
                gql: this.withSubgraphId('366aAux7wdCaJDZCqFRYQCAu9EcsvKn1KEMFMmAcVGb4')
            }
        },
        // Boba Sepolia
        28882: {
            [EGraphQLService.AnchorageBridge]: {
                gql: this.withSubgraphId('AKb9A3KPkMtwm9TPMtUxKH75yZXHyrY5PCwwCcmzQpMj'),
            },
            [EGraphQLService.LightBridge]: {
                gql: this.withSubgraphId('CdmAWxs3LDCnm4jekfcdPxaLsFynuZ3XgeuM7AcdU3xr'),
                local: '',
            },
        },
        // local eth
        31337: {
            [EGraphQLService.LightBridge]: {
                local: 'http://graph-node_eth:8000/subgraphs/name/light-bridge',
            },
        },
        // local bnb
        31338: {
            [EGraphQLService.LightBridge]: {
                local: 'http://graph-node_bnb:8000/subgraphs/name/light-bridge',
            },
        },
    }

    RPC_ENDPOINTS = {
        // Sepolia
        11155111: {
            url: 'https://ethereum-sepolia.publicnode.com/',
        },
    }

    getRpcEndpoint(chainId: number) {
        if (!this.RPC_ENDPOINTS[chainId]) {
            throw new Error("No RPC endpoint for network: " + chainId)
        }
        return this.RPC_ENDPOINTS[chainId]
    }

    getBridgeEndpoint = (chainId, service: EGraphQLService, useLocal = false) => {
        const networkEndpoint = this.GRAPHQL_ENDPOINTS[chainId];
        if (!networkEndpoint) {
            throw new Error("No GraphQL endpoint for network: " + chainId)
        }
        return networkEndpoint[service][useLocal ? 'local' : 'gql']
    }

    async conductQuery(
        query: DocumentNode,
        variables = {},
        sourceChainId: BigNumberish,
        service: EGraphQLService,
        useLocalGraphEndpoint = false
    ) {
        const uri = this.getBridgeEndpoint(
            sourceChainId,
            service,
            useLocalGraphEndpoint
        )
        if (!uri) {
            return
        }
        const client = new ApolloClient({
            uri,
            link: new HttpLink({
                uri,
                fetch: fetchLib,
            }),
            cache: new InMemoryCache(),
        })

        return client.query({
            query,
            variables,
        })
    }

    async queryBridgeProposalCreated({sourceChainId}) {
        const query = gql(
            `query {
          proposalCreateds{
            idParam
            values
            description
            proposer
         }
      }`
        )

        return this.conductQuery(
            query,
            undefined,
            sourceChainId,
            EGraphQLService.DAO
        )
    }
}

export const graphQLService = new GraphQLService()
