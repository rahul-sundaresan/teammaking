import React from 'react';
import {useState} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import {default as DisplayCourseComponent} from "./DisplayCourseComponent";
import {default as RosterDetails} from "./DisplaySavedRosterComponent";
import {default as DisplayPickedFile} from "./DisplayPickedFile";
import { Table, Header, Cell, Icon, Button, Grid, GridColumn } from 'semantic-ui-react';
import {default as SurveyFormQuestionComponent} from "./SurveyFormQuestionComponent";
import {default as SidebarComponent } from "./SidebarComponent";
import { default as HeaderComponent } from "./AppHeaderComponent";



export default function MainAppComponent() {

    const [ sidebarVisible, setSidebarVisible ] = useState(false);
    const [ sidebarButtonRef ] = useState(React.createRef());


    const HeaderCellComponent = (props) => (<Table.HeaderCell singleLine>{props.headerName}</Table.HeaderCell>);
    var getHeaders = () => {
        const header = ["name", "email", "skill", "age"]
        var ret = []
        header.forEach((v,i) => {
            ret.push(<HeaderCellComponent key={v} headerName={v}/>);
        });
        return ret;
    }
    const headers = getHeaders();
    const appBackGroundStyle = {
        background:"linear-gradient(0deg,rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url(/assets/images/background.jpg)"
    }
    

    return (
        <div>
        <Router>
            <Route path="/">
                <SidebarComponent setVisible={setSidebarVisible} visible={sidebarVisible} pushStyle={appBackGroundStyle}>
                    <Grid style={{ background:"inherit"}}>
                        <Grid.Row>
                            <HeaderComponent setSidebarVisible={setSidebarVisible}/>
                        </Grid.Row>
                        <Grid.Row>
                            <GridColumn width={1}/>
                            <GridColumn width={14}>
                                <Switch>
                                    <Route exact={true} path={`/professor/1/course/1/roster/9`}>
                                        <RosterDetails>{headers}</RosterDetails>
                                    </Route>
                                    <Route 
                                        exact={true} 
                                        path={"/professor/1/course/survey/add"}>
                                            <SurveyFormQuestionComponent />
                                    </Route>
                                    <Route 
                                        exact={true} 
                                        path={"/professor/1/course/chooseroster/view"}>
                                            <DisplayPickedFile />
                                    </Route>
                                    <Route exact={true}  path="/professor/1/course">
                                        <DisplayCourseComponent/>
                                    </Route>
                                    <Route path="/">
                                        <DisplayCourseComponent/>
                                    </Route>
                                    <DisplayCourseComponent/>
                                </Switch>
                            </GridColumn>
                            <GridColumn width={1}/>
                        </Grid.Row>
                    </Grid>
                </SidebarComponent>
            </Route>
        </Router>
        </div>
    );
}