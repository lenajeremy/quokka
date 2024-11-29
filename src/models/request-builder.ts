import {QuokkaApiMutationParams, QuokkaApiQueryParams} from "../types/quokka";
import {QuokkaApiMutation} from "./api-mutation";
import {QuokkaApiQuery} from "./api-query";
import {QuokkaApi} from "./quokka-api";
import {TagType} from "../types";


export class QuokkaRequestBuilder<TagString> {
    query: <Takes, Returns>(
        val: (args: Takes) => QuokkaApiQueryParams<TagString>,
        options?: { providesTags?: TagType<TagString> }
    ) => QuokkaApiQuery<Takes, Returns, TagString>;
    mutation: <Takes, Returns>(
        val: (args: Takes) => QuokkaApiMutationParams<TagString>,
        options?: { invalidatesTags?: TagType<TagString> }
    ) => QuokkaApiMutation<Takes, Returns, TagString>;
    api: QuokkaApi<any, any>

    constructor(api: QuokkaApi<any, any>) {
        this.api = api;
        this.query = function <T, R>(val: (a: T) => QuokkaApiQueryParams<TagString>, options?: {
            providesTags?: TagType<TagString>
        }) {
            return new QuokkaApiQuery<T, R, TagString>(val, this.api, options);
        };

        this.mutation = function <T, R>(val: (a: T) => QuokkaApiMutationParams<TagString>, options?: {
            invalidatesTags?: TagType<TagString>
        }) {
            return new QuokkaApiMutation<T, R, TagString>(val, this.api, options);
        }
    }
}