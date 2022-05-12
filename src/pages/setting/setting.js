import React, { useEffect, useState } from "react"
import { Button, Container, Form, Nav, Navbar } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { getUser, updateUser } from "../../redux/slices/authSlice"
import { getUserData } from "./settingProvider"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"

export default function Setting() {
    const [success, setSuccess] = useState(false)
    const user_detail = useSelector(getUser)
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const dispatch = useDispatch()
    const [ profileDetail, setProfileDetail ] = useState({
        email:"",
        userType:"",
        name:"",
        sex:"",
        phoneNumber: "",
        address: "",
        age: 0
    })
    useEffect(()=>{
        async function init() {
            await getUserProfile()
            setSuccess(true)
        }
        init()
    },[])
    
    return(
        !success ?
        <Container className="center-screen">
            Loading
        </Container>
        :
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                <Navbar.Brand onClick={()=>{history.push('/')}}>แก้ไขโปรไฟล์</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link onClick={()=>{history.push('/')}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>อีเมล</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" value={profileDetail.email} disabled/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>ประเภทผู้ใช้</Form.Label>
                        <Form.Control type="text" placeholder="User Type" value={profileDetail.userType} disabled/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>ชื่อ</Form.Label>
                        <Form.Control type="text" placeholder="ชื่อ" value={profileDetail.name} onChange={(e)=>{
                            setProfileDetail(prevForm => ({
                                ...prevForm,
                                name: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicSex">
                        <Form.Label>เพศ</Form.Label>
                        <Form.Select aria-label="เพศ" value={profileDetail.sex} onChange={(e)=>{
                            setProfileDetail(prevForm => ({
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
                        <Form.Control type="text" placeholder="เบอร์โทร" value={profileDetail.phoneNumber} onChange={(e)=>{
                            setProfileDetail(prevForm => ({
                                ...prevForm,
                                phoneNumber: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicAddress">
                        <Form.Label>ที่อยู่</Form.Label>
                        <Form.Control type="text" placeholder="ที่อยู่" value={profileDetail.address} onChange={(e)=>{
                            setProfileDetail(prevForm => ({
                                ...prevForm,
                                address: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicAge">
                        <Form.Label>อายุ</Form.Label>
                        <Form.Control type="number" placeholder="อายุ" value={profileDetail.age} onChange={(e)=>{
                            setProfileDetail(prevForm => ({
                                ...prevForm,
                                age: e.target.value
                            }))
                        }}/>
                    </Form.Group>
                    <Button variant="primary" type="button" onClick={()=>{updareProfile()}}>
                        บันทึก
                    </Button>
                </Form>
            </Container>
        </>
    )

    async function getUserProfile() {
        setProfileDetail(await getUserData(user_detail.uid))
    }

    async function updareProfile() {
        const userinfo = profileDetail
        try {
            dispatch(updateUser(userinfo))
            MySwal.fire({
                icon: 'success',
                title: `อัพเดทโปรไฟล์`,
                text: `อัพเดทโปรไฟล์สำเร็จ`
            })
        } catch (error) {
            MySwal.fire({
                icon: 'error',
                title: `อัพเดทโปรไฟล์`,
                text: `${error.message}`
            })
        }
    }
}