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
        const latestBlockNumber = await anchorageGraphQLService.getLatestFDGSubmittedBlock(chainId);
        const latestSubmission = await anchorageGraphQLService.getFDGSubmissions(chainId);
        expect(latestSubmission.length).toEqual(1);
        expect(latestSubmission[0].l2BlockNumber).toEqual(latestBlockNumber)

        const submissions = await anchorageGraphQLService.getFDGSubmissions(chainId, latestSubmission[0].index, 5);
        expect(submissions.length).toEqual(5);
        expect(submissions[0].l2BlockNumber).toEqual(latestBlockNumber);
        expect(submissions[0].l2BlockNumber).toBeGreaterThan(submissions[1].l2BlockNumber);
        expect(submissions[0].index).toEqual(submissions[1].index + 1);

        const prevSubmissions = await anchorageGraphQLService.getFDGSubmissions(chainId, submissions[4].index, 5);
        expect(prevSubmissions.length).toEqual(5);
        expect(prevSubmissions[0].l2BlockNumber).toEqual(submissions[4].l2BlockNumber);
        expect(prevSubmissions[0].index).toEqual(submissions[4].index);
    });

    it('Get root claim from submissions', async () => {
        const chainId = 11155111;

        const latestSubmissions = await anchorageGraphQLService.getFDGSubmissions(chainId, null, 20);
        const FDGAddress = latestSubmissions[4].id;
        const rpcEndpoint = anchorageGraphQLService.getRpcEndpoint(Number(chainId));
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
        const FDGContract = new ethers.Contract(FDGAddress, FDGABI, provider);
        const l2BlockNumber = (await FDGContract.l2BlockNumber()).toNumber();

        const testingL2BlockNumber = l2BlockNumber - 10;

        const submission = await anchorageGraphQLService.getRootClaimOfFDGSubmission(chainId, testingL2BlockNumber);
        expect(submission.status).toEqual("success");
        expect(submission.rootClaim).toEqual(latestSubmissions[4].rootClaim);
        expect (submission.l2BlockNumber).toEqual(latestSubmissions[4].l2BlockNumber);
        expect(submission.index).toEqual(latestSubmissions[4].index);

        const submission2 = await anchorageGraphQLService.getRootClaimOfFDGSubmission(chainId, l2BlockNumber);
        expect(submission2.status).toEqual("success");
        expect(submission2.rootClaim).toEqual(latestSubmissions[4].rootClaim);
        expect (submission2.l2BlockNumber).toEqual(latestSubmissions[4].l2BlockNumber);
        expect(submission2.index).toEqual(latestSubmissions[4].index);
    })
});