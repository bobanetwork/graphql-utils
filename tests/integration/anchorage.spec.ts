import {anchorageGraphQLService} from "../../src";
import {JsonRpcProvider} from "@ethersproject/providers";

describe('Anchorage: Integration Test', function () {
    it('should find: WithdrawalInitialized Events', async () => {
        const res = await anchorageGraphQLService
            .findWithdrawalsInitiated(
                "0x3256bd6fc8b5fa48db95914d0df314465f3f7879",
                288)

        // console.log(res);
        expect(res[0].__typename).toEqual('WithdrawalInitiated')
        expect(res[0].transactionHash_).toBeDefined();
        expect(res[0].block_number).toBeDefined();
        expect(res[0].timestamp_).toBeDefined();
    });
    it('should find: WithdrawalsInitiatedBnb Events', async () => {
        const res = await anchorageGraphQLService
            .findWithdrawalsInitiatedBnb(
                "0x77151218e325b201addd457a5940d823b3daa2cd",
                9728)
        expect(res[0].__typename).toEqual('ETHBridgeInitiated')
        expect(res[0].transactionHash_).not.toBeDefined();
        expect(res[0].block_number).toBeDefined();
        expect(res[0].timestamp_).toBeDefined();
    });
    it('should find: WithdrawalProven Events', async () => {
        const res = await anchorageGraphQLService
            .findWithdrawalsProven(
                ["0x5af94d274be0e1a51f32e056deaa3d9dcd6749af3507a9f457985271d971474a"],
                1)

        expect(res[0].__typename).toEqual('WithdrawalProven')
        expect(res[0].transactionHash_).toBeDefined();
        expect(res[0].withdrawalHash).toEqual('0x5af94d274be0e1a51f32e056deaa3d9dcd6749af3507a9f457985271d971474a');
    });
    it('should find: WithdrawalFinalized Events', async () => {
        const res = await anchorageGraphQLService
            .findWithdrawalsFinalized(
                ["0xf9ee30fb9e9da3b68ed392927bf7fdfc07239c2ac91cde3b30296b326ddf2333", "0x10b3b0f1b2d20017e1c1036e1f57a7f0876c62dbf93a2bbeea8010a3fcffe4b2"],
                1)

        expect(res[0].__typename).toEqual('WithdrawalFinalized')
        expect(res[0].transactionHash_).toBeDefined();
        expect(res[0].block_number).toBeDefined();
        expect(res[0].timestamp_).toBeDefined();
        expect(res[0].withdrawalHash).toEqual('0xf9ee30fb9e9da3b68ed392927bf7fdfc07239c2ac91cde3b30296b326ddf2333');
    });
    it('should find: MessagePassed Events via WithdrawalHash', async () => {
        const res = await anchorageGraphQLService.findWithdrawalMessagedPassed(
            '0x15fd4589111a601b83ce513c508ceb0fb6dbafa5b4f5b42f24bc793eebc67e72',
            288)

        expect(res[0].__typename).toEqual("MessagePassed");
        expect(res[0].transactionHash_).toEqual("0x00182e7e904c2a1947c372c21cd1e0efde36badfa249552869861c588c5facf9")
        expect(res[0].timestamp_).toEqual("1717425069")
    });
    it('should find: MessagePassed Events via Block range', async () => {
        const res = await anchorageGraphQLService.findWithdrawalMessagesPassed(
            [
                "3210114",
                "3210116"
            ], 288)

        expect(res[0].__typename).toEqual("MessagePassed");
        expect(res[0].transactionHash_).toEqual("0x00182e7e904c2a1947c372c21cd1e0efde36badfa249552869861c588c5facf9")
        expect(res[0].timestamp_).toEqual("1717425069")
    });
    it('should find: DepositTransactions', async () => {
        const res = await anchorageGraphQLService.findWithdrawalMessagesPassed(
            [
                "3210114",
                "3210116"
            ], 288)

        expect(res[0].__typename).toEqual("MessagePassed");
        expect(res[0].transactionHash_).toEqual("0x00182e7e904c2a1947c372c21cd1e0efde36badfa249552869861c588c5facf9")
        expect(res[0].timestamp_).toEqual("1717425069")
    });
    it('should find: DepositTransactions, map them and return the transactions', async () => {
        const res = await anchorageGraphQLService.queryDepositTransactions(
            new JsonRpcProvider("https://boba-ethereum.gateway.tenderly.co"),
            "0xd134a7d9485c1aac0cbf82718cf6d6e3fd130945",
            {
                L1: {
                    chainId: 1,
                    name: "name"
                },
                L2: {
                    chainId: 288,
                    name: "name"
                }
            }
        )

        expect(res[0].originChainId).toEqual(1);
        expect(res[0].destinationChainId).toEqual(288);
        expect(res[0].from).toEqual("0xd134a7d9485c1aac0cbf82718cf6d6e3fd130945");
        expect(res[0].to).toEqual("0xd134a7d9485c1aac0cbf82718cf6d6e3fd130945");
        expect(res[0].action.status).toEqual("succeeded");
    });
});