import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import './SearchComponent.css';

type ArticlesComponentProps = {
    search: (searchFilter: string, sortBy: string) => void;
}

function SearchComponent({ search }: ArticlesComponentProps) {

    const orderBys: OrderByRow[] = [
        { label: 'Asc.', code: 'asc' },
        { label: 'Desc.', code: 'desc' },
    ];

    const [searchFilter, setSearchFilter] = useState<string>('')
    const [selectedOrderBy, setSelectedOrderBy] = useState<OrderByRow>(orderBys[1]);

    return (
        <div className="p-fluid p-formgrid p-grid p-ml-3 p-mr-3 p-mt-5 p-justify-center">
            <div className="p-field p-col">
                <span className="p-float-label p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText id="searchFilter" value={searchFilter} onKeyPress={(e) => {
                        if (e.key === 'Enter')
                            search(searchFilter, selectedOrderBy.code);
                    }} onChange={(e) => setSearchFilter(e.currentTarget.value)} />
                    <label htmlFor="searchFilter">Search for</label>
                </span>
            </div>
            <div className="p-field p-col-0" >
                <span className="p-float-label">
                    <Dropdown id="orderBy" value={selectedOrderBy} options={orderBys} className="p-text-left"
                        onChange={(e) => setSelectedOrderBy(e.value)} optionLabel="label" />
                    <label htmlFor="orderBy" >Order By</label>
                </span>
            </div>
            <div className="p-field p-col-0 p-ml-2" >
                <Button label="Search" onClick={() => search(searchFilter, selectedOrderBy.code)} />
            </div>
        </div>
    );
}

export default SearchComponent;
