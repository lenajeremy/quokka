import {QuokkaApiQuery} from "./models/api-query";
import {QuokkaApiMutation} from "./models/api-mutation";
import {CreateApiOptions} from "./types/quokka";
import {QuokkaApi} from "./models/quokka-api";


export function createApi<
    T extends Record<
        string,
        QuokkaApiQuery<any, any> | QuokkaApiMutation<any, any>
    >,
>(options: CreateApiOptions<T>): QuokkaApi<T> {
    return new QuokkaApi(options);
}
