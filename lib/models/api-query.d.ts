import { QuokkaApiAction } from "./api-action";
import { CreateApiOptions, QueryHook, QuokkaApiQueryParams } from "../types/quokka";
import { QueryHookType, TagType } from "../types";
import { QuokkaApi } from "./quokka-api";
export declare class QuokkaApiQuery<Takes, Returns, TagsString> extends QuokkaApiAction<(a: Takes) => QuokkaApiQueryParams<TagsString, Returns>, QueryHookType, QueryHook<Takes, Returns, Error>> {
    tags?: TagType<TagsString, Returns>;
    trigger?: (takes: Takes) => void;
    constructor(generateParams: (a: Takes) => QuokkaApiQueryParams<TagsString, Returns>, api: QuokkaApi<any, any>, options?: {
        providesTags?: TagType<TagsString, Returns>;
    });
    protected generateHookName(): QueryHookType;
    protected generateHook(params: (a: Takes) => QuokkaApiQueryParams<TagsString, Returns>, apiInit: Omit<CreateApiOptions<any, TagsString>, "endpoints">): QueryHook<Takes, Returns, Error>;
}
