import React, { Component } from 'react';
import './App.css';
import {sortKey} from 'lodash';
import {sortBy} from 'lodash';
import classNames from 'classnames';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = 100;

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';
const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;
console.log(url);
//eslint-disable-next-line
/* const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0.
  },

  {
    title: 'Redux',
    url: 'https://github.com/redux/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1.
  },
]; */

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),  
};

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      list: [],
      results: null,
      searchKey: "",
      searchTerm: DEFAULT_QUERY,
      error: null,
      sortKey: 'NONE',
      isSortReverse: false,
      };
      this.setSearchTopStories = this.setSearchTopStories.bind(this);
      this.needsToSearchStories = this.needsToSearchStories.bind(this);
      this.fetchTopStories=this.fetchTopStories.bind(this);
      this.onSearchChange = this.onSearchChange.bind(this);
      this.onSearchSubmit = this.onSearchSubmit.bind(this);
      this.onDismiss = this.onDismiss.bind(this);
      this.onSort.bind(this);
      }

      needsToSearchStories(searchTerm) {
        return !this.state.results[searchTerm];
      }
      setSearchTopStories(result) {
          const {hits, page}= result;
          const { searchKey, results} = this.state;

          const oldHits = results && results[searchKey] 
          ? results[searchKey].hits 
          : [];

        const updatedHits = [
          ...oldHits,
          ...hits
        ];

      this.setState({
        results: {
          ...results, 
          [searchKey]:{hits: updatedHits,page}
        },
      });  
      }
      componentDidMount() {
      const { searchKey: searchTerm } = this.state;
      this.fetchTopStories(searchTerm);
      }
      fetchTopStories(searchTerm, page=0) {
        fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
        .then(response => response.json())
        .then(result => this.setSearchTopStories(result))
        .catch(error => this.setState({error}));
      }
      onSearchSubmit(event) {
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        if(this.needsToSearchStories(searchTerm)){
        this.fetchTopStories(searchTerm);
        }
        event.preventDefault();
      }
   
  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({sortKey, isSortReverse});
  }

  
  onDismiss(id) {
    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey];
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({
    results: {
       ...results,
      [searchKey]: {hits: updatedHits, page
    }
     }
    });
    }
  render() {
    const { 
      searchTerm, 
      results,
      searchKey,
      error,
      sortKey,
      isSortReverse
    } = this.state;
    const page = (
      results &&
      results[searchKey] && 
      results[searchKey].page) || 0;

      const list = (
        results &&
      results[searchKey] && 
      results[searchKey].hits
      ) || [];

      if (error) {
        return <p>Something went wrong.</p>;
      }
    return (    
    <div className="page">
      <div className='interactions'>

    <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}> Search </Search> </div>
   <Table list={list} sortKey={sortKey} isSortReverse={isSortReverse} onSort={this.onSort}
   onDismiss={this.onDismiss} />
  
  <div className='interactions'>
    <Button onClick={() => this.fetchTopStories(searchKey, page+1)}>
      More
      </Button>
  </div>
  <form>
      <input type = 'text' value={searchTerm} onChange={this.onSearchChange} />
    </form> 

    {this.state.list.map(item => 
        <div key={item.objectID}>
        <span>
          <a href={item.url}>{item.title}</a>
        </span> 
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>

        <span>
          <button onClick={() => this.onDismiss(item.objectID)} 
            type="button"></button>
        </span>
        </div>
    ) }
  
    </div> 
  );
 }
}

const Search =({value, onChange, onSubmit, children}) =>
    
      <form onSubmit={onSubmit}>
       {children} <input type="text" 
        value={value}
        onChange={onChange}
        />
        <button type="submit">
          {children}
        </button>
        </form>
    


    const Table = ({ list, sortKey, isSortReverse, onSort, onDismiss }) => {
      const sortedList = SORTS[sortKey](list);
      const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
    return(
    <div className="table">
    <div className='table-header'>
      <span style={{width:'40%'}}>
        <Sort sortKey={'TITLE'} onSort={onSort} activeSortKey={sortKey}>Title</Sort>
      </span>
      <span style={{width:"30%"}}>
        <Sort sortKey={'AUTHOR'} onSort={onSort} activeSortKey={sortKey}>Author</Sort>
      </span>
      <span style={{width:"10%"}}>
        <Sort sortKey={'COMMENTS'} onSort={onSort} activeSortKey={sortKey}>Comments</Sort>
      </span>
      <span style={{width:"10%"}}>
        <Sort sortKey={'POINTS'} onSort={onSort} activeSortKey={sortKey}>Points</Sort>
      </span>
      <span style={{width:"10%"}}>
        Archive
      </span>
    </div>

    {reverseSortedList.map(item =>
    <div key={item.objectID} className="table-row">
    <span style={{width:'40%'}}>
    <a href={item.url}>{item.title}</a>
    </span>
    <span style={{width:'30%'}}>{item.author}</span>
    <span style={{width:'10%'}}>{item.num_comments}</span>
    <span style={{width:'10%'}}>{item.points}</span>
    <span style={{width:'10%'}}>
    <Button
    onClick={() => onDismiss(item.objectID)}
    className="button-inline"
    >
    Dismiss
    </Button>
    </span>
    </div>
    )}
    </div>
    );
  }

const Sort = ({
  sortKey,
  activeSortKey,
  onSort,
  children
}) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  );

  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
    >
      {children} 
    </Button>
  );
}

  
function Button(props){
      const {
      onClick,
      className='',
      children,
    } = props;

    return (
      <button onClick={onClick}
      className={className}
      type= 'button' > {children}
      </button>
      );
      }

export default App;
