import { QuokkaApiAction } from "./api-action";
import { CreateApiOptions, MutationHook, QuokkaApiMutationParams } from "../types/quokka";
import { MutationHookType, TagType } from "../types";
import { QuokkaApi } from "./quokka-api";
import { CacheManager } from "../cache";
export declare class QuokkaApiMutation<Takes, Returns, TagString> extends QuokkaApiAction<(a: Takes) => QuokkaApiMutationParams<TagString>, MutationHookType, MutationHook<Takes, Returns, Error>> {
    tags?: TagType<TagString>;
    constructor(generateParams: (a: Takes) => QuokkaApiMutationParams<TagString>, api: QuokkaApi<any, any>, options?: {
        invalidatesTags?: TagType<TagString>;
    });
    protected generateHookName(): MutationHookType;
    protected generateHook(params: (a: Takes) => QuokkaApiMutationParams<TagString>, apiInit: Omit<CreateApiOptions<any, TagString>, "endpoints">): MutationHook<Takes, Returns, Error>;
    protected invalidateCache(cacheManager: CacheManager): void;
}
