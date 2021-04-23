import { createContext, useContext } from 'react';

export const GeneralContextInitialValue: GeneralContextType = {
    articles: [],
    first: 0,
    setFirst: (first: number) => { },
    isTimelineMode: false,
    setIsTimelineMode: (value: boolean) => { },
};

export type GeneralContextType = {
    articles: ArticleRow[];
    first: number;
    setFirst: (first: number) => void;
    isTimelineMode: boolean;
    setIsTimelineMode: (value: boolean) => void;
}

export const GeneralContext = createContext<GeneralContextType>(GeneralContextInitialValue);
export const useGeneralContext = () => useContext(GeneralContext);