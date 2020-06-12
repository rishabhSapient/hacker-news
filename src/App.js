import React from 'react';
import './App.css';

import axios from 'axios';
import NewsItem from './components/news-item/news-item';
// import NewsList from './components/news-list/news-list';
import LineChart from './components/line-chart/line-chart';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      pageNo: 1,
      newsList: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getNewsListData();
  }

  getNewsListData() {
    const { pageNo } = this.state;

    axios.get(`http://hn.algolia.com/api/v1/search_by_date?page=${pageNo}&numericFilters=num_comments>10,points>10`)
      .then((res) => {
        let result = res.data.hits;
        let hideNewsList = localStorage.getItem('hideNewsList');
        if (hideNewsList) {
          hideNewsList = JSON.parse(hideNewsList);
          result = result.filter(val => hideNewsList.indexOf(val.objectID) === -1);
        }

        this.modifyDataForLineChart(result);
        this.setState({
          newsList: result,
          loading: false,
        });
        console.log(this.state.pageNo);
      });
  }

  modifyDataForLineChart(data) {
    let xAxis = data.map(val => val.objectID);
    let yAxis = data.map(val => val.points);
    return {
      title: {
        text: 'Line Chart'
      },
      yAxis: {
        title: {
          text: 'Votes',
          style : {
            color : '#333333',
            fontSize : '16px'
          }
        }
      },
      xAxis: {
        categories: xAxis,
      },
      series: [{
        // name: 'ID',
        data: yAxis
      }]
    }
  }

  gotoPage(pageStatus) {
    const { pageNo } = this.state;
    this.setState({
      pageNo: pageStatus === "next" ? pageNo + 1 : pageNo - 1,
      loading: true,
    }, () => {
      this.getNewsListData();
    });
  }

  hideItem(data) {
    const objectId = data.newsData.objectID;
    let hideNewsList = localStorage.getItem('hideNewsList');
    if (hideNewsList) {
      hideNewsList = JSON.parse(hideNewsList);
    } else {
      hideNewsList = [];
    }
    hideNewsList.push(objectId);
    localStorage.setItem('hideNewsList', JSON.stringify(hideNewsList));
    const { newsList } = this.state;
    let filteredNewsList = newsList.filter(val => val.objectID !== objectId);
    this.setState({
      newsList: filteredNewsList,
    });
  }

  render() {
    const { newsList, loading, pageNo } = this.state;
    return (
      <div className="page-wrapper">
        <section className="news-list-wrapper">
          <table border="0">
            <thead>
              <tr>
                <th>Comments</th>
                <th>Vote Count</th>
                <th>UpVote</th>
                <th>News Details</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map(val => (
                <NewsItem
                  key={val.created_at_i}
                  hideItem={$event => this.hideItem($event)}
                  newsData={val}
                />
              ))}
            </tbody>
          </table>
          <div className="pagination-btn-wrapper">
            {
              !loading
                ?
                <div>
                  <button onClick={() => this.gotoPage("prev")} disabled={pageNo === 1} type="button" className="pagination-btn">Prev</button>
                  <button onClick={() => this.gotoPage("next")} type="button" className="pagination-btn">Next</button>
                </div>
                : null
            }
          </div>
        </section>
        <LineChart config={this.modifyDataForLineChart(newsList)} />
      </div>
    );
  }
}

export default App;
