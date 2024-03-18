import {EGraphQLService} from "../types";
import {filterLatestGroupedSupportedTokens} from "../utils";
import {GraphQLService} from "../graphql.service";
import {LightBridgeAssetReceivedEvent, LightBridgeDisbursementSuccessEvent} from "./types";
import {BigNumberish} from "ethers";
import {gql} from "@apollo/client";

export class LightBridgeGraphQLService extends GraphQLService {
    useLocal = false

    async queryAssetReceivedEvent(
        walletAddress: string,
        sourceChainId: BigNumberish,
        targetChainId: BigNumberish
    ): Promise<LightBridgeAssetReceivedEvent[]> {
        const query = gql(`query Teleportation($wallet: String!, 
        $sourceChainId: BigInt!,
        $targetChainId: BigInt!
        ) {
            assetReceiveds(
              where: {and: [{emitter_contains_nocase: $wallet}, { sourceChainId: $sourceChainId }, { toChainId: $targetChainId }]}
            ) {
              token
              sourceChainId
              toChainId
              depositId
              emitter
              amount
              block_number
              timestamp_
              transactionHash_
            }
          }`)

        const variables = {
            wallet: walletAddress,
            sourceChainId: sourceChainId.toString(),
            targetChainId: targetChainId.toString(),
        }

        return (
            await this.conductQuery(
                query,
                variables,
                sourceChainId,
                EGraphQLService.LightBridge,
                this.useLocal
            )
        )?.data?.assetReceiveds
    }

    async queryDisbursementSuccessEvent(
        walletAddress: string,
        sourceChainId: BigNumberish,
        destChainId: BigNumberish,
        token: string,
        amount: BigNumberish,
        depositId: BigNumberish
    ): Promise<LightBridgeDisbursementSuccessEvent | undefined> {
        if (!token) {
            return undefined
        }
        const query =
            gql(`query Teleportation($wallet: String!, $sourceChainId: BigInt!, $token: String!, $amount: String!, $depositId: String!) {
  disbursementSuccesses(
    where: { and: [{ to_contains_nocase: $wallet }, { sourceChainId: $sourceChainId }, { token_contains_nocase: $token }, { amount: $amount }, { depositId: $depositId }] }
  ) {
    depositId
    to
    token
    amount
    sourceChainId
    block_number
    timestamp_
    transactionHash_
  }
}
`)

        const variables = {
            wallet: walletAddress,
            sourceChainId: sourceChainId.toString(),
            token,
            amount: amount.toString(),
            depositId: depositId.toString(),
        }
        const events = (
            await this.conductQuery(
                query,
                variables,
                destChainId,
                EGraphQLService.LightBridge,
                this.useLocal
            )
        )?.data?.disbursementSuccesses
        if (events?.length) {
            return events[0] // just first (should always just be one)
        }
        return undefined
    }

    async queryDisbursementFailedEvent(
        walletAddress: string,
        sourceChainId: BigNumberish,
        destChainId: BigNumberish,
        amount: BigNumberish,
        depositId: BigNumberish
    ) {
        const query =
            gql(`query Teleportation($wallet: String!, $sourceChainId: BigInt!, $amount: String!, $depositId: String!) {
  disbursementFaileds(
    where: { and: [{ to_contains_nocase: $wallet }, { sourceChainId: $sourceChainId }, { amount: $amount }, { depositId: $depositId }] }
  ) {
    depositId
    to
    amount
    sourceChainId
    block_number
    timestamp_
    transactionHash_
  }
}
`)

        const variables = {
            wallet: walletAddress,
            sourceChainId: sourceChainId.toString(),
            amount: amount.toString(),
            depositId: depositId.toString(),
        }
        const events = (
            await this.conductQuery(
                query,
                variables,
                destChainId,
                EGraphQLService.LightBridge,
                this.useLocal
            )
        )?.data?.disbursementFaileds
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
        sourceChainId: BigNumberish,
        destChainId: BigNumberish,
        amount: BigNumberish,
        depositId: BigNumberish
    ) {
        const query =
            gql(`query Teleportation($wallet: String!, $sourceChainId: BigInt!, $amount: String!, $depositId: String!) {
  disbursementRetrySuccesses(
    where: { and: [{ to_contains_nocase: $wallet }, { sourceChainId: $sourceChainId }, { amount: $amount }, { depositId: $depositId }] }
  ) {
    depositId
    to
    amount
    sourceChainId
    block_number
    timestamp_
    transactionHash_
  }
}
`)

        const variables = {
            wallet: walletAddress,
            sourceChainId: sourceChainId.toString(),
            amount: amount.toString(),
            depositId: depositId.toString(),
        }
        const events = (
            await this.conductQuery(
                query,
                variables,
                destChainId,
                EGraphQLService.LightBridge,
                this.useLocal
            )
        )?.data?.disbursementRetrySuccesses
        if (events?.length) {
            return events[0] // just first (should always just be one)
        }
        return undefined
    }

    async querySupportedTokensBridge(
        currentNetworkId: any,
        tokens: Array<string>,
        destChainId: BigNumberish
    ) {
        const query = gql(`
    query GetSupportedTokens($tokens: [String!]!, $toChainId: BigInt!) {
      tokenSupporteds(
        where: { 
          token_in: $tokens, 
          toChainId: $toChainId 
        },
        order_by: { block_number: desc }
      ) {
        id
        block_number
        timestamp_
        transactionHash_
        contractId_
        token
        toChainId
        supported
      }
    }
  `)
        const variables = {
            tokens,
            toChainId: destChainId,
        }

        return filterLatestGroupedSupportedTokens(
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
    }
}
