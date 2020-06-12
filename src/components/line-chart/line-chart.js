import React from 'react';
const ReactHighcharts = require('react-highcharts');


function LineChart(props) {

    return <ReactHighcharts config={props.config}></ReactHighcharts>;
}


export default LineChart;