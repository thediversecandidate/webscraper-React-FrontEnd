import { createContext, useContext } from 'react';

export const GeneralContextInitialValue: GeneralContextType = {
    articles: [],
    setFirst: (first: number) => { }
};

export type GeneralContextType = {
    articles: ArticleRow[];
    setFirst: (first: number) => void;
}

export const GeneralContext = createContext<GeneralContextType>(GeneralContextInitialValue);
export const useGeneralContext = () => useContext(GeneralContext);