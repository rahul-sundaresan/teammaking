// Submit new roster to update a course.
import React from 'react';
import { useState, useEffect } from 'react';
import { Redirect } from "react-router-dom";
import {Label, Icon, Divider, Modal, Form, FormField, Dropdown, Radio, FormButton, TextArea, FormCheckbox, Checkbox, Button, Grid, FormGroup, FormTextArea, Segment, Message, Image} from 'semantic-ui-react';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import moment from 'moment';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

import { DatePickerComponent } from '../Utils/UtilComponents'

// const DatePickerComponent = (props) => {
//     const [ date, setDate ] = useState(props.date);
//     return (
//       <DatePicker dateFormat="yyyy/MM/dd" selected={date} onChange={date => {console.log(date);let d = moment(date).utc().format("YYYY-MM-DD HH:mm:ss");setDate(date); props.onChange(d)}} />
//     );
// };

export default function UpdateCourseComponent(props){
    const [ open, setOpen ] = useState(false);
    const [ formRef ] = useState(React.createRef());
    const [ formSubmittedId, setFormSubmittedId ] = useState(0);
    // console.log(props)
    const pid = props.professorId;
    const cid = props.courseId;


    var clsStartTime = null;
    if (props.classStartTime){
        let clsStartTimeHour = parseInt(props.classStartTime.split(":")[0])
        let clsStartTimeMin = parseInt(props.classStartTime.split(":")[1])
        clsStartTime = new Date(2020, 12, 12, clsStartTimeHour, clsStartTimeMin, 0)
    }
    var clsEndTime = null;
    if (props.classEndTime){
        let clsEndTimeHour = parseInt(props.classEndTime.split(":")[0])
        let clsEndTimeMin = parseInt(props.classEndTime.split(":")[1])
        clsEndTime = new Date(2020, 12, 12, clsEndTimeHour, clsEndTimeMin , 0)
    }
    
    const [ courseName, setCourseName ] = useState(props.courseName);
    const [ courseCode, setCourseCode ] = useState(props.courseCode);
    const [ courseDesc, setCourseDesc ] = useState(props.courseDescription);
    const [ tAEmail, setTaEmail ] = useState(props.tAEmail);
    const [ tAName, setTaName ] = useState(props.tAName);
    
    // received dates are in utc, convert to local
    let localStartDate = null;
    if (props.startDate){
        localStartDate = moment.utc(props.startDate);
    }
    const [ startDate, setStartDate ] = useState(localStartDate || moment());
    
    let localEndDate = null;
    if (props.endDate){
        localEndDate = moment.utc(props.endDate);
    }
    const [ endDate, setEndDate ] = useState(localEndDate || moment());

    const [ classStartTime, setClassStartTime ] = useState(clsStartTime)
    const [ classEndTime, setClassEndTime ] = useState(clsEndTime)
    const [ courseCreated, setCourseCreated ] = useState(false);
    const [ okayHandled, setOkHandled ] = useState(false);
    const [ okayType, setOkType ] = useState("action");
    const [ feedbackModalOpen, setFeedbackModalOpen ] = useState(false);
    const [ feedbackModalMessage, setFeedbackModalMessage ] = useState("");

    const [ ignoreWarnings, setIgnoreWarnings ] = useState(false);

    useEffect(() => {
        if (formSubmittedId == 0) return;
        let warningMessages = ""
        if (!courseCode){
            setFeedbackModalMessage("Course Code cannot be empty.")
            setOkType("invalid")
            setFeedbackModalOpen(true);
        }else if (!courseName){
            setFeedbackModalMessage("Course Name cannot be empty.")
            setOkType("invalid")
            setFeedbackModalOpen(true);
        }
        else{
            if (!courseDesc){
                if (!ignoreWarnings){
                    warningMessages += "Note: You have not set any description for the course\n"
                }
            }
            if (!tAEmail){
                if (!ignoreWarnings){
                    warningMessages += "You have not set any email address for the course's Teaching Assistant\n"
                }
            }
            if (!tAName){
                if (!ignoreWarnings){
                    warningMessages += "You have not set a name for the course's Teaching Assistant"
                }
            }
            if (!ignoreWarnings && (warningMessages != "")){
                setOkType("warn")
                setFeedbackModalMessage(warningMessages);
                setFeedbackModalOpen(true);
            }else{
                // Try to create the course using the server API
                sendCreateRequest();
            }
        }
    },[formSubmittedId])

    const sendCreateRequest = async function(){
        console.log("Trying to Update the course..")
        let postBody = {
            "course_code": courseCode,
            "course_name": courseName,
            "course_description": courseDesc,
            "ta_name": tAName,
            "ta_email": tAEmail,
            "professor_id": pid,
            "start_date": startDate.format("YYYY-MM-DD HH:mm:ss"),
            "end_date": endDate.format("YYYY-MM-DD HH:mm:ss"),
            // "class_start_time": (classStartTime instanceof Date) ?  moment(classStartTime).format("HH:mm:ss") : classStartTime + ":00",
            // "class_end_time": (classEndTime instanceof Date) ? classEndTime.format("HH:mm:ss") : classEndTime + ":00",
            "class_start_time": (classStartTime instanceof Date) ? props.classStartTime : (classStartTime ? classStartTime + ":00" : null),
            "class_end_time": (classEndTime instanceof Date) ? props.classEndTime : (classEndTime ? classEndTime + ":00" : null),
        }
        try{
            let response = await fetch(`http://localhost:3000/professor/${pid}/course/${cid}/update`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache',
                body: JSON.stringify(postBody)
            })
            console.log(JSON.stringify(postBody))
            if (response.status != 200){
                throw Error(`Request did not succeed at ${response.url}\nResponse Status: ${response.status}\n`)
            }
            let responseJson = null;
            try{
                responseJson = await response.json()
            }catch{
                throw Error(`Response could not be converted to json.\nResponse status: ${response.status}\n`)
            }
            
            if (responseJson){
                if (responseJson.status == "ok"){
                    // console.log(responseJson)
                    setOkType("success")
                    setFeedbackModalMessage("Course updated successfully\n");
                    setFeedbackModalOpen(true);
                }else{
                    setFeedbackModalMessage((responseJson.reason && `${responseJson.reason}`) || (responseJson.errorFull && `${responseJson.errorFull}`) || "Problem creating the new course");
                    setFeedbackModalOpen(true);
                }
            }else{
                setFeedbackModalMessage("Problem updating the new course\n");
                setFeedbackModalOpen(true);
            }
        }catch(error){
            console.log(error)
            // setFeedbackModalMessage(error.message);
            setFeedbackModalMessage("An error prevented the request from completing" + "\n" + error.message + "\n" + JSON.stringify(error));
            setOkType("error");
            setFeedbackModalOpen(true);
        }
    }

    useEffect(() => {
        setFeedbackModalOpen(false);
    },[courseCreated])

    useEffect(() => {
        setFeedbackModalOpen(false);
    },[okayHandled])

    if (courseCreated == true){
        return <Redirect to={`/professor/${pid}/course`}/>
    }
    
    return (
        <div>
        {
            (<Modal 
                trigger={<Image 
                            onClick={() => setOpen(true)}
                            floated='right'
                            size='mini'
                            src='/assets/icons/info-24px.svg'
                        ></Image>
                }
                open={open}
            >
                <Modal.Header>
                    {props.header || `Update the Course - ${props.courseName}`}
                </Modal.Header>
                <Modal.Content scrolling>
                    <Form ref={formRef} onSubmit={() => setFormSubmittedId(formSubmittedId+1)}>
                            <FormField
                                label={"Course Name"}
                                placeholder={"Enter Course Name"}
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                control="input"
                            />
                            <Divider />
                            <FormField
                                label={"Course Code"}
                                placeholder={"Enter Course Code e.g. ITCS XXXX"}
                                value={courseCode}
                                control="input"
                                onChange={(e) => setCourseCode(e.target.value)}
                            />
                            <FormField
                                label={"Course Description"}
                                placeholder={"Enter a brief summary for what the students can expect to learn from this course"}
                                control="textarea"
                                style={{height:"100px"}}
                                value={courseDesc}
                                onChange={(e) => setCourseDesc(e.target.value)}
                            />
                            <FormField
                                label={"Teaching Assistant"}
                                placeholder={"Enter Teaching Assistant's name"}
                                control="input"
                                value={tAName}
                                onChange={(e) => setTaName(e.target.value)}
                            />
                            <FormField
                                label={"Teaching Assistant Email ID"}
                                placeholder={"Enter Teaching Assistant's Email ID"}
                                control="input"
                                value={tAEmail}
                                onChange={(e) => setTaEmail(e.target.value)}
                            />
                            {
                                /*
                                TODO: times are not relevant without the days selection as an option, 
                                <FormGroup
                                    style={{ alignItems:"center" }}
                                >
                                    <FormField
                                        label={"Class Start Time"}
                                        placeholder={"Enter Teaching Assistant's Email ID"}
                                    />
                                    <TimePicker
                                        showSecond={false}
                                        defaultValue={moment(classStartTime)}
                                        onChange={(value) => setClassStartTime(value.format('HH:mm'))}
                                    />
                                    <FormField
                                        label={"Class End Time"}
                                        placeholder={"Enter Teaching Assistant's Email ID"}
                                    />
                                    <TimePicker
                                        showSecond={false}
                                        defaultValue={classEndTime ? moment(classEndTime) : undefined}
                                        onChange={(value) => setClassEndTime(value.format('HH:mm'))}
                                    />  
                                </FormGroup>
                                */
                           }
                            <FormGroup
                                style={{ alignItems:"center" }}
                            >
                                <Label>Select Course Start Date</Label>
                                {/*<DatePickerComponent onChange={setStartDate} date={startDate}/>*/}
                                <DatePickerComponent onChange={setStartDate} defaultDate={startDate}/>
                                <Label>Select Course End Date</Label>
                                {/*<DatePickerComponent onChange={setEndDate} date={endDate}/>*/}
                                <DatePickerComponent onChange={setEndDate} defaultDate={endDate}/>
                            </FormGroup>
                            <Form.Field style={{minHeight:"200px"}}/>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={() => console.log(formRef.current.handleSubmit())}>Update Course</Button>
                    <Button negative onClick={ () => {
                                                setOpen(false);
                                                setCourseName("");
                                                setCourseCode("");
                                                setTaEmail("");
                                                setTaName("");
                                                setCourseDesc("");
                                            }
                                        }>Cancel</Button>
                </Modal.Actions>
            </Modal>)}
        {<Modal open={feedbackModalOpen}>
                <Modal.Content>
                        <Message>
                            {
                                okayType != "success" &&
                                <Icon name="warning circle" size={"big"}></Icon>
                            }
                            <Divider/>
                            <Message.Content>
                                {
                                    okayType == "warn" && "Attention: Warning"
                                }
                                {
                                    (okayType != "warn" && okayType != "success") && "Oops! Sorry, Error Occurred!"
                                }
                                {
                                    okayType == "success" && "Yay!"
                                }
                                {/*<Message.Header>{okayType == "warn" ?  "Attention: Warning" : (okayType == "success" ? "Yay!" : "Oops! Sorry, Error Occurred!")}</Message.Header>*/}
                                {
                                    feedbackModalMessage.split("\n").map(
                                        (v) => <p key={v}>{v}</p>
                                    )
                                }
                            </Message.Content>
                        </Message>
                </Modal.Content>
                <Modal.Actions>
                        <Button onClick={() => {
                                if (okayType == "success"){
                                    setCourseCreated(true)
                                }else if (okayType == "inmotion"){
                                    setFeedbackModalMessage("");
                                    setFeedbackModalOpen(false);
                                    setOpen(false);
                                }else{
                                    setFeedbackModalMessage("");
                                    setFeedbackModalOpen(false);
                                    setOpen(false);
                                }
                            }
                        }> 
                            {okayType == "warn" ? "Cancel" : "Ok"}
                        </Button>
                        {
                            okayType == "warn" && 
                            <Button positive onClick={() => {setIgnoreWarnings(true);formRef.current.handleSubmit()}}>
                                Update Anyway
                            </Button>
                        }
                </Modal.Actions>
            </Modal>}
        </div>
    )
}
