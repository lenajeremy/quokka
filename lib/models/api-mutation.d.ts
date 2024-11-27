import { QuokkaApiAction } from "./api-action";
import { MutationHook, QuokkaApiMutationParams } from "../types/quokka";
import { MutationHookType } from "../types";
import { CreateApiOptions } from "../types/quokka";
export declare class QuokkaApiMutation<Takes, Returns> extends QuokkaApiAction<(a: Takes) => QuokkaApiMutationParams, MutationHookType, MutationHook<Takes, Returns, Error>> {
    constructor(generateParams: (a: Takes) => QuokkaApiMutationParams);
    protected generateHookName(): MutationHookType;
    protected generateHook(params: (a: Takes) => QuokkaApiMutationParams, apiInit: Omit<CreateApiOptions<any>, "endpoints">): MutationHook<Takes, Returns, Error>;
}
