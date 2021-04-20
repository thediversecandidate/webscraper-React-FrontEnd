import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import './SearchComponent.css';

type ArticlesComponentProps = {
    search: (searchFilter: string, sortBy: string) => void;
    articlesPerPage: number;
    setArticlesPerPage: (value: number) => void;
}

function SearchComponent({ search, articlesPerPage, setArticlesPerPage }: ArticlesComponentProps) {

    const orderBys: OrderByRow[] = [
        { label: 'Date (Ascending)', code: 'asc' },
        { label: 'Date (Descending)', code: 'desc' },
    ];

    const [searchFilter, setSearchFilter] = useState<string>('')
    const [selectedOrderBy, setSelectedOrderBy] = useState<OrderByRow>(orderBys[1]);

    return (
        <div className="p-formgroup-inline p-m-3 p-justify-center">
            <div className="p-field">
                <label htmlFor="firstname2">Search for</label>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText id="searchFilter" value={searchFilter} onKeyPress={(e) => {
                        if (e.key === 'Enter')
                            search(searchFilter, selectedOrderBy.code);
                    }} onChange={(e) => setSearchFilter(e.currentTarget.value)} placeholder="Search" />
                </span>
            </div>
            <div className="p-field" >
                <label htmlFor="maxArticles" >Max Articles</label>
                <InputNumber id="maxArticles" value={articlesPerPage} onValueChange={(e) => setArticlesPerPage(e.value)} showButtons={true} min={1} max={50} />
            </div>
            <div className="p-field" >
                <label htmlFor="orderBy" >Order By</label>
                <Dropdown id="orderBy" value={selectedOrderBy} options={orderBys} className="p-text-left"
                    onChange={(e) => setSelectedOrderBy(e.value)} optionLabel="label" />
            </div>
            <Button label="Search" onClick={() => search(searchFilter, selectedOrderBy.code)} />
        </div>
    );
}

export default SearchComponent;
