import { CreateApiOptions, QuokkaApiMutationParams, QuokkaApiQueryParams } from "../types/quokka";
import { MutationHookType, QueryHookType } from "../types";
/**
 * `QuokkaApiAction` is the abstract class from which `QuokkaApiQuery` and `QuokkaApiMutation` classes inherit.
 * It describes the fields and methods that an API action should have. API are one of two things: Queries or Mutations.
 * */
export declare abstract class QuokkaApiAction<ParameterGenerator extends (args: any) => QuokkaApiQueryParams | QuokkaApiMutationParams, HookNameType extends QueryHookType | MutationHookType, HookType> {
    /**
     * `generateParams` takes an argument and returns the parameters which are going to
     *  be used to make the api request.
     * */
    protected generateParams: ParameterGenerator;
    protected requestName: string;
    protected hasSetKey: boolean;
    nameOfHook: HookNameType | undefined;
    protected constructor(generateParams: ParameterGenerator);
    setKey(key: string): void;
    asHook(apiInit: Omit<CreateApiOptions<any>, "endpoints">): {
        [x: string]: HookType;
    };
    protected abstract generateHookName(): HookNameType;
    protected abstract generateHook(params: ParameterGenerator, apiInit: Omit<CreateApiOptions<any>, "endpoints">): HookType;
}
