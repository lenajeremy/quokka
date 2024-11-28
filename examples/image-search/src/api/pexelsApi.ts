import {createApi} from "quokka";
import {Actions, State} from "../types.ts";

type Image = {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    liked: false;
    alt: string;
};

type Video = {
    id: number;
    width: number;
    height: number;
    url: string;
    image: string;
    full_res: null;
    tags: string[];
    duration: number;
    user: {
        id: number;
        name: string;
        url: string;
    };
    video_files: {
        id: number;
        quality: string;
        file_type: string;
        width: number;
        height: number;
        fps: number;
        link: string;
    }[];
    video_pictures: {
        id: number;
        picture: string;
        nr: number;
    }[];
};

type ImagesResponse = {
    total_results: number;
    page: number;
    per_page: number;
    photos: Image[];
    next_page: string;
};

type VideoResponse = {
    page: number;
    per_page: number;
    total_results: number;
    url: string;
    videos: Video[];
};
type ImageSearchParam = {
    query: string;
    page?: number;
    per_page?: number;
    orientation?: "landscape" | "portrait" | "square";
    color?: Color;
};

export type Color =
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "turquoise"
    | "blue"
    | "violet"
    | "pink"
    | "brown"
    | "black"
    | "gray"
    | "white"
    | `#${string}`;

type VideoSearchParam = Omit<ImageSearchParam, "color">;

const pexelsApi = createApi({
    apiName: "pexelsApi",
    baseUrl: "https://api.pexels.com/v1",
    prepareHeaders: (_: () => State & Actions, headers) => {
        headers.set("Authorization", "uvZBWNPUBUF1mpb37KipAOCYuT8UOoVSR8aQmWq8pQAxIb04SfdxzfHD");
        return headers;
    },
    endpoints: (builder) => {
        return {
            searchImages: builder.query<ImageSearchParam, ImagesResponse>((args) => {
                return {
                    url: "/search",
                    params: args,
                };
            }),
            searchVideos: builder.query<VideoSearchParam, VideoResponse>((args) => {
                return {
                    url: "/videos/search",
                    params: args,
                };
            }),
        };
    },
});

export const {useSearchVideosQuery, useSearchImagesQuery} = pexelsApi.actions;
