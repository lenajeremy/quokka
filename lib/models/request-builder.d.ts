import { QuokkaApiMutationParams, QuokkaApiQueryParams } from "../types/quokka";
import { QuokkaApiMutation } from "./api-mutation";
import { QuokkaApiQuery } from "./api-query";
import { QuokkaApi } from "./quokka-api";
import { TagType } from "../types";
export declare class QuokkaRequestBuilder<TagString> {
    query: <Takes, Returns>(val: (args: Takes) => QuokkaApiQueryParams<TagString, Returns>, options?: {
        providesTags?: TagType<TagString, Returns>;
    }) => QuokkaApiQuery<Takes, Returns, TagString>;
    mutation: <Takes, Returns>(val: (args: Takes) => QuokkaApiMutationParams<TagString, Returns>, options?: {
        invalidatesTags?: TagType<TagString, Returns>;
    }) => QuokkaApiMutation<Takes, Returns, TagString>;
    api: QuokkaApi<any, any>;
    constructor(api: QuokkaApi<any, any>);
}
