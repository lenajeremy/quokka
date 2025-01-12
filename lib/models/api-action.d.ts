import { CreateApiOptions, QuokkaApiMutationParams, QuokkaApiQueryParams } from "../types/quokka";
import { MutationHookType, QueryHookType } from "../types";
import { QuokkaApi } from "./quokka-api";
/**
 * `QuokkaApiAction` is the abstract class from which `QuokkaApiQuery` and `QuokkaApiMutation` classes inherit.
 * It describes the fields and methods that an API action should have. API are one of two things: Queries or Mutations.
 * */
export declare abstract class QuokkaApiAction<ParameterGenerator extends (args: any) => QuokkaApiQueryParams<any> | QuokkaApiMutationParams<any>, HookNameType extends QueryHookType | MutationHookType, HookType> {
    /**
     * `generateParams` takes an argument and returns the parameters which are going to
     *  be used to make the api request.
     * */
    protected generateParams: ParameterGenerator;
    protected requestName: string;
    protected api: QuokkaApi<any, any>;
    protected hasSetKey: boolean;
    nameOfHook: HookNameType | undefined;
    protected constructor(generateParams: ParameterGenerator, api: QuokkaApi<any, any>);
    setKey(key: string): void;
    asHook(apiInit: Omit<CreateApiOptions<any, any>, "endpoints">): {
        [x: string]: HookType;
    };
    protected abstract generateHookName(): HookNameType;
    protected abstract generateHook(params: ParameterGenerator, apiInit: Omit<CreateApiOptions<any, any>, "endpoints">): HookType;
}
