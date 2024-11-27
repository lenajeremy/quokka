import { QuokkaApiMutationParams, QuokkaApiQueryParams } from "../types/quokka";
import { QuokkaApiMutation } from "./api-mutation";
import { QuokkaApiQuery } from "./api-query";
export declare class QuokkaRequestBuilder {
    query: <Takes, Returns>(val: (args: Takes) => QuokkaApiQueryParams) => QuokkaApiQuery<Takes, Returns>;
    mutation: <Takes, Returns>(val: (args: Takes) => QuokkaApiMutationParams) => QuokkaApiMutation<Takes, Returns>;
    constructor();
}
