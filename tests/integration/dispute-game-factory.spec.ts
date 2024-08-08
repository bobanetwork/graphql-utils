import {EGraphQLService, graphQLService} from "../../src";

describe('Anchorage: Integration Test', function () {
    const service = graphQLService;
    it('Dispute Game Factory reachable on: Sepolia', async () => {
        const chainId = 11155111;
        const bridgeEndpoint = service.getBridgeEndpoint(chainId, EGraphQLService.DisputeGameFactory);
        expect(bridgeEndpoint).toEqual(graphQLService.GRAPHQL_ENDPOINTS[chainId][EGraphQLService.DisputeGameFactory].gql)
    });
});