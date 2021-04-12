interface ArticleRow {
    url: string;
    title: string;
    body: string;
    article_summary: string;
    list_of_keywords: string;
    wordcloud_words: string;
    wordcloud_scores: string;
    created_date: string;
}

interface WordCloud {
    text: string;
    value: number;
}

type GetArticlesResponse = {
    message: string
    status: string
    data: ArticleRow[]
}

type GetArticlesCountRow = {
    count: number;
}

type GetArticlesCountResponse = {
    message: string
    status: string
    data: GetArticlesCountRow;
}