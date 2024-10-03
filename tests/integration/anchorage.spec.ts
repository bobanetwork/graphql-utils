import {anchorageGraphQLService} from "../../src";
import {JsonRpcProvider} from "@ethersproject/providers";

const l2NetworkMap = [
    {
        fromAddress: "0x3256bd6fc8b5fa48db95914d0df314465f3f7879",
        chainId: 288,
        networkName: 'Boba ETH',
        isBnb: false,
        withdrawalHash: "0x15fd4589111a601b83ce513c508ceb0fb6dbafa5b4f5b42f24bc793eebc67e72",
        blocks: ["3210114"]
    },
    {
        fromAddress: "0x78b4507e3303caa40d20c23316e2f5795857ab85",
        chainId: 56288,
        networkName: 'Boba BNB',
        isBnb: true,
        blocks: [],
        withdrawalHash: ''
    },
    {
        fromAddress: "0x81654daa2e297a140ca01f12367a4d9c9fc2bf51",
        chainId: 28882,
        networkName: 'Boba Sepolia',
        isBnb: false,
        withdrawalHash: "0xf641739d3dbb873ec526178b01d6162143a981488d0333f314b19533e1e1864b",
        blocks: ["3876531"]
    },
    {
        fromAddress: "0x9703d3b2521f3de2d56831f3df9490cbb1487428",
        chainId: 9728,
        networkName: 'Boba BNB Testnet',
        isBnb: true,
        withdrawalHash: "0x02769bf89904174f8a4bf3da22b7c8dad6dccd5683ac4350874317f69be25b18",
        blocks: ["715312"]
    },
]

const l1NetworkMap = [
    {
        fromAddress: "0x3256bd6fc8b5fa48db95914d0df314465f3f7879",
        chainId: 1,
        networkName: 'ETH Mainnet'
    },
    {
        fromAddress: "0x9703d3b2521f3de2d56831f3df9490cbb1487428",
        chainId: 11155111,
        networkName: 'Sepolia'
    },
    {
        fromAddress: "0x9703d3b2521f3de2d56831f3df9490cbb1487428",
        chainId: 97,
        networkName: 'BNB Testnet'
    },
]

describe('Anchorage: Integration Test', function () {
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

    describe('should find WithdrawalsInitiated events', () => {
        l2NetworkMap.forEach((info) => {
            test(`${info.networkName}`, async () => {
                const res = await anchorageGraphQLService
                    .findWithdrawalsInitiated(
                        info.fromAddress,
                        info.chainId)
                expect(res[0].__typename).toEqual('WithdrawalInitiated')
                expect(res[0].transactionHash_).toBeDefined();
                expect(res[0].block_number).toBeDefined();
                expect(res[0].timestamp_).toBeDefined();
            })
        })
    })

    describe('should find WithdrawalsInitiatedBnb events', () => {
        l2NetworkMap.forEach((info) => {
            if (!info.isBnb) {
                return;
            }
            if (info.chainId === 56288) {
                // skip incase of mainnet bnb as anchorage yet to be release on bnb mainnet.
                return;
            }
            test(`${info.networkName}`, async () => {
                const res = await anchorageGraphQLService
                    .findWithdrawalsInitiatedBnb(
                        info.fromAddress,
                        info.chainId)
                const ethRes = res.find((d: any) => d.__typename === "ETHBridgeInitiated")
                const ercRes = res.find((d: any) => d.__typename === "ERC20BridgeInitiated")
                console.log(ethRes);
                expect(ethRes.__typename).toEqual('ETHBridgeInitiated')
                expect(ethRes.block_number).toBeDefined();
                expect(ethRes.timestamp_).toBeDefined();
                expect(ercRes.__typename).toEqual('ERC20BridgeInitiated')
                expect(ercRes.transactionHash_).toBeDefined();
                expect(ercRes.block_number).toBeDefined();
                expect(ercRes.timestamp_).toBeDefined();
            })
        })
    })

    describe('MessagePassed Events', () => {
        l2NetworkMap.forEach((info) => {
            if (info.chainId === 56288) {
                // skip incase of mainnet bnb as anchorage yet to be release on bnb mainnet.
                return;
            }
            test(`${info.networkName} using WithdrawalHash`, async () => {
                const res = await anchorageGraphQLService.findWithdrawalMessagedPassed(
                    info.withdrawalHash,
                    info.chainId)
                expect(res[0].__typename).toEqual("MessagePassed");
                expect(res[0].transactionHash_).toBeDefined()
                expect(res[0].timestamp_).toBeDefined()
                expect(res[0].block_number).toBeDefined()
            })
            test(`${info.networkName} using block number`, async () => {
                const res = await anchorageGraphQLService.findWithdrawalMessagesPassed(
                    info.blocks,
                    info.chainId)
                expect(res[0].__typename).toEqual("MessagePassed");
                expect(res[0].transactionHash_).toBeDefined()
                expect(res[0].timestamp_).toBeDefined()
                expect(res[0].block_number).toBeDefined()
            })
        })
    })

});