import {QuokkaApiQuery} from "./models/api-query";
import {QuokkaApiMutation} from "./models/api-mutation";
import {CreateApiOptions} from "./types/quokka";
import {QuokkaApi} from "./models/quokka-api";


export function createApi<
    TagString extends string,
    T extends Record<
        string,
        QuokkaApiQuery<any, any, TagString> | QuokkaApiMutation<any, any, TagString>
    >
>(options: CreateApiOptions<T, TagString>): QuokkaApi<T, TagString> {
    return new QuokkaApi<T, TagString>(options);
}
