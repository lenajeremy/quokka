import {QuokkaApiMutationParams, QuokkaApiQueryParams} from "../types/quokka";
import {QuokkaApiMutation} from "./api-mutation";
import {QuokkaApiQuery} from "./api-query";

export class QuokkaRequestBuilder<TagString> {
    query: <Takes, Returns>(
        val: (args: Takes) => QuokkaApiQueryParams<TagString>,
    ) => QuokkaApiQuery<Takes, Returns, TagString>;
    mutation: <Takes, Returns>(
        val: (args: Takes) => QuokkaApiMutationParams<TagString>,
    ) => QuokkaApiMutation<Takes, Returns, TagString>;

    constructor() {
        this.query = function <T, R>(val: (a: T) => QuokkaApiQueryParams<TagString>) {
            return new QuokkaApiQuery<T, R, TagString>(val);
        };

        this.mutation = function <T, R>(val: (a: T) => QuokkaApiMutationParams<TagString>) {
            return new QuokkaApiMutation<T, R, TagString>(val);
        };
    }
}