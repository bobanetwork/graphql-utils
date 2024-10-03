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
        networkName: 'ETH Mainnet',
        withdrawalHash: ["0xf9ee30fb9e9da3b68ed392927bf7fdfc07239c2ac91cde3b30296b326ddf2333"]
    },
    {
        fromAddress: "0x9703d3b2521f3de2d56831f3df9490cbb1487428",
        chainId: 11155111,
        networkName: 'Sepolia',
        withdrawalHash: ["0x93af1218baa50ff136e9b231360ad727828add096d6035eeae64416194706b11"]
    },
    {
        fromAddress: "0x9703d3b2521f3de2d56831f3df9490cbb1487428",
        chainId: 97,
        networkName: 'BNB Testnet',
        withdrawalHash: ["0x0a41cc0067341b3cf425c14183ffce33d1f1c454587d949b1ee00d9fffd2d243"]
    },
]

const depositNeworkMap = [
    {
        fromAddress: "0xd134a7d9485c1aac0cbf82718cf6d6e3fd130945",
        name: "Mainnet L1 => L2",
        config: {
            L1: {
                chainId: 1,
                name: "ETH Mainnet"
            },
            L2: {
                chainId: 288,
                name: "Boba ETH"
            }
        }
    },
    {
        fromAddress: "0xcba34cb1524a00cda30de92e373261f76abd5014",
        name: "Sepolia L1 => L2",
        config: {
            L1: {
                chainId: 11155111,
                name: "ETH Sepolia"
            },
            L2: {
                chainId: 28882,
                name: "Boba ETH Sepolia"
            }
        }
    },
    {
        fromAddress: "0x9703d3b2521f3de2d56831f3df9490cbb1487428",
        name: "BNB Testnet L1 => L2",
        config: {
            L1: {
                chainId: 97,
                name: "BNB Testnet"
            },
            L2: {
                chainId: 9728,
                name: "Boba BNB Testnet"
            }
        }
    }
]

describe('Anchorage Service: Integration Test', function () {

    describe('should find: DepositFinalized txs', () => {
        depositNeworkMap.forEach((info) => {
            it(`${info.name}`, async () => {
                const res = await anchorageGraphQLService.queryDepositTransactions(
                    new JsonRpcProvider("https://boba-ethereum.gateway.tenderly.co"),
                    info.fromAddress,
                    info.config
                )

                expect(res[0].originChainId).toBeDefined();
                expect(res[0].destinationChainId).toBeDefined();
                expect(res[0].from).toEqual(info.fromAddress);
                expect(res[0].to).toEqual(info.fromAddress);
                expect(res[0].action.status).toEqual("succeeded");
            });
        })
    })


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

    describe('should find MessagePassed Events', () => {
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

    describe('should find: WithdrawalProven Events', () => {
        l1NetworkMap.forEach((info) => {
            it(`${info.networkName}`, async () => {
                const res = await anchorageGraphQLService
                    .findWithdrawalsProven(info.withdrawalHash, info.chainId)

                expect(res[0].__typename).toEqual('WithdrawalProven')
                expect(res[0].transactionHash_).toBeDefined();
                expect(res[0].withdrawalHash).toEqual(info.withdrawalHash[0]);
            });
        })
    })
    describe('should find: WithdrawalFinalized Events', () => {
        l1NetworkMap.forEach((info) => {
            it(`${info.networkName}`, async () => {
                const res = await anchorageGraphQLService
                    .findWithdrawalsFinalized(info.withdrawalHash, info.chainId)

                expect(res[0].__typename).toEqual('WithdrawalFinalized')
                expect(res[0].transactionHash_).toBeDefined();
                expect(res[0].withdrawalHash).toEqual(info.withdrawalHash[0]);
                expect(res[0].success).toBeTruthy();
            });
        })
    })
});