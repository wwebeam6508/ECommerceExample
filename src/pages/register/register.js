
import { isEmpty } from "@firebase/util"
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"
import {  doc, getFirestore, setDoc, Timestamp } from "firebase/firestore"
import React, { useState } from "react"
import { Button, Container, Form, Nav, Navbar } from "react-bootstrap"
import { useHistory } from "react-router-dom/cjs/react-router-dom.min"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function Register() {
    const history = useHistory()
    const MySwal = withReactContent(Swal)
    const [ registerProfile, setRegisterProfile ] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        sex: "",
        userType: "user",
        age: "",
        address: ""
    })
    return(
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand onClick={()=>{history.push('/')}}>สมัครสมาชิก</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link onClick={()=>{history.push('/login')}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>อีเมล</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" value={registerProfile.email} onChange={(e)=>{
                            setRegisterProfile(prevForm => ({
                                ...prevForm,
                                email: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>รหัส</Form.Label>
                        <Form.Control type="text" placeholder="รหัส" value={registerProfile.password} onChange={(e)=>{
                            setRegisterProfile(prevForm => ({
                                ...prevForm,
                                password: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>ชื่อ</Form.Label>
                        <Form.Control type="text" placeholder="ชื่อ" value={registerProfile.name} onChange={(e)=>{
                            setRegisterProfile(prevForm => ({
                                ...prevForm,
                                name: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicSex">
                        <Form.Label>เพศ</Form.Label>
                        <Form.Select aria-label="เพศ" value={registerProfile.sex} onChange={(e)=>{
                            setRegisterProfile(prevForm => ({
                                ...prevForm,
                                sex: e.target.value
                            }))
                        }}>
                            <option value="ชาย">ชาย</option>
                            <option value="หญิง">หญิง</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPhone">
                        <Form.Label>เบอร์โทร</Form.Label>
                        <Form.Control type="text" placeholder="เบอร์โทร" value={registerProfile.phoneNumber} onChange={(e)=>{
                            setRegisterProfile(prevForm => ({
                                ...prevForm,
                                phoneNumber: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicAddress">
                        <Form.Label>ที่อยู่</Form.Label>
                        <Form.Control type="text" placeholder="ที่อยู่" value={registerProfile.address} onChange={(e)=>{
                            setRegisterProfile(prevForm => ({
                                ...prevForm,
                                address: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicAge">
                        <Form.Label>อายุ</Form.Label>
                        <Form.Control type="number" placeholder="อายุ" value={registerProfile.age} onChange={(e)=>{
                            setRegisterProfile(prevForm => ({
                                ...prevForm,
                                age: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Button variant="primary" type="button" onClick={()=>{checkempty()}}>
                        สมัคร
                    </Button>
                </Form>
            </Container>
        </>
    )

    function checkempty(){
        if(isEmpty(registerProfile.email) || isEmpty(registerProfile.password)){
            MySwal.fire({
                icon: 'warning',
                title: `โปรดกรอกรหัสหรืออีเมลให้ถูกต้อง`
            })
        } else {
            if(isEmpty(registerProfile.name)){
                MySwal.fire({
                    icon: 'warning',
                    title: `โปรดกรอกชื่อ`
                })
                
            }else{
                register()
            }
        }
    }


    async function register() {
        const auth = getAuth()
        createUserWithEmailAndPassword(auth, registerProfile.email, registerProfile.password)
        .then(async (userCredential) => {
            // Signed in 
            const uid = userCredential.user.uid
            const db = getFirestore()
            const userRef = doc(db, 'users', uid)
            await setDoc(userRef, {
                name: registerProfile.name,
                email: registerProfile.email,
                phoneNumber: registerProfile.phoneNumber,
                sex: registerProfile.sex,
                userType: "user",
                age: registerProfile.age,
                address: registerProfile.address,
                dateCreated: Timestamp.fromDate(new Date())
            }).then(()=>{
                MySwal.fire({
                    icon: 'success',
                    title: `สมัครสมาชิก`,
                    text: "สมัครสำเร็จ"
                })
            })
        })
        .catch((error) => {
            MySwal.fire({
                icon: 'error',
                title: `สมัครสมาชิก`,
                text: error.message
            })
            // ..
        })
    }
}