import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import './SearchComponent.css';

type ArticlesComponentProps = {
    search: (searchFilter: string, articlesPerPage: number) => void;
    articlesPerPage: number;
    setArticlesPerPage: (value: number) => void;
}

function SearchComponent({ search, articlesPerPage, setArticlesPerPage }: ArticlesComponentProps) {

    const orderBys: OrderByRow[] = [
        { label: 'Date (Ascending)', code: 'date_asc' },
        { label: 'Date (Descending)', code: 'date_desc' },
    ];

    const [searchFilter, setSearchFilter] = useState<string>('')
    const [selectedOrderBy, setSelectedOrderBy] = useState<OrderByRow>(orderBys[1]);

    const onOrderByChange = (orderBy: OrderByRow) => {
        setSelectedOrderBy(orderBy);
    }

    return (
        <div className="p-formgroup-inline p-m-3 p-justify-center">
            <div className="p-field">
                <label htmlFor="firstname2">Search for</label>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText id="searchFilter" value={searchFilter} onKeyPress={(e) => {
                        if (e.key === 'Enter')
                            search(searchFilter, articlesPerPage);
                    }} onChange={(e) => setSearchFilter(e.currentTarget.value)} placeholder="Search" />
                </span>
            </div>
            <div className="p-field" >
                <label htmlFor="maxArticles" >Max Articles</label>
                <InputNumber id="maxArticles" value={articlesPerPage} onValueChange={(e) => setArticlesPerPage(e.value)} showButtons={true} min={1} max={50} />
            </div>
            <div className="p-field" >
                <label htmlFor="orderBy" >Order By</label>
                <Dropdown id="orderBy" value={selectedOrderBy} options={orderBys} onChange={(e) => onOrderByChange(e.value)} optionLabel="label" />
            </div>
            <Button label="Search" onClick={() => search(searchFilter, articlesPerPage)} />
        </div>
    );
}

export default SearchComponent;
