import axios, { AxiosResponse } from "axios"

const baseUrl: string = process.env.NODE_ENV !== 'production' ? 'http://localhost:80' : 'https://api.thediversecandidate.com'
// const baseUrl: string = 'https://api.thediversecandidate.com'

export const getArticles = async (search: string, first: number, last: number, orderBy: string): Promise<AxiosResponse<GetArticlesResponse>> => {
    try {
        const results: AxiosResponse<GetArticlesResponse> = await axios.get(baseUrl + `/articles/search/${search}/${first}/${last}/${orderBy}`,
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
