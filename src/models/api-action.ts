import {CreateApiOptions, QuokkaApiMutationParams, QuokkaApiQueryParams} from "../types/quokka";
import {MutationHookType, QueryHookType} from "../types";

/**
 * `QuokkaApiAction` is the abstract class from which `QuokkaApiQuery` and `QuokkaApiMutation` classes inherit.
 * It describes the fields and methods that an API action should have. API are one of two things: Queries or Mutations.
 * */
export abstract class QuokkaApiAction<
    ParameterGenerator extends (args: any) => QuokkaApiQueryParams<any> | QuokkaApiMutationParams<any>,
    HookNameType extends QueryHookType | MutationHookType,
    HookType,
> {
    /**
     * `generateParams` takes an argument and returns the parameters which are going to
     *  be used to make the api request.
     * */
    protected generateParams: ParameterGenerator;
    protected requestName = "";
    protected hasSetKey = false;
    nameOfHook: HookNameType | undefined;

    protected constructor(generateParams: ParameterGenerator) {
        this.generateParams = generateParams;
    }

    setKey(key: string) {
        if (!this.hasSetKey) {
            this.requestName = key;
            this.hasSetKey = true;
        }
    }

    asHook(apiInit: Omit<CreateApiOptions<any, any>, "endpoints">) {
        if (!this.hasSetKey) {
            throw new Error(
                "Should set key before attempting to generate mutation hook",
            );
        }
        return {
            [this.generateHookName()]: this.generateHook(
                this.generateParams,
                apiInit,
            ),
        };
    }

    protected abstract generateHookName(): HookNameType

    protected abstract generateHook(
        params: ParameterGenerator,
        apiInit: Omit<CreateApiOptions<any, any>, "endpoints">,
    ): HookType
}
