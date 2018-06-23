import React, { Component } from 'react';
import DetailsApi from '../../api/reportsDetailsApi';
import { ArrowLeft, UserCheck, Activity, ArrowRight } from 'react-feather';
import {Link} from "react-router-dom";
import moment from 'moment';
import {PieChart} from 'react-easy-chart';   
import axios  from 'axios';
import ReactLoading from 'react-loading';
import * as $ from 'jquery';


class ReportsDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSession: {
                salaryInfo: [],
                fullNames: [],
            },
            isLoading: true
        }}

            sendData = () => {
                const { relYear } = this.props.history.location.state.dev;
                const { relMonth } = this.props.history.location.state.dev;
                const selectedMonth = moment().month(relMonth).format("MM");
                const finalSelect = parseInt(relYear + selectedMonth, 10);

                let url = `http://localhost:1337/api/`;

                axios.post(url, { 'selectedDate' : finalSelect })
                    .then(res => console.log('Data send'))
                    .catch(err => console.error(err));
                }
            
            getEmployeeSalaryData = () => {

                const { relYear } = this.props.history.location.state.dev;
                const { relMonth } = this.props.history.location.state.dev;
                const selectedMonth = moment().month(relMonth).format("MM");
                const finalSelect = parseInt(relYear + selectedMonth, 10);
                const { employees, details } = this.props;
 
                DetailsApi.getDetails().then(res => {
                    let first = res.data.names;  // Getting the names
                    let second = Object.values(res.data.salaryInfo); // Getting the salary data
                                this.setState(prevState => ({
                                    currentSession: {
                                    ...prevState.currentSession,
                                    salaryInfo: Object.assign(second),
                                    fullNames: Object.assign(first)
                                },
                                isLoading: false
                            }));
                            });        
                        }

            componentWillMount() {
                this.sendData(); 
                this.getEmployeeSalaryData(this.props);
                setTimeout(() => this.setState({ isLoading: false }), 3000); // do your async call
            }

    render() {

        if(this.state.isLoading) { // if doing asyng things
            return ( 
            <div className={'col-md-12 col-md-offset-6'}>
            <ReactLoading  type={'bars'} color={'#48c6ef'} />
            <p style={{color:'#48C6EF', margin: '0px'}}> Loading ...</p>
            </div>        
        );  }      // render the loading component

        const {employees, reports, details} = this.props;  

        // GETTING THE SELECTED VALUES AS PROPS
        const { relYear } = this.props.history.location.state.dev;
        const { relMonth } = this.props.history.location.state.dev;
        // Specific employee sheets - [ALL]
        const { salaryInfo, fullNames, fullInfo } = this.state.currentSession; 
        
        // FORMATING THE SELECTED DATE
        let displayDate = (relMonth + ' of ' + relYear);
        const selectedMonth = moment().month(relMonth).format("MM");

        // It's a number 201703
        const finalSelect = parseInt(relYear + selectedMonth, 10);

        // Getting the basic emp info used for stats
        let empData = [];

         for (let x=0; x < fullNames.length; x++) {
            employees.map(y => {
                if (y.name + ' ' + y.surname == fullNames[x]) {
                    empData.push(y)
            }});
        }

    // BASIC FORMATTING

        // GETTING THE GENDER DATA
        let maleArr = [];
        let femaleArr = [];

        // LOOPING OVER RELEVANT EMPLOYEES AND MAKING MEN vs WOMEN RATIO DATA
        empData.forEach(gen => {
            if (gen.gender == 'M') {
                maleArr.push(gen.gender)
            } else {
                femaleArr.push(gen.gender)
            }
        });

        // GETTING THE POSITION DATA
        let dev = [];
        let qa = [];
        let admin = [];
        let intern = [];
        let design = [];
        let management = [];
               
        // LOOPING OVER RELEVANT EMPLOYEES AND POSITION DATA
        empData.forEach(type => {
            switch (type.position) {
                case 'DEV':
                dev.push(type.position);
                break;
                case 'QA':
                qa.push(type.position);
                break;
                case 'ADMIN':
                admin.push(type.position);
                break;
                case 'INTERN':
                intern.push(type.position);
                break;
                case 'DESIGN':
                design.push(type.position);
                break;
                case 'EXECUTIVE':
                management.push(type.position);
                break;
                default:
                return null
            }});

        // MAKING MEN vs WOMEN RATIO DATA
        let empNum = empData.length;
        let maleNum = maleArr.length;
        let femaleNum = femaleArr.length;

        //MAKING POSITION STATS:
        let devNum = dev.length;
        let qaNum = qa.length;
        let adminNum = admin.length;
        let internNum = intern.length;
        let designNum = design.length;
        let managementNum = management.length;
        
        // WORKING vs NOT WORKING STATS
         let stillActive = [];
         let notActive = [];
 
         empData.map(item => {
            if (item.enddate){
                 notActive.push(item)
            } else {
                stillActive.push(item)
            }
        });
 
        let activeNum = stillActive.length;
        let notActiveNum = notActive.length;
        
        // MAKING THE FINAL PRCENTAGE DATA
        const maleData = ((maleNum / empNum) * 100).toFixed(2);
        const femaleData = ((femaleNum / empNum) * 100).toFixed(2);
        // ...and the same for positions
        const devStats = ((devNum / empNum) * 100).toFixed(2);
        const qaStats = ((qaNum / empNum) * 100).toFixed(2);
        const adminStats = ((adminNum / empNum) * 100).toFixed(2);
        const internStats = ((internNum / empNum) * 100).toFixed(2);
        const designStats = ((designNum / empNum) * 100).toFixed(2);
        const managementStats = ((managementNum / empNum) * 100).toFixed(2);

        // ...now for the currently working stats
        const activeStats = ((activeNum / empNum) * 100).toFixed(2);
        const notActiveStats = ((notActiveNum / empNum) * 100).toFixed(2);    

        // getting the current date
        let currentDate = moment().format('LL');

    // STARTING FROM HERE IS EVERYTHING NEDED TO CALC AND DISPLAY THE PROPER TABLE DATA

        let grossSalary = [];
        let netSalary = [];
        let meals = [];
        let taxes = [];
        let handSalary = [];
        
        salaryInfo.map(ex => {
                    netSalary.push(ex.totalNetSalary);
                    grossSalary.push(ex.totalGrossSalary);
                    meals.push(ex.bankHotMeal);
                    taxes.push(ex.bankContributes);
                    handSalary.push(ex.handSalary);  
                });

        // Preparing the data forrendering
        const dataTable = fullNames
            .map((item, idx) => {
                return (
                    <tr key={item}>
                        <td>{}</td>
                        <td>{item}</td>
                        <td>{netSalary[idx]}</td>
                        <td>{grossSalary[idx]}</td>
                        <td>{meals[idx]}</td>
                        <td>{taxes[idx]}</td>
                        <td>{handSalary[idx]}</td>
                        <td className="table-actions">
                            <Link to={{ pathname: `/reports/details/${item}`, state: { item } }}>
                                <Activity size="20"/>
                            </Link>
                        </td>
                    </tr>
                )});
   
        return (
                <div className="container">
                <div className="row navigation-row-2">
                    <Link to="/reports" className="btn btn-hollow">
                        <ArrowLeft size="18" className="button-left-icon"/> Go back to reports</Link>
                    </div>

            <div>
                <header style={{textAlign: 'center'}}>
                <h4> List of all relevant employees for  
                <span style= {{ color: '#48C6EF', fontStyle: 'italic' }}> {displayDate} </span> 
                </h4>
            
                <p style={{color:'#48C6EF', margin: '0px'}}>
                Further details available by clicking on an icon </p>
                </header>
                <hr />
            </div>
            
            <div className="row">
            <div className="col-lg-9">

                    <div className="portlet-body2">
                        <table className="table table-striped auto-index">
                            <thead>
                            <tr>
                                <th>No</th>
                                <th>NAME</th>
                                <th>NET</th>
                                <th>GROSS</th>
                                <th>MEALS</th>
                                <th>TAXES</th>
                                <th>SALARY</th>  
                                <th>DETAILS</th>
                            </tr>
                            </thead>
                            <tbody>
                                {dataTable}
                            </tbody>
                        </table>
                    </div>
                </div>

            <div className="col-lg-3">

             <div className="portlet portlet-boxed">
                <div className="portlet-header">
                <h6> Total number of employees <i className={`fa fa-long-arrow-right`}></i> 
                        <span style={{ fontFamily: 'Arial' , color: '#3291b6', fontWeight: 'bold', letterSpacing: '3px', fontSize: '2rem' }}
                            > {dataTable.length} </span></h6>
                </div>
            </div>

                <div className="portlet portlet-boxed">
                    <div className="portlet-header">
                        <h4 className="portlet-title">
                            Male vs. Female Ratio
                        </h4>
                        </div>
                        <div className="portlet-body" style={{textAlign: 'center', fontWeight: '400', letterSpacing: '2px'}}>
                            <p> <span style={{ fontFamily: 'Arial' , color: '#1E91B5', fontWeight: 'bold', letterSpacing: '2px'}}>
                            Male</span> <i className={`fa fa-long-arrow-right`}></i> {maleData} %</p>
                            <p><span style={{ fontFamily: 'Arial', color: '#BE95C4', fontWeight: 'bold', letterSpacing: '2px'}}>
                            Female</span> <i className={`fa fa-long-arrow-right`}></i> {femaleData} %</p>
                            <PieChart className="col-md-4"
                                size={220}
                                innerHoleSize={110}
                                data={[
                                { key: 'Men', value: maleData, color: '#9cd2e2' },
                                { key: 'Women', value: femaleData, color: '#d6badb' }
                            ]}
                            styles={{
                              '.chart_text': {
                                fontSize: '2em',
                                fontFamily: 'serif',
                                fontWeight: 'bold',
                                fill: '#00000'
                                }
                            }}
                            />
                            </div>
                        </div>
       
                <div className="portlet portlet-boxed">
                    <div className="portlet-header">
                        <h4 className="portlet-title">
                            Active vs. Inactive Stats <br /> 
                            ON DATE <i className={`fa fa-long-arrow-right`}></i>
                            <span style={{ fontFamily: 'Arial' , color: '#3291b6', fontWeight: 'bold', letterSpacing: '2px' }}> {currentDate}</span>
                        </h4>
                    </div> 
                        <div className="portlet-body" style={{textAlign: 'center', fontWeight: '400', letterSpacing: '2px'}}>
                            <p> <span style={{ fontFamily: 'Arial' , color: '#36b35e', fontWeight: 'bold', letterSpacing: '2px'}}>
                            Active</span> <i className={`fa fa-long-arrow-right`}></i> {activeStats} %</p>
                            <p><span style={{ fontFamily: 'Arial', color: '#c93c3c', fontWeight: 'bold', letterSpacing: '2px'}}>
                            Inactive</span> <i className={`fa fa-long-arrow-right`}></i> {notActiveStats} %</p>
                            <PieChart className="col-md-4"
                                size={220}
                                innerHoleSize={110}
                                data={[
                                { key: 'Active', value: activeStats, color: '#36b35e' },
                                { key: 'Inactive', value: notActiveStats, color: '#c93c3c' }
                            ]}
                            styles={{
                              '.chart_text': {
                                fontSize: '2em',
                                fontFamily: 'serif',
                                fontWeight: 'bold',
                                fill: '#00000'
                                }
                            }}
                          />
                        </div>                         
                    </div>

                <div className="portlet portlet-boxed">
                    <div className="portlet-header">
                        <h4 className="portlet-title">
                            Position Statistics
                        </h4>
                    </div>
                    <div className="portlet-body" style={{textAlign: 'center', fontWeight: '400', letterSpacing: '2px'}}> 
                            <p> <span style={{ fontFamily: 'Arial' , color: '#3566ba', fontWeight: 'bold', letterSpacing: '2px'}}>
                            DEV</span> <i className={`fa fa-long-arrow-right`}></i> {devStats} %</p>
                            <p><span style={{ fontFamily: 'Arial', color: '#5db84e', fontWeight: 'bold', letterSpacing: '2px'}}>
                            QA</span> <i className={`fa fa-long-arrow-right`}></i> {qaStats} %</p>
                            <p><span style={{ fontFamily: 'Arial', color: '#c43323', fontWeight: 'bold', letterSpacing: '2px'}}>
                            ADMIN</span> <i className={`fa fa-long-arrow-right`}></i> {adminStats} %</p>
                            <p><span style={{ fontFamily: 'Arial', color: '#b5872b', fontWeight: 'bold', letterSpacing: '2px'}}>
                            INTERN</span> <i className={`fa fa-long-arrow-right`}></i> {internStats} %</p>
                            <p><span style={{ fontFamily: 'Arial', color: '#9620db', fontWeight: 'bold', letterSpacing: '2px'}}>
                            DESIGN</span> <i className={`fa fa-long-arrow-right`}></i> {designStats} %</p>
                            <p><span style={{ fontFamily: 'Arial', color: '#eb7b3d', fontWeight: 'bold', letterSpacing: '2px'}}>
                            EXECUTIVE</span> <i className={`fa fa-long-arrow-right`}></i> {managementStats} %</p>
                            <PieChart className="col-md-4"
                                size={220}
                                innerHoleSize={110}
                                data={[
                                { key: 'DEV', value: devStats, color: '#3566ba' },
                                { key: 'QA', value: qaStats, color: '#5db84e' },
                                { key: 'ADMIN', value: adminStats, color: '#c43323' },
                                { key: 'INTERN', value: internStats, color: '#b5872b' },
                                { key: 'DESIGN', value: designStats, color: '#9620db' },
                                { key: 'MANAGEMENT', value: managementStats, color: '#eb7b3d' }
                            ]}
                            styles={{
                              '.chart_text': {
                                fontSize: '2em',
                                fontFamily: 'serif',
                                fontWeight: 'bold',
                                fill: '#00000'
                                }
                            }} 
                            />
                        </div>                          
                    </div>                  
                </div>
            </div>
        </div>
        );
    }   
}

export default ReportsDetails;

        // addSerialNumber = () => {
        //     $('tr').each((i) => {
        //         $(this).find('td:nth-child(1)').html(i + 1);
        //     });
        // };