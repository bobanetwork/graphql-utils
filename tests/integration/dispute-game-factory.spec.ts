import { ethers } from "ethers";
import { EGraphQLService, graphQLService, anchorageGraphQLService } from "../../src";
import { FDGABI } from "../../src/utils";

describe('Anchorage: Integration Test', function () {
    const service = graphQLService;
    it('Dispute Game Factory reachable on: Sepolia', async () => {
        const chainId = 11155111;
        const bridgeEndpoint = service.getBridgeEndpoint(chainId, EGraphQLService.DisputeGameFactory);
        expect(bridgeEndpoint).toEqual(graphQLService.GRAPHQL_ENDPOINTS[chainId][EGraphQLService.DisputeGameFactory].gql)
    });

    it('Latest submitted Block reachable on: Sepolia', async () => {
        const chainId = 11155111;
        const res = await anchorageGraphQLService.getLatestFDGSubmittedBlock(chainId);
        expect(res).toBeGreaterThan(0)
    });

    it('Submitted Block reachable on: Sepolia', async () => {
        const chainId = 11155111;
        const latestL2BlockNumber = await anchorageGraphQLService.getLatestFDGSubmittedBlock(chainId);
        expect(latestL2BlockNumber).toBeGreaterThan(0)
    });

    it('Get root claim from submissions', async () => {
        const chainId = 11155111;
        const testingL2BlockNumber = 8790790;

        const case1 = await anchorageGraphQLService.getRootClaimOfFDGSubmission(chainId, testingL2BlockNumber);
        expect(case1.status).toEqual("success");
        expect(case1.id.toLowerCase()).toEqual(("0x83Ef33E9Ada93ef0040c8C550195fB1018128c9d").toLowerCase());
        expect(case1.l2BlockNumber).toEqual(8790794);
        expect(case1.rootClaim.toLowerCase()).toEqual("0xce9110ddcada4c1df37bcdf398d048f0af92da59eee205c506726264e5aeecd3");
        expect(case1.index).toEqual(596);

        const testingL2BlockNumber2 = 8790794;
        const case2 = await anchorageGraphQLService.getRootClaimOfFDGSubmission(chainId, testingL2BlockNumber2);
        expect(case2.status).toEqual("success");
        expect(case2.id.toLowerCase()).toEqual(("0x83Ef33E9Ada93ef0040c8C550195fB1018128c9d").toLowerCase());
        expect(case2.l2BlockNumber).toEqual(8790794);
        expect(case2.rootClaim.toLowerCase()).toEqual("0xce9110ddcada4c1df37bcdf398d048f0af92da59eee205c506726264e5aeecd3");
        expect(case2.index).toEqual(596);

        const latestL2BlockNumber = await anchorageGraphQLService.getLatestFDGSubmittedBlock(chainId);
        const case3 = await anchorageGraphQLService.getRootClaimOfFDGSubmission(chainId, latestL2BlockNumber + 10);
        expect(case3.status).toEqual("error");
        expect(case3.error).toEqual("No submission found for the given block number");
    });
});