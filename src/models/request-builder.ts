import {QuokkaApiMutationParams, QuokkaApiQueryParams} from "../types/quokka";
import {QuokkaApiMutation} from "./api-mutation";
import {QuokkaApiQuery} from "./api-query";

export class QuokkaRequestBuilder {
    query: <Takes, Returns>(
        val: (args: Takes) => QuokkaApiQueryParams,
    ) => QuokkaApiQuery<Takes, Returns>;
    mutation: <Takes, Returns>(
        val: (args: Takes) => QuokkaApiMutationParams,
    ) => QuokkaApiMutation<Takes, Returns>;

    constructor() {
        this.query = function <T, R>(val: (a: T) => QuokkaApiQueryParams) {
            return new QuokkaApiQuery<T, R>(val);
        };

        this.mutation = function <T, R>(val: (a: T) => QuokkaApiMutationParams) {
            return new QuokkaApiMutation<T, R>(val);
        };
    }
}