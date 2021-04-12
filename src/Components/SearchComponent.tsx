import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react';

function SearchComponent(props: any) {
    const { search } = props;

    const [searchFilter, setSearchFilter] = useState<string>('')
    const [maxArticles, setMaxArticles] = useState<number>(10)

    return (
        <div className="p-formgroup-inline p-m-3 p-justify-center">
            <div className="p-field">
                <label htmlFor="firstname2">Search for</label>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText id="searchFilter" value={searchFilter} onChange={(e) => setSearchFilter(e.currentTarget.value)} placeholder="Search" />
                </span>
            </div>
            <div className="p-field" >
                <label htmlFor="maxArticles" >Max Articles</label>
                <InputNumber id="maxArticles" value={maxArticles} onValueChange={(e) => setMaxArticles(e.value)} showButtons={true} min={1} max={50} />
            </div>
            <Button label="Search" onClick={() => search(searchFilter, maxArticles)} />
        </div>
    );
}

export default SearchComponent;
