import axios, { AxiosResponse } from "axios"

const baseUrl: string = "https://api.thediversecandidate.com"


export const getArticles = async (search: string, maxResult: number): Promise<AxiosResponse<GetArticlesResponse>> => {
    try {
        const results: AxiosResponse<GetArticlesResponse> = await axios.get(baseUrl + `/articles/search/${search}/${maxResult}`,
            {
                headers: {
                    "Authorization": "Token fd314d4436dfdc9fd990822cd1e483d951c7dfd6",
                    "Accept": "application/json",
                }
            });
        return results;
    } catch (error) {
        throw new Error(error)
    }
}

export const getArticlesCount = async (search: string): Promise<AxiosResponse<GetArticlesCountResponse>> => {

    try {
        const results: AxiosResponse<GetArticlesCountResponse> = await axios.get(baseUrl + `/articles/results/${search}`,
            {
                headers: {
                    "Authorization": "Token fd314d4436dfdc9fd990822cd1e483d951c7dfd6",
                    "Accept": "application/json",
                }
            });
        return results;
    } catch (error) {
        throw new Error(error)
    }
}
