import {lightBridgeGraphQLService} from "../../src";

describe('LightBridge Integration Test', function () {
    it('should query AssetReceivedEvent', async () => {
        const res = await lightBridgeGraphQLService.queryAssetReceivedEvent(288);
        expect(res[0].block_number).toBeDefined();
        expect(res[0].token).toBeDefined()
        expect(res[0].sourceChainId).toBeDefined()
        expect(res[0].toChainId).toBeDefined()
        expect(res[0].depositId).toBeDefined()
        expect(res[0].emitter).toBeDefined()
        expect(res[0].amount).toBeDefined()
        expect(res[0].transactionHash_).toBeDefined()
        expect(res[0].block_number).toBeDefined()
        expect(res[0].timestamp_).toBeDefined()
    });
    it('should query SupportedTokens', async () => {
        const res = await lightBridgeGraphQLService.querySupportedTokensBridge(288, 1);
        expect(res[0].block_number).toBeDefined();
        expect(res[0].supported).toBeDefined();
        expect(res[0].token).toBeDefined()
        expect(res[0].toChainId).toBeDefined()
        expect(res[0].transactionHash_).toBeDefined()
        expect(res[0].block_number).toBeDefined()
        expect(res[0].timestamp_).toBeDefined()
    });
    it('should query DisbursementSuccessEvent', async () => {
        const res = await lightBridgeGraphQLService
            .queryDisbursementSuccessEvent(
                "0x54f0c2d2e4898128a351641358bc28836a2692da",
                28882,
                11155111,
                '0x0000000000000000000000000000000000000000',
                "3");

        expect(res.__typename).toEqual("DisbursementSuccess")
        expect(res.transactionHash_).toBeDefined()
        expect(res.block_number).toBeDefined()
        expect(res.timestamp_).toBeDefined()
        expect(res.block_number).toBeDefined();
    });
});