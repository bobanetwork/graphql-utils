export const filterLatestGroupedSupportedTokens = (
    tokenSupportedEvents
): Array<any> => {
    const groupedEvents = tokenSupportedEvents.reduce((acc, event) => {
        if (
            !acc[event.token] ||
            event.block_number > acc[event.token].block_number
        ) {
            acc[event.token] = event
        }
        return acc
    }, {})

    return Object.values(groupedEvents).filter(
        (event: any) => event.supported === true
    )
}

/**
 * Retain the old data structure prior the graph / goldsky
 * @param data
 */
export const retainOldStructure = (data: any[]) => {
    return data.map(d => {
        const {blockNumber, blockTimestamp, transactionHash, ...rest} = d;
        return {
            ...rest,
            block_number: blockNumber,
            timestamp_: blockTimestamp,
            transactionHash_: transactionHash,
        };
    });
}