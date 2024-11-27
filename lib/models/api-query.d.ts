import { QuokkaApiAction } from "./api-action";
import { CreateApiOptions, QueryHook, QuokkaApiQueryParams } from "../types/quokka";
import { QueryHookType } from "../types";
export declare class QuokkaApiQuery<Takes, Returns> extends QuokkaApiAction<(a: Takes) => QuokkaApiQueryParams, QueryHookType, QueryHook<Takes, Returns, Error>> {
    constructor(generateParams: (a: Takes) => QuokkaApiQueryParams);
    protected generateHookName(): QueryHookType;
    protected generateHook(params: (a: Takes) => QuokkaApiQueryParams, apiInit: Omit<CreateApiOptions<any>, "endpoints">): QueryHook<Takes, Returns, Error>;
}
