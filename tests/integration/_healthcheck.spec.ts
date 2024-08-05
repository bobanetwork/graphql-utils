import {graphQLService} from "../../src";
import {ApolloClient, gql, HttpLink, InMemoryCache} from "@apollo/client/core";

describe('Broad Health Check', () => {
    // Ensure that new deployments made are index-error free, have a valid deployment status and are reachable
    it('Ping all sub-graphs for availability, index errors and deployment status', async ()=>  {
        const allGraphs = graphQLService.GRAPHQL_ENDPOINTS;
        const allGraphURIs = [];

        Object.keys(allGraphs).forEach(chainId => {
            Object.keys(allGraphs[chainId]).forEach(graphQlEndpoint => {
                const specificGraph = allGraphs[chainId][graphQlEndpoint];
                if (specificGraph.gql) {
                    allGraphURIs.push(specificGraph.gql);
                }
            })
        })

        const query = gql`
            {
                _meta {
                    hasIndexingErrors
                    block {
                        number
                    }
                    deployment
                }
            }
        `;

        async function testEndpoint(uri) {
            const client = new ApolloClient({
                link: new HttpLink({uri}), cache: new InMemoryCache()
            });

            try {
                const {data} = await client.query({query});
                return {
                    uri,
                    isQueryable: true,
                    data: data._meta
                };
            } catch (error) {
                console.log(`Failing for: ${uri}, with error ${error}`);
                return {
                    uri,
                    isQueryable: false,
                    error: error.message
                };
            }
        }

        for (const uri of allGraphURIs) {
            const result = await testEndpoint(uri);
            expect(result.isQueryable).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data.hasIndexingErrors).toEqual(false);
            expect(result.data.block).toBeDefined();
            expect(result.data.block.number).toBeDefined();
            expect(result.data.deployment).toBeDefined();
        }
    }, 100_000);
});