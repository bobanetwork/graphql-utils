import {
    ApolloClient,
    DocumentNode,
    gql,
    HttpLink,
    InMemoryCache,
} from '@apollo/client/core'
import { BigNumberish } from 'ethers'
import {EGraphQLService} from "./types";

let fetchLib = fetch
if (!fetchLib) {
    fetchLib = require('node-fetch');
}


export class GraphQLService {
    GRAPHQL_ENDPOINTS = {
        // ETH Mainnet
        1: {
            [EGraphQLService.AnchorageBridge]: {
                gql: "https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/anchorage-bridge-mainnet/v1/gn"
            },
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-mainnet/v1/gn',
                local: '',
            },
        },
        // Arbitrum One
        42161: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-arbitrum-one/v1/gn',
                local: '',
            },
        },
        // Optimism Mainnet
        10: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-optimism/v1/gn',
                local: '',
            },
        },
        // Boba ETH
        288: {
            [EGraphQLService.AnchorageBridge]: {
                gql: "https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/anchorage-bridge-boba-eth/v1/gn"
            },
            [EGraphQLService.DAO]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/dao-boba-eth/v1/gn',
                local: '',
            },
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-boba-eth/v1/gn',
                local: '',
            },
        },
        // Boba BNB
        56288: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-boba-bnb/v1/gn',
                local: '',
            },
        },
        // BSC
        56: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-bsc/v1/gn',
                local: '',
            },
        },
        // BNB testnet
        97: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-chapel/v1/gn',
                local: '',
            },
        },
        // Boba BNB testnet
        9728: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-boba-bnb-testnet/v1/gn',
                local: 'http://127.0.0.1:8002/subgraphs/name/boba/Bridges',
            },
        },
        // Arbitrum Sepolia
        421614: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-arbitrum-sepolia/v1/gn',
                local: '',
            },
        },
        // Optimism Sepolia
        11155420: {
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-optimism-sepolia/v1/gn',
                local: '',
            },
        },

        // Sepolia
        11155111: {
            [EGraphQLService.AnchorageBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/anchorage-bridging-sepolia/v1/gn',
            },
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-sepolia/v1/gn',
                local: '',
            },
        },
        // Boba Sepolia
        28882: {
            [EGraphQLService.AnchorageBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/anchorage-bridging-boba-sepolia/v1/gn',
            },
            [EGraphQLService.LightBridge]: {
                gql: 'https://api.goldsky.com/api/public/project_clq6jph4q9t2p01uja7p1f0c3/subgraphs/light-bridge-boba-sepolia/v1/gn',
                local: '',
            },
        },
        // local eth
        31337: {
            [EGraphQLService.LightBridge]: {
                gql: 'http://graph-node_eth:8000/subgraphs/name/light-bridge',
            },
        },
        // local bnb
        31338: {
            [EGraphQLService.LightBridge]: {
                gql: 'http://graph-node_bnb:8000/subgraphs/name/light-bridge',
            },
        },
    }

    getBridgeEndpoint = (chainId, service: EGraphQLService, useLocal = false) => {
        const networkEndpoint = this.GRAPHQL_ENDPOINTS[chainId];
        if (!networkEndpoint) {
            throw new Error("No GraphQL endpoint for network: "+chainId)
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

    async queryBridgeProposalCreated({ sourceChainId }) {
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
