import React, { useEffect, useState, useSyncExternalStore } from "react"
import { Button, Container, Form, Nav, Navbar, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from "react-router-dom"
import { getUser } from "../../../redux/slices/authSlice"
import { collection, doc, getDocs, getFirestore, orderBy, query, setDoc, Timestamp, where } from "firebase/firestore"
import Modal from 'react-modal'
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth"
import { firebaseConfig } from "../../../firebase/firebaseConfig"
import * as firebase from 'firebase/app'

export default function HR() {
    const [success, setSuccess] = useState(false)
    const user_detail = useSelector(getUser)
    const MySwal = withReactContent(Swal)
    const history = useHistory()
    const dispatch = useDispatch()
    const [ modalIsOpen, setIsOpen] = useState(false)
    const [ users, setUsers ] = useState([])
    const [ profileModal, setProfileModal ] = useState({
        email:"",
        password: "",
        userType:"admin",
        name:"",
        sex:"ชาย",
        phoneNumber: "",
        address: "",
        age: 0
    })
    useEffect(()=>{
        async function init() {
            await getUserAdmin()
            setSuccess(true)
        }
        init()
    },[])
    Modal.setAppElement('body')
    return(
        !success ?
        <Container className="center-screen">
            Loading
        </Container>
        :
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand onClick={()=>{history.push('/')}}>จัดการพนักงาน</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link onClick={()=>{history.push('/admin')}}>ย้อนกลับ</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop:"10px"}}>
                <Button onClick={openModal}>เพิ่ม</Button>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>อีเมล</th>
                        <th>ชื่อ</th>
                        <th>เบอร์โทร</th>
                        <th>เพศ</th>
                        <th>ที่อยู่</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users && users.map((user,index)=>{
                                return (
                                    user_detail.email != user.email ?
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{user.email}</td>
                                        <td>{user.name}</td>
                                        <td>{user.phoneNumber}</td>
                                        <td>{user.sex}</td>
                                        <td>{user.address}</td>
                                    </tr>
                                    :
                                    <></>
                                )
                            })
                        }
                    </tbody>
                </Table>
                <Modal
                    isOpen={modalIsOpen}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={closeModal}
                    contentLabel="Adder"
                >
                        <h2 >เพิ่มพนักงาน</h2>
                        <button onClick={closeModal}>close</button>
                        <Container style={{marginTop:"10px"}}>
                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>อีเมล</Form.Label>
                                <Form.Control type="email" placeholder="Enter email" value={profileModal.email} onChange={(e)=>{
                                    setProfileModal(prevForm => ({
                                        ...prevForm,
                                        email: e.target.value
                                    }))
                                }}/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>รหัส</Form.Label>
                                <Form.Control type="password" placeholder="Enter Password" value={profileModal.password} onChange={(e)=>{
                                    setProfileModal(prevForm => ({
                                        ...prevForm,
                                        password: e.target.value
                                    }))
                                }}/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicName">
                                <Form.Label>ชื่อ</Form.Label>
                                <Form.Control type="text" placeholder="ชื่อ" value={profileModal.name} onChange={(e)=>{
                                    setProfileModal(prevForm => ({
                                        ...prevForm,
                                        name: e.target.value
                                    }))
                                }}/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicSex">
                                <Form.Label>เพศ</Form.Label>
                                <Form.Select aria-label="เพศ" value={profileModal.sex} onChange={(e)=>{
                                    setProfileModal(prevForm => ({
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
                                <Form.Control type="text" placeholder="เบอร์โทร" value={profileModal.phoneNumber} onChange={(e)=>{
                                    setProfileModal(prevForm => ({
                                        ...prevForm,
                                        phoneNumber: e.target.value
                                    }))
                                }}/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicAddress">
                                <Form.Label>ที่อยู่</Form.Label>
                                <Form.Control type="text" placeholder="ที่อยู่" value={profileModal.address} onChange={(e)=>{
                                    setProfileModal(prevForm => ({
                                        ...prevForm,
                                        address: e.target.value
                                    }))
                                }}/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicAge">
                                <Form.Label>อายุ</Form.Label>
                                <Form.Control type="number" placeholder="อายุ" value={profileModal.age} onChange={(e)=>{
                                    setProfileModal(prevForm => ({
                                        ...prevForm,
                                        age: e.target.value
                                    }))
                                }}/>
                            </Form.Group>
                            <Button variant="primary" type="button" onClick={async ()=>{await addAdmin()}}>
                                บันทึก
                            </Button>
                        </Form>
                        </Container>
                </Modal>
            </Container>
        </>
    )

    function openModal() {
        setIsOpen(true);
        setProfileModal({
            email:"",
            userType:"admin",
            name:"",
            sex:"ชาย",
            phoneNumber: "",
            address: "",
            age: 0
        })
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    async function closeModal() {
        await getUserAdmin()
        setIsOpen(false)
    }
    
    async function getUserAdmin() {
        const db = getFirestore()
        const usersRef = collection(db, "users")
        const userQuery = query(usersRef, where("userType","==","admin"), orderBy("dateCreated", "desc"))
        const usersDoc = await getDocs(userQuery)
        const userlist = []
        usersDoc.forEach((doc)=>{
            userlist.push(doc.data())
        })
        setUsers(userlist)
    }

    async function addAdmin(){
        const db = getFirestore()
        const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary")
        const auth = getAuth(secondaryApp)
        createUserWithEmailAndPassword(auth, profileModal.email, profileModal.password).then(async (userCredential) => {
            const user = userCredential.user
            await setDoc(doc(db, "users", user.uid), {
                name: profileModal.name,
                email: profileModal.email,
                phoneNumber: profileModal.phoneNumber,
                sex: profileModal.sex,
                userType: "admin",
                age: profileModal.age,
                address: profileModal.address,
                dateCreated: Timestamp.fromDate(new Date())
            }).then(()=>{
                MySwal.fire({
                    icon: 'success',
                    title: `เพิ่มพนักงาน`,
                    text: `เพิ่มพนักงานสำเร็จ`
                })
                signOut(auth).then(()=>{
                    closeModal()
                })
            }).catch((error)=>{
                MySwal.fire({
                    icon: 'error',
                    title: `เพิ่มพนักงาน`,
                    text: error.message
                })
            })
        })
        .catch((error) => {
            MySwal.fire({
                icon: 'error',
                title: `เพิ่มพนักงาน`,
                text: error.message
            })
        })
    }
}