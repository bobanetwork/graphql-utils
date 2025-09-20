import {EGraphQLService} from "../types";
import {filterLatestGroupedSupportedTokens, retainOldStructure} from "../utils";
import {GraphQLService} from "../graphql.service";
import {
    LightBridgeAssetReceivedEvent, LightBridgeDisbursementFailedEvent, LightBridgeDisbursementRetrySuccessEvent,
    LightBridgeDisbursementSuccessEvent,
    LightBridgeSupportedRouteEvents
} from "./types";
import {BigNumberish} from "ethers";
import {gql} from "@apollo/client/core";

export class LightBridgeGraphQLService extends GraphQLService {
    useLocal = false

    /** @param sourceChainId: Mandatory since it is also being used for determining the graphQl endpoint. */
    async queryAssetReceivedEvent(
        sourceChainId: string | number,
        targetChainId?: string | number,
        walletAddress?: string,
        startBlock?: string | number,
        toBlock?: string | number,
        minDepositId?: string | number,
        contract?: string,
        orderBy?: string,
        orderDirection?: 'asc' | 'desc',
        first?: number
    ): Promise<LightBridgeAssetReceivedEvent[]> {
        // contract:  in the graph it is case insensitive and nocase only exists in Goldsky
        const query = gql(`query Teleportation(
        $wallet: String, 
        $sourceChainId: BigInt,
        $targetChainId: BigInt,
        $startBlock: BigInt,
        $toBlock: BigInt,
        $minDepositId: BigInt,
        $contract: Bytes,
        ) {
            assetReceiveds(
              where: {and: [
              ${minDepositId ? `{depositId_gte: $minDepositId},` : ''}
              ${startBlock ? `{block_number_gte: $startBlock},` : ''}
              ${toBlock ? `{block_number_lte: $toBlock},` : ''}
              ${walletAddress ? `{emitter_contains: $wallet},` : ''} 
              ${sourceChainId ? `{ sourceChainId: $sourceChainId },` : ''} 
              ${targetChainId ? `{ toChainId: $targetChainId },` : ''}
              ${contract ? `{ contract: $contract }` : ''}
              ]}
              ${orderBy ? `orderBy: ${orderBy}` : ''}
              ${orderDirection ? `orderDirection: ${orderDirection}` : ''}
              ${first ? `first: ${first}` : ''}
            ) {
              token
              sourceChainId
              toChainId
              depositId
              emitter
              amount
              blockNumber
              blockTimestamp
              transactionHash
            }
          }`)

        const variables = {
            startBlock,
            toBlock,
            wallet: walletAddress,
            sourceChainId: sourceChainId,
            targetChainId: targetChainId,
            minDepositId,
            contract,
        }

        return retainOldStructure(
            (
                await this.conductQuery(
                    query,
                    variables,
                    sourceChainId,
                    EGraphQLService.LightBridge,
                    this.useLocal
                )
            )?.data?.assetReceiveds
        );
    }

    async queryDisbursementSuccessEvent(
        walletAddress: string,
        sourceChainId: number | string,
        destChainId: number | string,
        token: string,
        depositId: number | string
    ): Promise<LightBridgeDisbursementSuccessEvent | undefined> {
        if (!token) {
            return undefined
        }
        const query =
            gql(`query Teleportation($wallet: String!, $sourceChainId: BigInt!, $token: String!, $depositId: String!) {
  disbursementSuccesses(
    where: { and: [{ to_contains: $wallet }, { sourceChainId: $sourceChainId }, { token_contains: $token }, { depositId: $depositId }] }
  ) {
    depositId
    to
    token
    amount
    sourceChainId
    blockNumber
    blockTimestamp
    transactionHash
  }
}
`)

        const variables = {
            wallet: walletAddress,
            sourceChainId: sourceChainId.toString(),
            token,
            depositId: depositId.toString(),
        }
        const events = retainOldStructure((
            await this.conductQuery(
                query,
                variables,
                destChainId,
                EGraphQLService.LightBridge,
                this.useLocal
            )
        )?.data?.disbursementSuccesses)

        if (events?.length) {
            return events[0] // just first (should always just be one)
        }
        return undefined
    }

    async queryDisbursementFailedEvent(
        walletAddress: string,
        sourceChainId: number | string,
        destChainId: number | string,
        depositId: number | string
    ): Promise<LightBridgeDisbursementFailedEvent | undefined> {
        const query =
            gql(`query Teleportation($wallet: String!, $sourceChainId: BigInt!, $depositId: String!) {
  disbursementFaileds(
    where: { and: [{ to_contains: $wallet }, { sourceChainId: $sourceChainId }, { depositId: $depositId }] }
  ) {
    depositId
    to
    amount
    sourceChainId
    blockNumber
    blockTimestamp
    transactionHash
  }
}
`)

        const variables = {
            wallet: walletAddress,
            sourceChainId: sourceChainId.toString(),
            depositId: depositId.toString(),
        }
        const events = retainOldStructure((
            await this.conductQuery(
                query,
                variables,
                destChainId,
                EGraphQLService.LightBridge,
                this.useLocal
            )
        )?.data?.disbursementFaileds)

        if (events?.length) {
            if (events.length > 1) {
                console.warn(
                    'Found more than one disbursementFailedEvent, should always be 1:',
                    events
                )
            }
            return events[0] // just first (should always just be one)
        }
        return undefined
    }

    async queryDisbursementRetrySuccessEvent(
        walletAddress: string,
        sourceChainId: number | string,
        destChainId: number | string,
        depositId: number | string
    ): Promise<LightBridgeDisbursementRetrySuccessEvent | undefined> {
        const query =
            gql(`query Teleportation($wallet: String!, $sourceChainId: BigInt!, $depositId: String!) {
  disbursementRetrySuccesses(
    where: { and: [{ to_contains: $wallet }, { sourceChainId: $sourceChainId }, { depositId: $depositId }] }
  ) {
    depositId
    to
    amount
    sourceChainId
    blockNumber
    blockTimestamp
    transactionHash
  }
}
`)

        const variables = {
            wallet: walletAddress,
            sourceChainId: sourceChainId.toString(),
            depositId: depositId.toString(),
        }
        const events = retainOldStructure((
            await this.conductQuery(
                query,
                variables,
                destChainId,
                EGraphQLService.LightBridge,
                this.useLocal
            )
        )?.data?.disbursementRetrySuccesses)
        if (events?.length) {
            return events[0] // just first (should always just be one)
        }
        return undefined
    }

    async querySupportedTokensBridge(
        currentNetworkId: BigNumberish,
        destChainId: number | string
    ): Promise<LightBridgeSupportedRouteEvents[]> {
        const query = gql(`
    query GetSupportedTokens($toChainId: BigInt!) {
      tokenSupporteds(
        where: { 
          toChainId: $toChainId 
        },
        order_by: { blockNumber: desc }
      ) {
        id
        blockNumber
        blockTimestamp
        transactionHash
        token
        toChainId
        supported
      }
    }
  `)
        const variables = {
            toChainId: destChainId,
        }

        return filterLatestGroupedSupportedTokens(retainOldStructure(
                (
                    await this.conductQuery(
                        query,
                        variables,
                        currentNetworkId,
                        EGraphQLService.LightBridge,
                        this.useLocal
                    )
                )?.data?.tokenSupporteds
            )
        )
    }
}

export const lightBridgeGraphQLService = new LightBridgeGraphQLService()