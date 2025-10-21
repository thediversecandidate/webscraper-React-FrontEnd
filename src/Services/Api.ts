import axios, { AxiosResponse } from "axios"

// Base URL resolution order:
// 1) REACT_APP_API_BASEURL env var (preferred for dev/prod overrides)
// 2) Remote API default (avoid coupling to local backend by default)
const envBase = (process as any).env?.REACT_APP_API_BASEURL as string | undefined;
const envToken = (process as any).env?.REACT_APP_API_TOKEN as string | undefined;
const baseUrl: string = envBase && envBase.trim().length > 0
    ? envBase.trim()
    : 'https://api.thediversecandidate.com';

console.log(`[API] Base URL: ${baseUrl}`);
if (baseUrl.includes('api.thediversecandidate.com') && !envToken) {
    console.warn('[API] Warning: Using remote API without REACT_APP_API_TOKEN set. Requests may be rejected.');
}

const defaultHeaders: Record<string, string> = {
    "Accept": "application/json",
    ...(envToken ? { "Authorization": `Bearer ${envToken}` } : {})
};

export const getArticles = async (search: string, first: number, last: number, orderBy: string): Promise<AxiosResponse<GetArticlesResponse>> => {
    try {
        console.log(`[API] 🔍 Searching articles: "${search}" [${first}:${last}] order=${orderBy}`);
        const url = baseUrl + `/articles/search/${search}/${first}/${last}/${orderBy}`;
        console.log(`[API] Request URL: ${url}`);
        
        const startTime = Date.now();
        const results: AxiosResponse<GetArticlesResponse> = await axios.get(url,
            {
                headers: defaultHeaders,
                timeout: 10000 // 10 second timeout for search requests
            });
        
        const responseTime = Date.now() - startTime;
        console.log(`[API] ✅ Articles response: ${results.status} in ${responseTime}ms`);
        console.log(`[API] Articles data:`, {
            rawData: results.data,
            dataType: typeof results.data,
            dataKeys: results.data ? Object.keys(results.data) : 'no data'
        });
        
        return results;
    } catch (error) {
        console.error('[API] ❌ getArticles failed:', error);
        console.error('[API] Error details:', {
            message: error instanceof Error ? error.message : String(error),
            url: baseUrl + `/articles/search/${search}/${first}/${last}/${orderBy}`,
            search,
            first,
            last,
            orderBy
        });
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const getArticlesCount = async (search: string): Promise<AxiosResponse<GetArticlesCountResponse>> => {

    try {
        const results: AxiosResponse<GetArticlesCountResponse> = await axios.get(baseUrl + `/articles/results/${search}`,
            {
                headers: defaultHeaders,
                timeout: 10000 // 10 second timeout for count requests
            });
        return results;
    } catch (error) {
        console.error('API Error (getArticlesCount):', error);
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}
